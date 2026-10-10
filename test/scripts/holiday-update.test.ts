import fs from 'fs';
import os from 'os';
import path from 'path';
import axios from 'axios';
import Arrangement, { Holiday } from '../../src/holidays/arrangement';
import {
  date,
  parseExtraction,
  readBlocks,
  renderChain,
  renderReport,
  appendYear,
  selectNewYear,
  validateAIDecisions,
  validateCalendar,
  validateSources,
  type Decision,
  type Review,
} from '../../scripts/holidays/update';
import { holidayPolicy } from '../../scripts/holidays/policy';
import { extractWithAI, runUpdate } from '../../scripts/auto-update-holidays';

jest.mock('axios');
const post = axios.post as jest.Mock;
const source = fs.readFileSync(
  path.join(__dirname, '../../src/holidays/generate.ts'),
  'utf8'
);
const currentBlock = readBlocks(source).find(b => b.year === 2026)!;
const previous = currentBlock.holidays;
const historicalSource =
  source.slice(0, currentBlock.start) + source.slice(currentBlock.end);
const url = 'https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm';
const notices = [
  [
    'ny',
    '2026-01-01',
    '2026-01-03',
    ['2026-01-04'],
    '元旦：1月1日至3日放假调休，1月4日上班。',
  ],
  [
    's',
    '2026-02-15',
    '2026-02-23',
    ['2026-02-14', '2026-02-28'],
    '春节：2月15日至23日放假调休，2月14日、2月28日上班。',
  ],
  ['t', '2026-04-04', '2026-04-06', [], '清明节：4月4日至6日放假。'],
  [
    'l',
    '2026-05-01',
    '2026-05-05',
    ['2026-05-09'],
    '劳动节：5月1日至5日放假调休，5月9日上班。',
  ],
  ['d', '2026-06-19', '2026-06-21', [], '端午节：6月19日至21日放假。'],
  ['m', '2026-09-25', '2026-09-27', [], '中秋节：9月25日至27日放假。'],
  [
    'n',
    '2026-10-01',
    '2026-10-07',
    ['2026-09-20', '2026-10-10'],
    '国庆节：10月1日至7日放假调休，9月20日、10月10日上班。',
  ],
] as const;
const sources = validateSources([
  { url, text: notices.map(n => n[4]).join('\n') },
]);
const fixture = (): {
  year: number;
  holidays: {
    id: string;
    rest: string[][];
    work: string[];
    inLieu: string[];
    basis: string;
    evidence: { url: string; quote: string }[];
  }[];
} => ({
  year: 2026,
  holidays: notices.map(([id, start, end, work, quote]) => ({
    id,
    rest: [[start, end]],
    work: [...work],
    inLieu: [...(previous.find(h => h.id === id)?.inLieu ?? [])],
    basis: '根据法定天数、周末与补假顺序，剩余工作日为调休放假。',
    evidence: [{ url, quote }],
  })),
});
const parsed = () => parseExtraction(fixture(), 2026, sources);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('official facts and calendar validation', () => {
  it('extracts rest/work facts and AI inLieu decisions with exact evidence', () => {
    const holidays = parsed();
    expect(holidays.find(h => h.id === 's')!.rest).toHaveLength(9);
    expect(holidays.find(h => h.id === 's')!.work).toEqual([
      '2026-02-14',
      '2026-02-28',
    ]);
    expect(holidays.find(h => h.id === 'ny')!.inLieu).toEqual(['2026-01-02']);
  });
  it.each([
    '2026-02-29',
    '2026-13-01',
    '2026-04-31',
    '2027-01-01',
    '2026-1-01',
  ])('rejects impossible/noncanonical/out-of-year date %s', value => {
    expect(() => date(value, 2026)).toThrow();
  });
  it('accepts leap day in a leap year', () => {
    expect(date('2024-02-29', 2024)).toBe('2024-02-29');
  });
  it('rejects missing annual holidays, duplicates and AI-generated extra fields', () => {
    const incomplete = fixture();
    incomplete.holidays.pop();
    expect(() => parseExtraction(incomplete, 2026, sources)).toThrow(
      'Incomplete'
    );
    const duplicate = fixture();
    duplicate.holidays.push(duplicate.holidays[0]);
    expect(() => parseExtraction(duplicate, 2026, sources)).toThrow(
      'Duplicate holiday'
    );
    const extra = fixture();
    Object.assign(extra.holidays[0], { executableCode: 'anything' });
    expect(() => parseExtraction(extra, 2026, sources)).toThrow(
      'Expected fields'
    );
    expect(() =>
      parseExtraction(
        { ...fixture(), code: 'console.log("unexpected")' },
        2026,
        sources
      )
    ).toThrow();
  });
  it('rejects untraceable evidence and non-government source URLs', () => {
    const input = fixture();
    input.holidays[0].evidence[0].quote = '这段文字不在公告中';
    expect(() => parseExtraction(input, 2026, sources)).toThrow(
      'exact notice excerpt'
    );
    expect(() =>
      validateSources([
        { url: 'https://gov.cn.example.com/notice', text: 'notice' },
      ])
    ).toThrow();
    expect(() =>
      validateSources([{ url: 'https://user@gov.cn/notice', text: 'notice' }])
    ).toThrow();
  });
  it('reports the holiday when policy metadata is cited as notice evidence or an empty holiday is added', () => {
    const wrongSource = fixture();
    wrongSource.holidays[0].evidence[0].url = holidayPolicy(2026).source;
    expect(() => parseExtraction(wrongSource, 2026, sources)).toThrow(
      'ny: Evidence URL must come from the notice sources'
    );
    const emptyHoliday = fixture();
    emptyHoliday.holidays.push({
      id: 'a',
      rest: [],
      work: [],
      inLieu: [],
      basis: 'No holiday was announced',
      evidence: [],
    });
    expect(() => parseExtraction(emptyHoliday, 2026, sources)).toThrow(
      'a: Missing rest ranges'
    );
  });
  it('rejects reversed/overlapping ranges and cross-holiday rest/work conflicts', () => {
    const reversed = fixture();
    reversed.holidays[0].rest = [['2026-01-03', '2026-01-01']];
    expect(() => parseExtraction(reversed, 2026, sources)).toThrow('Reversed');
    const overlap = fixture();
    overlap.holidays[0].rest.push(['2026-01-02', '2026-01-03']);
    expect(() => parseExtraction(overlap, 2026, sources)).toThrow(
      'Overlapping'
    );
    const conflict = fixture();
    conflict.holidays[1].work.push('2026-01-01');
    expect(() => parseExtraction(conflict, 2026, sources)).toThrow(
      'rest/work conflict'
    );
  });
  it('validates every existing historical year against rest/work/inLieu invariants', () => {
    for (const block of readBlocks(source))
      expect(() => validateCalendar(block.holidays)).not.toThrow();
  });
});

