import { calendarFixture } from '../helpers/holiday-fixture';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { runRegression } from '../../scripts/test-ai-holidays';
import { prepareNotificationTest } from '../../scripts/test-holiday-notification';
import { readBlocks } from '../../scripts/holidays/update';

const source = calendarFixture();
const year = 2026;
const baseline = readBlocks(source).find(b => b.year === year)!;
const sources = [
  {
    url: 'https://www.gov.cn/zhengce/notice.htm',
    text: '离线回归测试固定原文。',
  },
];
const fixture = () => ({
  year,
  holidays: baseline.holidays.map(h => ({
    id: h.id,
    rest: h.rest.map(day => [day, day]),
    work: h.work,
    inLieu: h.inLieu,
    basis: '固定的离线测试数据，无真实 API 调用。',
    evidence: [{ url: sources[0].url, quote: sources[0].text }],
  })),
});
let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'calendar-regression-test-'));
  fs.mkdirSync(path.join(root, 'src/holidays'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/holidays/generate.ts'), source);
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

it('recreates an existing year in isolation and writes a matching report', async () => {
  const result = await runRegression({
    root,
    year,
    sources,
    extraction: fixture(),
  });
  expect(result).toMatchObject({
    success: true,
    repositoryUnchanged: true,
    differences: [],
  });
  expect(
    fs.readFileSync(path.join(root, 'src/holidays/generate.ts'), 'utf8')
  ).toBe(source);
  expect(
    fs.existsSync(path.join(root, 'cache/ai-regression-2026/report.md'))
  ).toBe(true);
});
it('fails on a calendar difference even when generic date validation passes', async () => {
  const extraction = fixture();
  extraction.holidays
    .find(h => h.id === 'ny')!
    .rest.push(['2026-01-10', '2026-01-10']);
  const result = await runRegression({ root, year, sources, extraction });
  expect(result.success).toBe(false);
  expect(result.differences).toEqual([
    expect.objectContaining({ holiday: 'ny', field: 'rest' }),
  ]);
  expect(result.repositoryUnchanged).toBe(true);
});
it('reports invalid model output without changing the calendar', async () => {
  const result = await runRegression({
    root,
    year,
    sources,
    extraction: { invalid: true },
  });
  expect(result).toMatchObject({ success: false, repositoryUnchanged: true });
  expect(
    JSON.parse(
      fs.readFileSync(
        path.join(root, 'cache/ai-regression-2026/summary.json'),
        'utf8'
      )
    ).success
  ).toBe(false);
});
it('requires an existing regression baseline', async () => {
  await expect(
    runRegression({ root, year: 2027, sources, extraction: fixture() })
  ).rejects.toThrow('not recorded');
});

it('prepares only an explicitly labelled test record and PR body after successful regression', async () => {
  const result = await prepareNotificationTest({
    root,
    year,
    runId: '12345',
    runAttempt: '1',
    sources,
    extraction: fixture(),
  });
  expect(result).toMatchObject({
    updated: true,
    branch: 'codex/holiday-e2e-12345',
    nextYear: 2027,
  });
  const receipt = JSON.parse(
    fs.readFileSync(path.join(root, 'data/holiday-e2e/12345.json'), 'utf8')
  );
  expect(receipt).toMatchObject({
    testOnly: true,
    regressionYear: 2026,
    calendarUnchanged: true,
    differences: [],
  });
  expect(fs.readFileSync(result.report, 'utf8')).toContain(
    '测试草稿 PR，请勿合并'
  );
  expect(
    fs.readFileSync(path.join(root, 'src/holidays/generate.ts'), 'utf8')
  ).toBe(source);
  expect(fs.existsSync(path.join(root, 'data/holiday-reviews/2026.json'))).toBe(
    false
  );
});

it('does not prepare notification changes if the date comparison fails', async () => {
  const extraction = fixture();
  extraction.holidays
    .find(h => h.id === 'ny')!
    .rest.push(['2026-01-10', '2026-01-10']);
  await expect(
    prepareNotificationTest({
      root,
      year,
      runId: '12345',
      runAttempt: '1',
      sources,
      extraction,
    })
  ).rejects.toThrow('passing AI regression');
  expect(fs.existsSync(path.join(root, 'data/holiday-e2e'))).toBe(false);
});

it('rejects unsafe run identities before any external call or file write', async () => {
  await expect(
    prepareNotificationTest({ root, year, runId: '../bad', runAttempt: '1' })
  ).rejects.toThrow('Invalid GitHub run identity');
  expect(fs.existsSync(path.join(root, 'cache'))).toBe(false);
});
