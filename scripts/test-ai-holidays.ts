import fs from 'fs';
import os from 'os';
import path from 'path';
import { parseArgs } from 'util';
import { runUpdate } from './auto-update-holidays';
import { fetchHoliday } from './fetch';
import {
  check,
  readBlocks,
  validateYear,
  type Calendar,
  type Source,
} from './holidays/update';

interface RegressionOptions {
  year: number;
  root?: string;
  outputDir?: string;
  sources?: Source[];
  extraction?: unknown;
}
interface Difference {
  holiday: string;
  field: 'rest' | 'work' | 'inLieu' | 'holiday';
  expected: string[];
  actual: string[];
}
function compare(expected: Calendar[], actual: Calendar[]): Difference[] {
  const differences: Difference[] = [];
  for (const id of new Set([...expected, ...actual].map(h => h.id))) {
    const before = expected.find(h => h.id === id);
    const after = actual.find(h => h.id === id);
    if (!before || !after) {
      differences.push({
        holiday: id,
        field: 'holiday',
        expected: before ? [id] : [],
        actual: after ? [id] : [],
      });
      continue;
    }
    for (const field of ['rest', 'work', 'inLieu'] as const) {
      const left = [...before[field]].sort(),
        right = [...after[field]].sort();
      if (JSON.stringify(left) !== JSON.stringify(right))
        differences.push({ holiday: id, field, expected: left, actual: right });
    }
  }
  return differences;
}

// Recreate a recorded year only inside a disposable checkout snapshot.
export async function runRegression(options: RegressionOptions) {
  validateYear(options.year);
  const root = options.root ?? process.cwd();
  const sourcePath = path.join(root, 'src/holidays/generate.ts');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const blocks = readBlocks(source);
  const baseline = blocks.find(b => b.year === options.year);
  check(
    baseline,
    `Year ${options.year} is not recorded; regression requires an existing baseline`
  );
  const outputDir = path.resolve(
    options.outputDir ?? path.join(root, `cache/ai-regression-${options.year}`)
  );
  fs.mkdirSync(outputDir, { recursive: true });
  const temporary = fs.mkdtempSync(
    path.join(os.tmpdir(), 'chinese-days-regression-')
  );
  const started = Date.now();
  const summary = {
    year: options.year,
    success: false,
    elapsedMs: 0,
    repositoryUnchanged: false,
    differences: [] as Difference[],
    error: '',
  };
  try {
    let historical = source;
    for (const block of blocks
      .filter(b => b.year >= options.year)
      .sort((a, b) => b.start - a.start)) {
      historical =
        historical.slice(0, block.start) + historical.slice(block.end);
    }
    const target = path.join(temporary, 'src/holidays/generate.ts');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, historical);
    const sources = options.sources ?? (await fetchHoliday(options.year));
    check(sources.length > 0, `No official notice found for ${options.year}`);
    const result = await runUpdate({
      root: temporary,
      year: options.year,
      sources,
      extraction: options.extraction,
    });
    check(
      result.sourceUpdated,
      'Regression did not generate the requested year'
    );
    const generated = fs.readFileSync(target, 'utf8');
    const actual = readBlocks(generated).find(b => b.year === options.year);
    check(actual, 'Generated year is missing');
    summary.differences = compare(baseline.holidays, actual.holidays);
    fs.copyFileSync(result.reportPath, path.join(outputDir, 'report.md'));
    fs.copyFileSync(
      path.join(temporary, `data/holiday-reviews/${options.year}.json`),
      path.join(outputDir, 'review.json')
    );
    fs.writeFileSync(
      path.join(outputDir, `generated-${options.year}.txt`),
      generated.slice(actual.start, actual.end) + '\n'
    );
    check(
      summary.differences.length === 0,
      `${options.year}: generated dates differ from the recorded baseline; see summary.json`
    );
    summary.success = true;
  } catch (error) {
    summary.error =
      error instanceof Error ? error.message : 'AI regression failed';
  } finally {
    summary.elapsedMs = Date.now() - started;
    summary.repositoryUnchanged =
      fs.readFileSync(sourcePath, 'utf8') === source;
    if (!summary.repositoryUnchanged) {
      summary.success = false;
      summary.error = 'Repository calendar changed during regression';
    }
    // Artifacts contain only public notice data and model output, never credentials.
    const secret = process.env.AI_API_KEY;
    for (const file of [
      'report.md',
      'review.json',
      `generated-${options.year}.txt`,
    ]) {
      const target = path.join(outputDir, file);
      if (secret && fs.existsSync(target) && fs.statSync(target).isFile()) {
        const text = fs.readFileSync(target, 'utf8');
        fs.writeFileSync(target, text.split(secret).join('[REDACTED]'));
      }
    }
    if (secret) summary.error = summary.error.split(secret).join('[REDACTED]');
    fs.writeFileSync(
      path.join(outputDir, 'summary.json'),
      JSON.stringify(summary, null, 2) + '\n'
    );
    fs.rmSync(temporary, { recursive: true, force: true });
  }
  return summary;
}

async function main() {
  const args = parseArgs({
    allowPositionals: true,
    options: { output: { type: 'string' } },
  });
  check(
    args.positionals.length <= 1,
    'Usage: npm run test:ai -- [YEAR] [--output DIRECTORY]'
  );
  const year = Number(args.positionals[0] ?? 2026);
  const summary = await runRegression({ year, outputDir: args.values.output });
  console.log(JSON.stringify(summary, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY)
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### ${year} AI regression\n\n- Result: ${summary.success ? 'PASS' : 'FAIL'}\n- Calendar unchanged: ${summary.repositoryUnchanged}\n- Differences: ${summary.differences.length}\n- Duration: ${(summary.elapsedMs / 1000).toFixed(1)} seconds\n\nSee the uploaded regression artifacts for details.\n`
    );
  if (!summary.success) process.exitCode = 1;
}
if (require.main === module)
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