describe('AI inLieu decisions and statutory validation', () => {
  it('uses the existing holiday-day definition for both counts and date ranges', () => {
    const original = Arrangement.prototype.getHolidayDays;
    const reader = jest
      .spyOn(Arrangement.prototype, 'getHolidayDays')
      .mockImplementation(function (this: Arrangement, year, holiday) {
        return holiday === Holiday.L ? 1 : original.call(this, year, holiday);
      });
    try {
      const policy = holidayPolicy(2026);
      expect(policy.standardDays.l).toBe(1);
      expect(policy.statutory.l).toEqual(['2026-05-01']);
      expect(policy.standardDays.s).toBe(4);
    } finally {
      reader.mockRestore();
    }
  });
  it('uses the pre-2025 rules for 2024 regression tests', () => {
    const policy = holidayPolicy(2024);
    expect(policy.standardDays.s).toBe(3);
    expect(policy.standardDays.l).toBe(1);
    expect(policy.statutory.s).toEqual([
      '2024-02-10',
      '2024-02-11',
      '2024-02-12',
    ]);
    expect(policy.statutory.l).toEqual(['2024-05-01']);
    const historical = readBlocks(source)
      .find(b => b.year === 2024)!
      .holidays.map(h => ({ ...h, basis: 'Historical regression fixture' }));
    expect(() => validateAIDecisions(historical, 2024)).not.toThrow();
  });
  it('uses standard counts and exact statutory dates, including lunar New Year eve', () => {
    const policy = holidayPolicy(2026);
    expect(policy.standardDays).toEqual({
      ny: 1,
      s: 4,
      t: 1,
      l: 2,
      d: 1,
      n: 3,
      m: 1,
    });
    expect(policy.statutory.s).toEqual([
      '2026-02-16',
      '2026-02-17',
      '2026-02-18',
      '2026-02-19',
    ]);
    expect(policy.statutory.t).toEqual(['2026-04-05']);
    expect(policy.statutory.m).toEqual(['2026-09-25']);
  });
  it('accepts AI decisions matching 2026 including weekend compensation', () => {
    const decisions = validateAIDecisions(parsed(), 2026);
    expect(decisions.find(h => h.id === 's')!.inLieu).toEqual([
      '2026-02-20',
      '2026-02-23',
    ]);
    expect(decisions.find(h => h.id === 'l')!.inLieu).toEqual(['2026-05-05']);
    expect(decisions.find(h => h.id === 't')!.inLieu).toEqual([]);
  });
  it.each(['2026-01-01', '2026-01-03', '2026-01-04'])(
    'rejects statutory/weekend/work dates as inLieu: %s',
    day => {
      const holidays = parsed();
      holidays[0].inLieu = [day];
      expect(() => validateAIDecisions(holidays, 2026)).toThrow();
    }
  );
  it('rejects wrong counts and assigning compensatory rest to inLieu', () => {
    const wrongCount = parsed();
    wrongCount[0].inLieu = [];
    expect(() => validateAIDecisions(wrongCount, 2026)).toThrow(
      'expected inLieu'
    );
    const wrongDate = parsed();
    wrongDate.find(h => h.id === 'l')!.inLieu = ['2026-05-04'];
    expect(() => validateAIDecisions(wrongDate, 2026)).toThrow(
      'expected inLieu'
    );
  });
  it('counts overlapping National Day and Mid-autumn entitlements separately', () => {
    const historical = readBlocks(source)
      .find(b => b.year === 2025)!
      .holidays.map(h => ({ ...h, basis: 'test' }));
    expect(() => validateAIDecisions(historical, 2025)).not.toThrow();
    historical.find(h => h.id === 'n')!.inLieu.push('2025-10-06');
    expect(() => validateAIDecisions(historical, 2025)).toThrow(
      'statutory days'
    );
  });
  it('rejects missing statutory dates instead of silently accepting an incomplete break', () => {
    const holidays = parsed();
    holidays[0].rest = ['2026-01-02', '2026-01-03'];
    expect(() => validateAIDecisions(holidays, 2026)).toThrow(
      'missing statutory'
    );
  });
  it('preserves two holiday entitlements when Mid-autumn falls on October 1', () => {
    // Synthetic 2031 break to exercise the collision; not a published schedule.
    const holidays: Decision[] = [
      {
        id: 'n' as const,
        rest: Array.from({ length: 8 }, (_, i) => `2031-10-0${i + 1}`),
        work: ['2031-09-27', '2031-10-11'],
        inLieu: ['2031-10-07', '2031-10-08'],
        basis: 'test',
        evidence: [],
      },
      {
        id: 'm' as const,
        rest: ['2031-10-01'],
        work: [],
        inLieu: [],
        basis: 'test',
        evidence: [],
      },
    ];
    expect(holidayPolicy(2031).statutory.m).toEqual(['2031-10-01']);
    expect(() => validateAIDecisions(holidays, 2031)).not.toThrow();
    holidays[0].inLieu.unshift('2031-10-06');
    expect(() => validateAIDecisions(holidays, 2031)).toThrow(
      'expected inLieu'
    );
  });
});

