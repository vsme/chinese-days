import fs from 'fs';
import path from 'path';
import { readBlocks } from '../../scripts/holidays/update';

// Fixed historical baseline for automation tests. Adding a real future year to
// the project must not change these fixtures or the expected simulated next year.
export function calendarFixture(lastYear = 2026): string {
  let source = fs.readFileSync(
    path.join(__dirname, '../../src/holidays/generate.ts'),
    'utf8'
  );
  for (const block of readBlocks(source)
    .filter(b => b.year > lastYear)
    .sort((a, b) => b.start - a.start)) {
    source = source.slice(0, block.start) + source.slice(block.end);
  }
  return source;
}
