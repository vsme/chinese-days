import { calendarFixture } from '../helpers/holiday-fixture';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import {
  holidayReleaseYear,
  nextPatch,
  prepareHolidayRelease,
  type HolidayPullRequest,
} from '../../scripts/release/prepare';
import { readBlocks } from '../../scripts/holidays/update';

const repository = 'vsme/chinese-days';
const source = calendarFixture();
const target = readBlocks(source).find(b => b.year === 2026)!;
const quote = '离线发布测试公告，不调用 AI 或 npm 发布接口。';
const sources = [{ url: 'https://www.gov.cn/zhengce/notice.htm', text: quote }];
const extraction = {
  year: 2026,
  holidays: target.holidays.map(h => ({
    id: h.id,
    rest: h.rest.map(day => [day, day]),
    work: h.work,
    inLieu: h.inLieu,
    basis: '离线已验证的日期样例。',
    evidence: [{ url: sources[0].url, quote }],
  })),
};
const basePR = (): HolidayPullRequest => ({
  number: 99,
  title: '新增 2026 年假期配置',
  merged: true,
  draft: false,
  merge_commit_sha: 'a'.repeat(40),
  head: { ref: 'auto-update-holidays-2026', repo: { full_name: repository } },
  base: { ref: 'main', repo: { full_name: repository } },
  files: [
    {
      filename: 'src/holidays/generate.ts',
      status: 'modified',
      patch: '@@\n+  arrangement.y(2026)\n',
    },
    { filename: 'data/holiday-reviews/2026.json', status: 'added' },
  ],
});
function git(root: string, ...args: string[]) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
function put(root: string, name: string, value: unknown) {
  const file = path.join(root, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n'
  );
}

describe('release eligibility', () => {
  it('accepts only a merged production holiday PR', () =>
    expect(holidayReleaseYear(basePR(), repository)).toBe(2026));
  it.each([
    'unmerged',
    'draft',
    'test-title',
    'test-branch',
    'fork',
    'other-base',
  ])('ignores %s without preparing a release', kind => {
    const pr = basePR();
    if (kind === 'unmerged') pr.merged = false;
    if (kind === 'draft') pr.draft = true;
    if (kind === 'test-title') pr.title = '[TEST] 请勿合并';
    if (kind === 'test-branch') pr.head.ref = 'codex/holiday-e2e-123';
    if (kind === 'fork') pr.head.repo = { full_name: 'someone/chinese-days' };
    if (kind === 'other-base') pr.base.ref = 'develop';
    expect(holidayReleaseYear(pr, repository)).toBeNull();
  });
  it('rejects unrelated file changes and missing added-year evidence', () => {
    const extra = basePR();
    extra.files.push({
      filename: 'scripts/auto-update-holidays.ts',
      status: 'modified',
    });
    expect(() => holidayReleaseYear(extra, repository)).toThrow('only change');
    const existing = basePR();
    existing.files[0].patch = '@@\n- old\n+ modified old year';
    expect(() => holidayReleaseYear(existing, repository)).toThrow(
      'does not add'
    );
  });
  it.each(['1.5.9', '0.0.0', '1.9.99'])(
    'increments only patch for %s',
    version => {
      const pieces = version.split('.');
      expect(nextPatch(version)).toBe(
        `${pieces[0]}.${pieces[1]}.${Number(pieces[2]) + 1}`
      );
    }
  );
  it.each(['1.5.9-beta.1', 'v1.5.9', '1.5', '01.5.9', '1.5.9007199254740991'])(
    'rejects unsupported version %s',
    version => expect(() => nextPatch(version)).toThrow()
  );
});