describe('deterministic generation and year isolation', () => {
  it('preserves compact .r/.w/.i syntax with one line per holiday', () => {
    const chain = renderChain(2026, validateAIDecisions(parsed(), 2026));
    expect(chain).toContain('arrangement.y(2026)\n');
    expect(chain).toContain(
      '    .s().r(2, 15).to(2, 23).w(2, 14).w(2, 28).i(2, 20).i(2, 23)'
    );
    expect(chain.split('\n')).toHaveLength(8);
  });
  it('selects only the next year and recognizes existing multiline years', () => {
    expect(selectNewYear(source)).toEqual({ year: 2027, existing: false });
    expect(selectNewYear(source, 2026)).toEqual({ year: 2026, existing: true });
    expect(
      selectNewYear(
        source.replace('arrangement.y(2025)', 'arrangement\n    .y(2025)'),
        2025
      ).existing
    ).toBe(true);
    expect(() => selectNewYear(source, 2028)).toThrow('Only the next year');
  });
  it('refuses to replace an existing year even with confirmed decisions', () => {
    expect(() =>
      appendYear(source, 2026, validateAIDecisions(parsed(), 2026))
    ).toThrow('historical data cannot be changed');
  });
  it('inserts a validated new year without changing any prior source content', () => {
    const decisions = validateAIDecisions(parsed(), 2026);
    const updated = appendYear(historicalSource, 2026, decisions);
    expect(readBlocks(updated)).toHaveLength(23);
    expect(updated).toContain('arrangement.y(2026)');
    for (const block of readBlocks(historicalSource)) {
      const retained = readBlocks(updated).find(b => b.year === block.year)!;
      expect(updated.slice(retained.start, retained.end)).toBe(
        historicalSource.slice(block.start, block.end)
      );
    }
  });
  it('shows AI reasons, dates and automatic validation without manual confirmation', () => {
    const review: Review = {
      version: 2,
      year: 2026,
      sources,
      holidays: validateAIDecisions(parsed(), 2026),
    };
    const report = renderReport(review);
    expect(report).toContain('无需人工填写');
    expect(report).toContain('| 2026-01-02 | 五 | 元旦 | 放假 | 调休放假 |');
    expect(report).toContain(url);
    expect(report).toContain(notices[0][4]);
  });
});

