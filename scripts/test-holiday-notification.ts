import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import { runRegression } from './test-ai-holidays';
import { check, selectNewYear, type Source } from './holidays/update';

interface NotificationTestOptions {
  year: number;
  runId: string;
  runAttempt: string;
  root?: string;
  sources?: Source[];
  extraction?: unknown;
}

// Prepare a harmless, run-specific change for the SAME PR/mail steps used in production.
// PR creation and SMTP sending remain in the workflow, with its existing credentials.
export async function prepareNotificationTest(
  options: NotificationTestOptions
) {
  check(
    /^\d{1,20}$/.test(options.runId) && /^\d{1,6}$/.test(options.runAttempt),
    'Invalid GitHub run identity'
  );
  const root = options.root ?? process.cwd();
  const original = fs.readFileSync(
    path.join(root, 'src/holidays/generate.ts'),
    'utf8'
  );
  const nextYear = selectNewYear(original).year;
  const outputDir = path.join(root, 'cache/holiday-notification-test');
  const summary = await runRegression({ ...options, root, outputDir });
  check(
    summary.success && summary.repositoryUnchanged,
    'Notification test requires a passing AI regression'
  );
  const file = path.join(root, `data/holiday-e2e/${options.runId}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        testOnly: true,
        runId: options.runId,
        runAttempt: options.runAttempt,
        regressionYear: options.year,
        defaultNextYear: nextYear,
        calendarUnchanged: true,
        differences: summary.differences,
      },
      null,
      2
    ) + '\n'
  );
  const report = path.join(outputDir, 'pull-request.md');
  fs.writeFileSync(
    report,
    [
      '# [TEST] 节假日自动化端到端测试',
      '',
      '**测试草稿 PR，请勿合并。正式年份配置没有修改。**',
      '',
      `- 官方公告与 AI 回归年份：${options.year}`,
      `- 与现有日期差异：${summary.differences.length}`,
      `- 未指定年份时自动选择：${nextYear}`,
      `- Actions 运行：${options.runId}，第 ${options.runAttempt} 次尝试`,
      '',
      '本 PR 用于验证正式工作流的创建 PR 与 SMTP 通知步骤。仅新增测试记录，测试完成后关闭此 PR。',
      '',
      fs.readFileSync(path.join(outputDir, 'report.md'), 'utf8'),
    ].join('\n')
  );
  check(
    fs.readFileSync(path.join(root, 'src/holidays/generate.ts'), 'utf8') ===
      original,
    'Calendar changed during notification test'
  );
  return {
    year: options.year,
    nextYear,
    report,
    branch: `codex/holiday-e2e-${options.runId}`,
    updated: true,
  };
}

async function main() {
  const args = parseArgs({ allowPositionals: true });
  check(
    args.positionals.length <= 1,
    'Usage: npm run test:notification -- [YEAR]'
  );
  const result = await prepareNotificationTest({
    year: Number(args.positionals[0] ?? 2026),
    runId: process.env.GITHUB_RUN_ID ?? '',
    runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? '1',
  });
  if (process.env.GITHUB_OUTPUT)
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `updated=true\nyear=${result.year}\nreport=${result.report}\nbranch=${result.branch}\nnext_year=${result.nextYear}\n`
    );
  console.log(
    `Prepared test-only PR data for ${result.year}; default next year is ${result.nextYear}.`
  );
}
if (require.main === module)
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