describe('version preparation with real temporary Git repositories', () => {
  let sandbox: string, root: string, remote: string, pr: HolidayPullRequest;
  beforeEach(() => {
    sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'holiday-release-test-'));
    root = path.join(sandbox, 'work');
    remote = path.join(sandbox, 'remote.git');
    fs.mkdirSync(root);
    git(root, 'init', '-b', 'main');
    git(root, 'config', 'user.name', 'Release Test');
    git(root, 'config', 'user.email', 'release@example.invalid');
    put(root, '.gitignore', 'dist/\nnode_modules/\n');
    put(root, 'package.json', {
      name: 'chinese-days',
      version: '1.5.9',
      files: ['dist'],
    });
    put(root, 'package-lock.json', {
      name: 'chinese-days',
      version: '1.5.9',
      lockfileVersion: 3,
      packages: { '': { name: 'chinese-days', version: '1.5.9' } },
    });
    put(root, 'CHANGELOG.md', '# CHANGELOG\n\n## 1.5.9\n\nPrevious release.\n');
    put(
      root,
      'src/holidays/generate.ts',
      source.slice(0, target.start) + source.slice(target.end)
    );
    git(root, 'add', '.');
    git(root, 'commit', '-m', 'baseline');
    put(root, 'src/holidays/generate.ts', source);
    put(root, 'data/holiday-reviews/2026.json', {
      version: 2,
      extraction,
      review: { version: 2, year: 2026, sources },
    });
    git(root, 'add', '.');
    git(root, 'commit', '-m', 'merge annual holiday PR');
    pr = { ...basePR(), merge_commit_sha: git(root, 'rev-parse', 'HEAD') };
    git(root, 'init', '--bare', remote);
    git(root, 'remote', 'add', 'origin', remote);
    git(root, 'push', 'origin', 'main');
    git(root, '--git-dir', remote, 'symbolic-ref', 'HEAD', 'refs/heads/main');
  });
  afterEach(() => fs.rmSync(sandbox, { recursive: true, force: true }));
  function commitPlan() {
    git(
      root,
      'add',
      'package.json',
      'package-lock.json',
      'CHANGELOG.md',
      'data/holiday-releases/2026.json'
    );
    git(root, 'commit', '-m', 'chore(release): v1.5.10');
    return git(root, 'rev-parse', 'HEAD');
  }
  it('updates package, lockfile and changelog exactly once, then atomically pushes a matching tag', () => {
    const plan = prepareHolidayRelease(root, pr, repository, '2026-10-10')!;
    expect(plan).toMatchObject({
      changed: true,
      version: '1.5.10',
      tag: 'v1.5.10',
    });
    const lock = JSON.parse(
      fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8')
    );
    expect(lock.version).toBe('1.5.10');
    expect(lock.packages[''].version).toBe('1.5.10');
    expect(fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8')).toContain(
      '新增 2026 年'
    );
    expect(
      fs.readFileSync(path.join(root, 'src/holidays/generate.ts'), 'utf8')
    ).toBe(source);
    const sha = commitPlan();
    git(root, 'tag', plan.tag);
    git(
      root,
      'push',
      '--atomic',
      'origin',
      'HEAD:refs/heads/main',
      `refs/tags/${plan.tag}`
    );
    expect(git(root, '--git-dir', remote, 'rev-parse', 'refs/heads/main')).toBe(
      sha
    );
    expect(
      git(root, '--git-dir', remote, 'rev-parse', `refs/tags/${plan.tag}`)
    ).toBe(sha);
    expect(prepareHolidayRelease(root, pr, repository)).toMatchObject({
      changed: false,
      version: '1.5.10',
      releaseSha: sha,
    });
    expect(git(root, 'status', '--porcelain')).toBe('');
    expect(git(root, 'rev-list', '--count', 'HEAD')).toBe('3');
  });
  it('recovers a committed version without incrementing again when tag/publish has not happened', () => {
    prepareHolidayRelease(root, pr, repository);
    const sha = commitPlan();
    expect(git(root, 'tag', '--list')).toBe('');
    expect(prepareHolidayRelease(root, pr, repository)).toMatchObject({
      changed: false,
      version: '1.5.10',
      releaseSha: sha,
    });
  });
  it('does not create a remote tag when main advanced concurrently', () => {
    const plan = prepareHolidayRelease(root, pr, repository)!;
    commitPlan();
    git(root, 'tag', plan.tag);
    const other = path.join(sandbox, 'other');
    git(root, 'clone', remote, other);
    git(other, 'config', 'user.name', 'Other Test');
    git(other, 'config', 'user.email', 'other@example.invalid');
    put(other, 'README.md', 'Concurrent main update.\n');
    git(other, 'add', 'README.md');
    git(other, 'commit', '-m', 'concurrent update');
    git(other, 'push', 'origin', 'main');
    expect(() =>
      git(
        root,
        'push',
        '--atomic',
        'origin',
        'HEAD:refs/heads/main',
        `refs/tags/${plan.tag}`
      )
    ).toThrow();
    expect(git(root, '--git-dir', remote, 'tag', '--list', plan.tag)).toBe('');
  });
  it('rejects a tag collision without modifying version files', () => {
    git(root, 'tag', 'v1.5.10');
    expect(() => prepareHolidayRelease(root, pr, repository)).toThrow(
      'already exists'
    );
    expect(git(root, 'status', '--porcelain')).toBe('');
  });
  it('rejects a receipt owned by another PR', () => {
    put(root, 'data/holiday-releases/2026.json', {
      year: 2026,
      version: '1.5.10',
      repository,
      pr: 100,
      mergeSha: pr.merge_commit_sha,
    });
    git(root, 'add', '.');
    git(root, 'commit', '-m', 'conflicting receipt');
    expect(() => prepareHolidayRelease(root, pr, repository)).toThrow(
      'different release receipt'
    );
  });
  it('rejects a merged calendar that disagrees with its review record', () => {
    put(
      root,
      'src/holidays/generate.ts',
      source.replace('.i(1, 2)', '.i(1, 3)')
    );
    git(root, 'add', '.');
    git(root, 'commit', '-m', 'inconsistent merged calendar');
    pr.merge_commit_sha = git(root, 'rev-parse', 'HEAD');
    expect(() => prepareHolidayRelease(root, pr, repository)).toThrow(
      'does not match'
    );
    expect(git(root, 'status', '--porcelain')).toBe('');
  });
  it('reuses the original release commit after main has advanced to a later version', () => {
    prepareHolidayRelease(root, pr, repository);
    const released = commitPlan();
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, 'package.json'), 'utf8')
    );
    const lock = JSON.parse(
      fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8')
    );
    manifest.version = lock.version = lock.packages[''].version = '1.5.11';
    put(root, 'package.json', manifest);
    put(root, 'package-lock.json', lock);
    git(root, 'add', '.');
    git(root, 'commit', '-m', 'later release');
    expect(prepareHolidayRelease(root, pr, repository)).toMatchObject({
      changed: false,
      version: '1.5.10',
      releaseSha: released,
    });
    expect(
      JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
        .version
    ).toBe('1.5.11');
  });
  it('leaves unrelated or unmerged PRs untouched', () => {
    expect(
      prepareHolidayRelease(root, { ...pr, merged: false }, repository)
    ).toBeNull();
    expect(git(root, 'status', '--porcelain')).toBe('');
  });
});

