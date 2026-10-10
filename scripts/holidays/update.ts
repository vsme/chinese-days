import { createHash } from 'crypto';
import ts from 'typescript';
import { holidayPolicy, isWeekday, type StandardHoliday } from './policy';

export const holidayIds = ['ny', 's', 't', 'l', 'd', 'n', 'm', 'a'] as const;
export type HolidayId = (typeof holidayIds)[number];
export const names: Record<HolidayId, string> = {
  ny: '元旦',
  s: '春节',
  t: '清明',
  l: '劳动节',
  d: '端午',
  n: '国庆节',
  m: '中秋',
  a: '抗战胜利纪念日',
};
export interface Source {
  url: string;
  text: string;
}
export interface Holiday {
  id: HolidayId;
  rest: string[];
  work: string[];
  evidence: { url: string; quote: string }[];
}
export interface Calendar extends Holiday {
  inLieu: string[];
}
export interface Decision extends Holiday {
  inLieu: string[];
  basis: string;
}
export interface Review {
  version: 2;
  year: number;
  sources: Source[];
  holidays: Decision[];
}

export function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
export function object(value: unknown): Record<string, unknown> {
  check(
    value !== null && typeof value === 'object' && !Array.isArray(value),
    'Expected an object'
  );
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, expected: string[]) {
  check(
    Object.keys(value).sort().join() === expected.sort().join(),
    `Expected fields: ${expected.join(', ')}`
  );
}
export function validateYear(year: number) {
  check(
    Number.isInteger(year) && year >= 2004 && year <= 2100,
    'Year must be an integer from 2004 to 2100'
  );
}
export function officialUrl(value: unknown): string {
  check(typeof value === 'string', 'Missing source URL');
  const url = new URL(value);
  check(
    ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.hostname === 'gov.cn' || url.hostname.endsWith('.gov.cn')),
    'Source must be a gov.cn URL'
  );
  return url.href;
}
export function normalize(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}
export function hash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
export function validateSources(value: unknown): Source[] {
  check(
    Array.isArray(value) && value.length > 0 && value.length <= 50,
    'Expected 1–50 official sources'
  );
  const sources = value.map(item => {
    const source = object(item);
    keys(source, ['url', 'text']);
    check(
      typeof source.text === 'string' && normalize(source.text).length > 0,
      'Empty notice text'
    );
    return { url: officialUrl(source.url), text: normalize(source.text) };
  });
  check(
    new Set(sources.map(s => s.url)).size === sources.length,
    'Duplicate source URL'
  );
  check(
    sources.reduce((n, s) => n + s.text.length, 0) <= 100_000,
    'Notices are too large'
  );
  return sources.sort((a, b) => a.url.localeCompare(b.url));
}
export function date(value: unknown, year: number): string {
  check(
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value),
    'Expected YYYY-MM-DD'
  );
  const parsed = new Date(`${value}T00:00:00Z`);
  check(
    Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value &&
      parsed.getUTCFullYear() === year,
    `Invalid or out-of-year date: ${value}`
  );
  return value;
}
function list(value: unknown, year: number): string[] {
  check(Array.isArray(value) && value.length <= 366, 'Expected a date array');
  const dates = value.map(item => date(item, year));
  check(new Set(dates).size === dates.length, 'Duplicate date');
  return dates.sort();
}
function range(start: string, end: string): string[] {
  check(start <= end, 'Reversed date range');
  const dates = [];
  for (
    let day = new Date(`${start}T00:00:00Z`);
    day.toISOString().slice(0, 10) <= end;
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    dates.push(day.toISOString().slice(0, 10));
  }
  return dates;
}
export function validateCalendar(
  holidays: (Holiday & { inLieu?: string[] | null })[]
) {
  const rest = new Set(holidays.flatMap(h => h.rest));
  const work = new Set(holidays.flatMap(h => h.work));
  for (const day of work) check(!rest.has(day), `${day}: rest/work conflict`);
  for (const holiday of holidays) {
    for (const day of holiday.inLieu ?? []) {
      check(
        holiday.rest.includes(day) && !work.has(day),
        `${day}: inLieu must be a rest day and cannot be a workday`
      );
    }
  }
}
export function parseExtraction(
  input: unknown,
  year: number,
  sources: Source[]
): Decision[] {
  validateYear(year);
  const root = object(input);
  keys(root, ['year', 'holidays']);
  check(
    root.year === year && Array.isArray(root.holidays),
    'Extraction year/holidays mismatch'
  );
  const holidays = root.holidays.map(item => {
    const h = object(item);
    keys(h, ['id', 'rest', 'work', 'inLieu', 'basis', 'evidence']);
    check(
      typeof h.basis === 'string' &&
        normalize(h.basis).length >= 5 &&
        h.basis.length <= 2000,
      'Missing or oversized AI inLieu explanation'
    );
    check(holidayIds.includes(h.id as HolidayId), 'Unknown holiday');
    check(
      Array.isArray(h.rest) && h.rest.length > 0 && h.rest.length <= 366,
      `${h.id}: Missing rest ranges; omit holidays not scheduled by the notice`
    );
    const rest = h.rest.flatMap(pair => {
      check(Array.isArray(pair) && pair.length === 2, 'Expected [start, end]');
      return range(date(pair[0], year), date(pair[1], year));
    });
    check(
      new Set(rest).size === rest.length,
      'Overlapping ranges within a holiday'
    );
    check(
      Array.isArray(h.evidence) &&
        h.evidence.length > 0 &&
        h.evidence.length <= 50,
      'Missing evidence'
    );
    const evidence = h.evidence.map(item => {
      const e = object(item);
      keys(e, ['url', 'quote']);
      const url = officialUrl(e.url);
      check(
        typeof e.quote === 'string' && normalize(e.quote).length >= 5,
        'Missing evidence quote'
      );
      const quote = normalize(e.quote);
      check(
        sources.some(source => source.url === url),
        `${h.id}: Evidence URL must come from the notice sources; statutory-policy metadata belongs in basis, not evidence`
      );
      check(
        sources.some(
          source => source.url === url && source.text.includes(quote)
        ),
        'Evidence is not an exact notice excerpt'
      );
      return { url, quote };
    });
    return {
      id: h.id as HolidayId,
      rest: rest.sort(),
      work: list(h.work, year),
      inLieu: list(h.inLieu, year),
      basis: normalize(h.basis),
      evidence,
    };
  });
  const ids = new Set(holidays.map(h => h.id));
  check(ids.size === holidays.length, 'Duplicate holiday');
  const required: HolidayId[] =
    year >= 2008 ? ['ny', 's', 't', 'l', 'd', 'n', 'm'] : ['ny', 's', 'l', 'n'];
  check(
    required.every(id => ids.has(id)),
    'Incomplete annual extraction; include the annual notice and any amendments'
  );
  validateCalendar(holidays);
  // National Day precedes Mid-autumn so a shared date keeps its specific holiday name.
  return holidays.sort(
    (a, b) => holidayIds.indexOf(a.id) - holidayIds.indexOf(b.id)
  );
}