describe('update orchestration (no external API)', () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'holiday-update-test-'));
    fs.mkdirSync(path.join(root, 'src/holidays'), { recursive: true });
    fs.mkdirSync(path.join(root, 'scripts'));
    fs.writeFileSync(
      path.join(root, 'src/holidays/generate.ts'),
      historicalSource
    );
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });
  it('skips existing years before validating sources, reading rules or calling AI', async () => {
    fs.writeFileSync(path.join(root, 'src/holidays/generate.ts'), source);
    const result = await runUpdate({
      root,
      year: 2026,
      sources: [],
      extraction: { code: 'invalid' },
    });
    expect(result).toMatchObject({
      skipped: true,
      updated: false,
      sourceUpdated: false,
    });
    expect(
      fs.readFileSync(path.join(root, 'src/holidays/generate.ts'), 'utf8')
    ).toBe(source);
    expect(fs.existsSync(path.join(root, 'data'))).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });
  it('caches validated extraction and is idempotent on repeated runs', async () => {
    const first = await runUpdate({
      root,
      year: 2026,
      sources,
      extraction: fixture(),
    });
    expect(first).toMatchObject({
      updated: true,
      sourceUpdated: true,
    });
    const second = await runUpdate({ root, year: 2026, sources });
    expect(second).toMatchObject({
      updated: false,
      sourceUpdated: false,
    });
    expect(post).not.toHaveBeenCalled();
  });
  it('automatically retries invalid AI classification using validation feedback', async () => {
    const key = process.env.AI_API_KEY;
    process.env.AI_API_KEY = 'test-key';
    try {
      const invalid = fixture();
      invalid.holidays[0].inLieu = [];
      const response = (value: unknown) => ({
        data: {
          choices: [
            {
              finish_reason: 'stop',
              message: { content: JSON.stringify(value) },
            },
          ],
        },
      });
      post
        .mockResolvedValueOnce(response(invalid))
        .mockResolvedValueOnce(response(fixture()));
      expect(await runUpdate({ root, year: 2026, sources })).toMatchObject({
        sourceUpdated: true,
      });
      expect(post).toHaveBeenCalledTimes(2);
      expect(post.mock.calls[1][1].messages[1].content).toContain(
        'expected inLieu'
      );
    } finally {
      if (key === undefined) delete process.env.AI_API_KEY;
      else process.env.AI_API_KEY = key;
    }
  });
  it('stops after three failed classifications without writing any files', async () => {
    const key = process.env.AI_API_KEY;
    process.env.AI_API_KEY = 'test-key';
    try {
      const invalid = fixture();
      invalid.holidays[0].inLieu = [];
      post.mockResolvedValue({
        data: {
          choices: [
            {
              finish_reason: 'stop',
              message: { content: JSON.stringify(invalid) },
            },
          ],
        },
      });
      await expect(runUpdate({ root, year: 2026, sources })).rejects.toThrow(
        'Automatic holiday validation failed'
      );
      expect(post).toHaveBeenCalledTimes(3);
      expect(
        fs.readFileSync(path.join(root, 'src/holidays/generate.ts'), 'utf8')
      ).toBe(historicalSource);
      expect(fs.existsSync(path.join(root, 'data'))).toBe(false);
    } finally {
      if (key === undefined) delete process.env.AI_API_KEY;
      else process.env.AI_API_KEY = key;
    }
  });
  it('does not write source or receipts when validation fails', async () => {
    const extraction = fixture();
    extraction.holidays[0].rest[0][1] = '2026-02-30';
    await expect(
      runUpdate({ root, year: 2026, sources, extraction })
    ).rejects.toThrow();
    expect(
      fs.readFileSync(path.join(root, 'src/holidays/generate.ts'), 'utf8')
    ).toBe(historicalSource);
    expect(fs.existsSync(path.join(root, 'data'))).toBe(false);
  });
  it('reuses a pending PR extraction but revalidates it against current sources', async () => {
    await runUpdate({ root, year: 2026, sources, extraction: fixture() });
    const receipt = path.join(root, 'data/holiday-reviews/2026.json');
    const cache = path.join(root, 'prior-review.json');
    fs.renameSync(receipt, cache);
    fs.writeFileSync(
      path.join(root, 'src/holidays/generate.ts'),
      historicalSource
    );
    await runUpdate({ root, year: 2026, sources, previousReview: cache });
    expect(post).not.toHaveBeenCalled();
    fs.writeFileSync(
      path.join(root, 'src/holidays/generate.ts'),
      historicalSource
    );
    const tampered = JSON.parse(fs.readFileSync(cache, 'utf8'));
    tampered.extraction.holidays[0].evidence[0].quote = '不存在的公告文字';
    fs.writeFileSync(cache, JSON.stringify(tampered));
    await expect(
      runUpdate({ root, year: 2026, sources, previousReview: cache })
    ).rejects.toThrow('exact notice excerpt');
  });
});

