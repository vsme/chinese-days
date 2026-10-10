import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import {
  check,
  object,
  readBlocks,
  parseExtraction,
  validateAIDecisions,
  validateSources,
  validateYear,
} from '../holidays/update';

export interface HolidayPullRequest {
  number: number;
  title: string;
  merged: boolean;
  draft: boolean;
  merge_commit_sha: string | null;
  head: { ref: string; repo: { full_name: string } | null };
  base: { ref: string; repo: { full_name: string } | null };
  files: { filename: string; status: string; patch?: string }[];
}
export interface ReleasePlan {
  year: number;
  version: string;
  tag: string;
  changed: boolean;
  releaseSha: string;
}
export function nextPatch(version: string): string {
  check(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version),
    'Release requires a stable major.minor.patch version'
  );
  const [major, minor, patch] = version.split('.');
  check(
    BigInt(patch) < BigInt(Number.MAX_SAFE_INTEGER),
    'Patch version is too large'
  );
  return `${major}.${minor}.${BigInt(patch) + 1n}`;
}
export function holidayReleaseYear(
  pr: HolidayPullRequest,
  repository: string
): number | null {
  if (
    !pr.merged ||
    pr.draft ||
    pr.base?.ref !== 'main' ||
    pr.base?.repo?.full_name !== repository ||
    pr.head?.repo?.full_name !== repository ||
    /\[test\]/i.test(pr.title ?? '')
  )
    return null;
  const match = /^auto-update-holidays-(\d{4})$/.exec(pr.head?.ref ?? '');
  if (!match) return null;
  const year = Number(match[1]);
  validateYear(year);
  check(Number.isSafeInteger(pr.number) && pr.number > 0, 'Invalid PR number');
  check(
    typeof pr.merge_commit_sha === 'string' &&
      /^[a-f0-9]{40}$/.test(pr.merge_commit_sha),
    'Missing merge commit'
  );
  const allowed = [
    'src/holidays/generate.ts',
    `data/holiday-reviews/${year}.json`,
  ].sort();
  check(
    Array.isArray(pr.files) &&
      JSON.stringify(pr.files.map(f => f.filename).sort()) ===
        JSON.stringify(allowed),
    'Holiday release PR must only change its year configuration and review record'
  );
  const calendar = pr.files.find(
    f => f.filename === 'src/holidays/generate.ts'
  );
  const record = pr.files.find(
    f => f.filename === `data/holiday-reviews/${year}.json`
  );
  check(
    calendar?.status === 'modified' && record?.status === 'added',
    'Holiday release must add a new yearly record'
  );
  check(
    new RegExp(`^\\+\\s*arrangement\\.y\\(${year}\\)`, 'm').test(
      calendar.patch ?? ''
    ),
    'PR patch does not add the requested year'
  );
  return year;
}
function git(root: string, ...args: string[]) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
function json(root: string, file: string) {
  return object(JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')));
}
function writeJSON(root: string, file: string, value: unknown) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(
    path.join(root, file),
    JSON.stringify(value, null, 2) + '\n'
  );
}