interface Block {
  year: number;
  start: number;
  end: number;
  holidays: Calendar[];
}
export function readBlocks(source: string): Block[] {
  const diagnostics =
    ts.transpileModule(source, {
      reportDiagnostics: true,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.CommonJS,
      },
    }).diagnostics ?? [];
  check(
    !diagnostics.some(d => d.category === ts.DiagnosticCategory.Error),
    'Invalid generate.ts syntax'
  );
  const file = ts.createSourceFile(
    'generate.ts',
    source,
    ts.ScriptTarget.Latest,
    true
  );
  const blocks: Block[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isExpressionStatement(node) &&
      /^arrangement\s*\./.test(node.getText(file))
    ) {
      const calls: { name: string; args: number[] }[] = [];
      let expr = node.expression;
      while (
        ts.isCallExpression(expr) &&
        ts.isPropertyAccessExpression(expr.expression)
      ) {
        check(
          expr.arguments.every(ts.isNumericLiteral),
          'Unsupported arrangement argument'
        );
        calls.unshift({
          name: expr.expression.name.text,
          args: expr.arguments.map(a => Number(a.getText(file))),
        });
        expr = expr.expression.expression;
      }
      check(
        ts.isIdentifier(expr) &&
          expr.text === 'arrangement' &&
          calls[0]?.name === 'y' &&
          calls[0].args.length === 1,
        'Unsupported arrangement chain'
      );
      const year = calls[0].args[0];
      calls.shift();
      validateYear(year);
      const groups = new Map<HolidayId, Calendar>();
      let current: Calendar | undefined;
      let last: string | undefined;
      let kind: 'rest' | 'work' | 'inLieu' | undefined;
      for (const call of calls) {
        if (holidayIds.includes(call.name as HolidayId)) {
          check(call.args.length === 0, 'Holiday method cannot have arguments');
          const id = call.name as HolidayId;
          current = groups.get(id) ?? {
            id,
            rest: [],
            work: [],
            inLieu: [],
            evidence: [],
          };
          groups.set(id, current);
          last = undefined;
          kind = undefined;
        } else {
          check(
            current &&
              ['r', 'w', 'i', 'to'].includes(call.name) &&
              call.args.length === 2,
            'Unsupported date method'
          );
          const day = date(
            `${year}-${String(call.args[0]).padStart(2, '0')}-${String(call.args[1]).padStart(2, '0')}`,
            year
          );
          if (call.name === 'to') {
            check(kind && last && day > last, 'Invalid arrangement range');
            current[kind].push(...range(last, day).slice(1));
          } else {
            kind = ({ r: 'rest', w: 'work', i: 'inLieu' } as const)[
              call.name as 'r' | 'w' | 'i'
            ];
            current[kind].push(day);
          }
          last = day;
        }
      }
      const holidays = [...groups.values()].map(h => ({
        ...h,
        rest: [...new Set(h.rest)].sort(),
        work: [...new Set(h.work)].sort(),
        inLieu: [...new Set(h.inLieu)].sort(),
      }));
      const comment = ts
        .getLeadingCommentRanges(source, node.getFullStart())
        ?.find(c =>
          new RegExp(`^/\\*\\*\\s*\\*\\s*${year}\\b`).test(
            source.slice(c.pos, c.end)
          )
        );
      // Include the comment when checking that insertion preserves each existing year.
      blocks.push({
        year,
        start: comment?.pos ?? node.getStart(file),
        end: node.end,
        holidays,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  check(
    new Set(blocks.map(b => b.year)).size === blocks.length,
    'Duplicate year blocks'
  );
  return blocks;
}
export function selectNewYear(source: string, requested?: number) {
  const years = readBlocks(source).map(block => block.year);
  check(years.length > 0, 'No existing calendar years');
  const next = Math.max(...years) + 1;
  const year = requested ?? next;
  validateYear(year);
  const existing = years.includes(year);
  check(existing || year === next, `Only the next year (${next}) can be added`);
  return { year, existing };
}
// Validate AI decisions against statutory dates and this project's deterministic
// convention for compensatory rest. Count statutory entitlements separately even
// when two holidays fall on the same date; union calendar dates only once.
export function validateAIDecisions(
  holidays: Decision[],
  year: number
): Decision[] {
  const policy = holidayPolicy(year);
  validateCalendar(holidays);
  const allStatutory = new Set(Object.values(policy.statutory).flat());
  for (const h of holidays) {
    check(h.id in policy.statutory, `No statutory policy for ${h.id}`);
    const statutory = policy.statutory[h.id as StandardHoliday];
    check(
      statutory.every(day => h.rest.includes(day)),
      `${h.id}: missing statutory holiday dates`
    );
    for (const day of h.work)
      check(
        !isWeekday(day) && !allStatutory.has(day),
        `${day}: makeup work must be a non-statutory weekend`
      );
    for (const day of h.inLieu)
      check(
        isWeekday(day) && !allStatutory.has(day),
        `${day}: statutory days/weekends cannot be inLieu`
      );
  }
  const remaining = new Set(holidays);
  while (remaining.size) {
    const first = remaining.values().next().value as Decision;
    const group = [first];
    remaining.delete(first);
    const rest = new Set(first.rest);
    // Include overlapping or adjacent holidays in the same continuous break.
    let expanded = true;
    while (expanded) {
      expanded = false;
      for (const h of remaining) {
        if (
          h.rest.some(day =>
            [...rest].some(
              other => Math.abs(Date.parse(day) - Date.parse(other)) <= 86400000
            )
          )
        ) {
          group.push(h);
          remaining.delete(h);
          h.rest.forEach(day => rest.add(day));
          expanded = true;
        }
      }
    }
    const statutory = new Set(
      group.flatMap(h => policy.statutory[h.id as StandardHoliday])
    );
    const entitlement = group.reduce(
      (sum, h) => sum + policy.standardDays[h.id as StandardHoliday],
      0
    );
    const candidates = [...rest]
      .filter(day => isWeekday(day) && !statutory.has(day))
      .sort();
    const compensation = entitlement - [...statutory].filter(isWeekday).length;
    check(
      candidates.length >= compensation,
      `${group.map(h => h.id).join('+')}: insufficient days for statutory compensation`
    );
    const expected = candidates.slice(compensation);
    const selected = group.flatMap(h => h.inLieu).sort();
    check(
      new Set(selected).size === selected.length,
      'Duplicate inLieu date across holidays'
    );
    check(
      JSON.stringify(selected) === JSON.stringify(expected),
      `${group.map(h => h.id).join('+')}: expected inLieu ${JSON.stringify(expected)} after statutory/weekend compensation`
    );
  }
  return holidays;
}
function args(day: string) {
  return day.slice(5).split('-').map(Number).join(', ');
}
export function renderChain(year: number, holidays: Decision[]): string {
  validateCalendar(holidays);
  return (
    `arrangement.y(${year})\n` +
    holidays
      .map(h => {
        const inLieu = h.inLieu;
        [...h.rest, ...h.work, ...inLieu].forEach(day => date(day, year));
        let rest = '';
        for (let i = 0; i < h.rest.length; i++) {
          const start = h.rest[i];
          while (
            i + 1 < h.rest.length &&
            new Date(`${h.rest[i + 1]}T00:00:00Z`).getTime() -
              new Date(`${h.rest[i]}T00:00:00Z`).getTime() ===
              86400000
          )
            i++;
          rest += `.r(${args(start)})`;
          if (h.rest[i] !== start) rest += `.to(${args(h.rest[i])})`;
        }
        return `    .${h.id}()${rest}${h.work.map(d => `.w(${args(d)})`).join('')}${inLieu.map(d => `.i(${args(d)})`).join('')}`;
      })
      .join('\n') +
    ';'
  );
}
export function appendYear(
  source: string,
  year: number,
  holidays: Decision[]
): string {
  const blocks = readBlocks(source);
  const target = selectNewYear(source, year);
  check(
    !target.existing,
    `Year ${year} already exists; historical data cannot be changed`
  );
  validateAIDecisions(holidays, year);
  const chain = renderChain(year, holidays);
  const urls = [...new Set(holidays.flatMap(h => h.evidence.map(e => e.url)))];
  const comment = [
    '/**',
    `   * ${year}`,
    ...urls.map(url => `   * ${url.replace(/\*\//g, '* /')}`),
    `   * 来源与逐日核对记录：data/holiday-reviews/${year}.json`,
    ...holidays.map(
      h =>
        `   * ${names[h.id]}：放假 ${h.rest.join('、')}；补班 ${h.work.join('、') || '无'}`
    ),
    '   */',
  ].join('\n');
  const init =
    /^\s*const\s+arrangement\s*=\s*new\s+Arrangement\s*\(\)\s*;?[^\S\n]*$/m.exec(
      source
    );
  check(init, 'Cannot find arrangement initialization');
  const pos = init.index + init[0].length;
  const updated =
    source.slice(0, pos) + `\n  ${comment}\n  ${chain}\n` + source.slice(pos);
  const after = readBlocks(updated);
  check(after.length === blocks.length + 1, 'Unexpected year count change');
  for (const block of blocks) {
    const unchanged = after.find(b => b.year === block.year);
    check(
      unchanged &&
        source.slice(block.start, block.end) ===
          updated.slice(unchanged.start, unchanged.end),
      `Unexpected modification to ${block.year}`
    );
  }
  return updated;
}
function cell(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '&#124;')
    .replace(/[\r\n]+/g, ' ');
}
export function renderReport(review: Review): string {
  const policy = holidayPolicy(review.year);
  const lines = [
    `自动核对 ${review.year} 年假期安排`,
    '',
    'AI 已生成调休日期，程序已校验法定日期、补假、周末与日期冲突；无需人工填写调休规则。',
    '',
    `法定天数依据：${policy.source}。${policy.convention}`,
    '',
    '### 调休标记依据',
    '',
    ...review.holidays.map(h => `- ${names[h.id]}：${cell(h.basis)}`),
    '',
    '### 来源与原文',
    '',
  ];
  for (const h of review.holidays)
    for (const e of h.evidence)
      lines.push(`- ${names[h.id]}：${cell(e.url)} — ${cell(e.quote)}`);
  lines.push(
    '',
    '### 新年份逐日核对',
    '',
    '| 日期 | 星期 | 节日 | 安排 | 调休标记 |',
    '| --- | --- | --- | --- | --- |'
  );
  const allDates = [
    ...new Set(review.holidays.flatMap(h => [...h.rest, ...h.work])),
  ].sort();
  const status = (items: Holiday[], day: string) =>
    items.some(h => h.work.includes(day))
      ? '补班'
      : items.some(h => h.rest.includes(day))
        ? '放假'
        : '按普通周历';
  for (const day of allDates) {
    const matches = review.holidays.filter(
      h => h.rest.includes(day) || h.work.includes(day)
    );
    const mark = matches.some(h => h.inLieu.includes(day)) ? '调休放假' : '否';
    lines.push(
      `| ${day} | ${'日一二三四五六'[new Date(`${day}T00:00:00Z`).getUTCDay()]} | ${matches.map(h => names[h.id]).join('、') || '—'} | ${status(review.holidays, day)} | ${mark} |`
    );
  }
  lines.push(
    '',
    '调休分类由 AI 提出并通过项目规则验证；此记录用于追溯，不需要额外的人工确认步骤。',
    ''
  );
  return lines.join('\n');
}