describe('AI response handling', () => {
  const originalKey = process.env.AI_API_KEY;
  beforeEach(() => {
    process.env.AI_API_KEY = 'test-only-key';
  });
  afterEach(() => {
    if (originalKey === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = originalKey;
  });
  it('requests JSON facts with a strict schema and no temperature or executable code', async () => {
    post.mockResolvedValue({
      data: {
        choices: [
          {
            finish_reason: 'stop',
            message: { content: JSON.stringify(fixture()) },
          },
        ],
      },
    });
    await expect(extractWithAI(2026, sources)).resolves.toEqual(fixture());
    const [, body, options] = post.mock.calls[0];
    expect(body.response_format.json_schema.strict).toBe(true);
    expect(
      body.response_format.json_schema.schema.properties.holidays.items
        .properties.id.enum
    ).not.toContain('a');
    expect(body).not.toHaveProperty('temperature');
    expect(body).not.toHaveProperty('max_tokens');
    expect(options.timeout).toBe(90000);
  });
  it.each(['length', 'content_filter'])(
    'rejects finish_reason=%s',
    async finish_reason => {
      post.mockResolvedValue({
        data: {
          choices: [
            { finish_reason, message: { content: JSON.stringify(fixture()) } },
          ],
        },
      });
      await expect(extractWithAI(2026, sources)).rejects.toThrow('truncated');
    }
  );
  it('rejects Markdown code fences and refusals', async () => {
    post.mockResolvedValue({
      data: {
        choices: [
          { finish_reason: 'stop', message: { content: '```json\n{}\n```' } },
        ],
      },
    });
    await expect(extractWithAI(2026, sources)).rejects.toThrow(
      'Invalid AI extraction'
    );
    post.mockResolvedValue({
      data: {
        choices: [
          { finish_reason: 'stop', message: { refusal: 'no', content: '{}' } },
        ],
      },
    });
    await expect(extractWithAI(2026, sources)).rejects.toThrow('refused');
  });
});