// Exercise the actual registry guard embedded in the workflow with fake HTTP
// responses. No npm version is published and no credential is needed.
describe('npm registry idempotency and latest protection', () => {
  const yaml = require('js-yaml') as {
    load(source: string): {
      jobs: {
        release: { steps: { id?: string; with?: { script?: string } }[] };
      };
    };
  };
  const workflow = yaml.load(
    fs.readFileSync(
      path.join(__dirname, '../../.github/workflows/publish.yml'),
      'utf8'
    )
  );
  const script = workflow.jobs.release.steps.find(s => s.id === 'registry')!
    .with!.script!;
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  async function run(
    status: number,
    published: unknown,
    latestStatus = 200,
    latest = '1.5.9',
    fresh = false
  ) {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: status === 200,
        status,
        json: async () => published,
      })
      .mockResolvedValueOnce({
        ok: latestStatus === 200,
        status: latestStatus,
        json: async () => ({ version: latest }),
      });
    const core = { setOutput: jest.fn() };
    const requireMock = (name: string) =>
      name === 'fs'
        ? {
            readFileSync: () =>
              JSON.stringify({ name: 'chinese-days', version: '1.5.10' }),
          }
        : { execFileSync: () => 'a'.repeat(40) };
    await new AsyncFunction('require', 'fetch', 'core', 'process', script)(
      requireMock,
      fetch,
      core,
      { env: { FRESH_BUMP: String(fresh) } }
    );
    return core.setOutput;
  }
  it('skips an existing npm version only for the same commit', async () => {
    expect(await run(200, { gitHead: 'a'.repeat(40) })).toHaveBeenCalledWith(
      'exists',
      'true'
    );
    await expect(run(200, { gitHead: 'b'.repeat(40) })).rejects.toThrow(
      'another'
    );
    await expect(run(200, {})).rejects.toThrow('unverifiable');
    await expect(
      run(200, { gitHead: 'a'.repeat(40) }, 200, '1.5.9', true)
    ).rejects.toThrow('already exists');
  });
  it('allows a new patch but rejects an older/latest version or registry failure', async () => {
    expect(await run(404, {})).toHaveBeenCalledWith('exists', 'false');
    await expect(run(404, {}, 200, '1.6.0')).rejects.toThrow('backwards');
    await expect(run(404, {}, 200, '1.5.10')).rejects.toThrow('reuse');
    await expect(run(503, {})).rejects.toThrow('registry check failed');
    await expect(run(404, {}, 503)).rejects.toThrow('latest check failed');
  });
});