// Only prepares working-tree changes. The workflow tests them before committing,
// pushing, tagging or publishing. A committed receipt makes retries idempotent.
export function prepareHolidayRelease(
  root: string,
  pr: HolidayPullRequest,
  repository: string,
  releaseDate?: string
): ReleasePlan | null {
  check(/^[\w.-]+\/[\w.-]+$/.test(repository), 'Invalid repository name');
  const year = holidayReleaseYear(pr, repository);
  if (year === null) return null;
  check(
    git(root, 'status', '--porcelain') === '',
    'Release preparation requires a clean checkout'
  );
  const merge = pr.merge_commit_sha as string;
  git(root, 'merge-base', '--is-ancestor', merge, 'HEAD');
  const mergedCalendar = git(root, 'show', `${merge}:src/holidays/generate.ts`);
  const record = object(
    JSON.parse(git(root, 'show', `${merge}:data/holiday-reviews/${year}.json`))
  );
  const review = object(record.review);
  check(review.year === year, 'Merged review year does not match the PR');
  const decisions = validateAIDecisions(
    parseExtraction(record.extraction, year, validateSources(review.sources)),
    year
  );
  const actual = readBlocks(mergedCalendar).find(b => b.year === year);
  const canonical = (
    items: typeof decisions | NonNullable<typeof actual>['holidays']
  ) =>
    items
      .map(h => ({ id: h.id, rest: h.rest, work: h.work, inLieu: h.inLieu }))
      .sort((a, b) => a.id.localeCompare(b.id));
  check(
    actual &&
      JSON.stringify(canonical(actual.holidays)) ===
        JSON.stringify(canonical(decisions)),
    'Merged calendar does not match its validated review record'
  );
  const receiptPath = `data/holiday-releases/${year}.json`;
  if (fs.existsSync(path.join(root, receiptPath))) {
    const receipt = json(root, receiptPath);
    check(
      receipt.repository === repository &&
        receipt.pr === pr.number &&
        receipt.mergeSha === merge &&
        receipt.year === year,
      'Year already has a different release receipt'
    );
    check(
      typeof receipt.version === 'string',
      'Invalid release receipt version'
    );
    nextPatch(receipt.version);
    const releaseSha = git(root, 'log', '-1', '--format=%H', '--', receiptPath);
    const manifest = object(
      JSON.parse(git(root, 'show', `${releaseSha}:package.json`))
    );
    check(
      manifest.version === receipt.version,
      'Release receipt and committed package version differ'
    );
    return {
      year,
      version: receipt.version,
      tag: `v${receipt.version}`,
      changed: false,
      releaseSha,
    };
  }
  const manifest = json(root, 'package.json');
  const lock = json(root, 'package-lock.json');
  check(
    manifest.name === 'chinese-days' && typeof manifest.version === 'string',
    'Unexpected package identity'
  );
  const packages = object(lock.packages);
  const packageRoot = object(packages['']);
  check(
    lock.version === manifest.version &&
      packageRoot.version === manifest.version,
    'Package and lockfile versions differ'
  );
  const version = nextPatch(manifest.version),
    tag = `v${version}`;
  check(
    !git(root, 'tag', '--list', tag),
    `Tag ${tag} already exists before this release`
  );
  const date =
    releaseDate ??
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  check(/^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid changelog date');
  const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
  check(changelog.startsWith('# CHANGELOG\n'), 'Unexpected changelog header');
  const entry = `## [${version}](https://github.com/${repository}/releases/tag/${tag}) (${date})\n\n- 新增 ${year} 年节假日安排（[#${pr.number}](https://github.com/${repository}/pull/${pr.number})）。\n\n`;
  manifest.version = lock.version = packageRoot.version = version;
  writeJSON(root, 'package.json', manifest);
  writeJSON(root, 'package-lock.json', lock);
  fs.writeFileSync(
    path.join(root, 'CHANGELOG.md'),
    '# CHANGELOG\n\n' +
      entry +
      changelog.slice('# CHANGELOG\n'.length).trimStart()
  );
  writeJSON(root, receiptPath, {
    year,
    version,
    repository,
    pr: pr.number,
    mergeSha: merge,
  });
  return { year, version, tag, changed: true, releaseSha: '' };
}

if (require.main === module) {
  try {
    check(
      process.argv.length === 3,
      'Usage: ts-node scripts/release/prepare.ts PR_METADATA_JSON'
    );
    const pr = JSON.parse(
      fs.readFileSync(process.argv[2], 'utf8')
    ) as HolidayPullRequest;
    const plan = prepareHolidayRelease(
      process.cwd(),
      pr,
      process.env.GITHUB_REPOSITORY ?? ''
    );
    if (process.env.GITHUB_OUTPUT)
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        plan
          ? `eligible=true\nyear=${plan.year}\nversion=${plan.version}\ntag=${plan.tag}\nchanged=${plan.changed}\nrelease_sha=${plan.releaseSha}\n`
          : 'eligible=false\n'
      );
    console.log(
      plan
        ? `${plan.changed ? 'Prepared' : 'Reusing'} ${plan.tag} for ${plan.year} (PR #${pr.number})`
        : 'Not a merged production holiday PR; no release.'
    );
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Release preparation failed'
    );
    process.exitCode = 1;
  }
}
