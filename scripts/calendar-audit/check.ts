import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getLunarDate,
  getSolarDateFromLunar,
  getSolarTerms,
  getSolarTermsInRange,
} from '../../src';
import differences from './hko-differences.json';

process.env.TZ = 'Asia/Shanghai';
const DAY = 86400000;
const termsInOrder =
  '小寒 大寒 立春 雨水 惊蛰 春分 清明 谷雨 立夏 小满 芒种 夏至 小暑 大暑 立秋 处暑 白露 秋分 寒露 霜降 立冬 小雪 大雪 冬至'.split(
    ' '
  );

function lunarInput(year: number, month: number, day: number): string {
  return [year, month, day]
    .map(value => String(value).padStart(2, '0'))
    .join('-');
}

function load(source: string, firstYear: number, lastYear: number) {
  const anchors = new Map<
    string,
    { year: number; month: number; day: number; leap: boolean }
  >();
  const terms = new Map<string, string>();
  const lines = readFileSync(
    join(__dirname, 'reference', source + '.txt'),
    'utf8'
  )
    .trimEnd()
    .split(/\r?\n/);
  let previous = '';
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    const [date, lunar, term] = line.split(' ');
    assert(
      date > previous &&
        date >= firstYear + '-01-01' &&
        date <= lastYear + '-12-31',
      line
    );
    assert.equal(new Date(date).toISOString().slice(0, 10), date, line);
    previous = date;
    if (lunar !== '-') {
      const match = /^(\d{4})-(L?)(\d{2})-(\d{2})$/.exec(lunar);
      assert(match, line);
      anchors.set(date, {
        year: +match[1],
        leap: match[2] === 'L',
        month: +match[3],
        day: +match[4],
      });
    }
    if (term !== '-') terms.set(date, term);
  }
  return { source, firstYear, lastYear, anchors, terms };
}

function verify(
  ref: ReturnType<typeof load>,
  expectedTerms: Map<string, string>
) {
  const { source, firstYear, lastYear, anchors, terms } = ref;
  let active = '冬至';
  let start: number | undefined;
  let dayCount = 0;
  let rangeDifferences = 0;
  let rawActive = active;
  let rawStart: number | undefined;
  type Candidates = { date?: string; leapMonthDate?: string };
  const inverse = new Map<string, Candidates>();
  for (let y = firstYear; y <= lastYear; y++) {
    const first = y + '-01-01',
      last = y + '-12-31';
    const events = getSolarTerms(first, last);
    const daily = getSolarTermsInRange(first, last);
    const yearDays = (Date.parse(last) - Date.parse(first)) / DAY + 1;
    assert.equal(events.length, 24, source + ' ' + y + ' 节气数');
    assert.equal(daily.length, yearDays, source + ' ' + y + ' 每日节气数');
    let eventIndex = 0;
    let lunar = anchors.get(first);
    assert(lunar, source + ' ' + first + ' 缺少年初农历日期');
    for (let i = 0; i < yearDays; i++) {
      const time = Date.UTC(y, 0, i + 1);
      const date = new Date(time).toISOString().slice(0, 10);
      const label = source + ' ' + date;
      const anchor = anchors.get(date);
      if (anchor) lunar = { ...anchor };
      else lunar.day++;
      assert(lunar.day >= 1 && lunar.day <= 30, label + ' 农历日越界');
      const actual = getLunarDate(date);
      assert.deepEqual(
        [actual.lunarYear, actual.lunarMon, actual.lunarDay, actual.isLeap],
        [lunar.year, lunar.month, lunar.day, lunar.leap],
        label + ' 公历转农历'
      );
      const input = lunarInput(lunar.year, lunar.month, lunar.day);
      const candidates: Candidates = inverse.get(input) ?? {};
      const branch: keyof Candidates = lunar.leap ? 'leapMonthDate' : 'date';
      assert.equal(candidates[branch], undefined, label + ' 重复农历日期');
      candidates[branch] = date;
      inverse.set(input, candidates);

      const term = expectedTerms.get(date);
      if (term) {
        assert.equal(term, termsInOrder[eventIndex], label + ' 基准节气顺序');
        const event = events[eventIndex++];
        assert.deepEqual(
          [event?.date, event?.name],
          [date, term],
          label + ' 交节日'
        );
        active = term;
        start = time;
      }
      const current = daily[i];
      assert.deepEqual(
        [current.date, current.name],
        [date, active],
        label + ' 每日节气'
      );
      if (start !== undefined)
        assert.equal(
          current.index,
          1 + (time - start) / DAY,
          label + ' 节气日序'
        );
      const raw = terms.get(date);
      if (raw) {
        rawActive = raw;
        rawStart = time;
      }
      if (active !== rawActive || start !== rawStart) rangeDifferences++;
    }
    assert.equal(eventIndex, 24, source + ' ' + y + ' 基准节气数');
    dayCount += yearDays;
  }
  // 包括小月三十等无效输入。首尾不完整的农历年只断言历表覆盖的候选日期。
  const first = firstYear + '-01-01',
    last = lastYear + '-12-31';
  for (let year = firstYear - 1; year <= lastYear; year++) {
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 30; day++) {
        const input = lunarInput(year, month, day);
        const expected = inverse.get(input) ?? {};
        const result = getSolarDateFromLunar(input);
        // 从主日期和闰月标记还原普通月候选，再与两份独立的历表候选逐一比对。
        assert.equal(
          result.isLeap,
          result.date !== undefined && result.date === result.leapMonthDate,
          source + ' ' + input + ' 主日期闰月标记'
        );
        if (result.leapMonthDate !== undefined)
          assert.ok(result.date, source + ' ' + input + ' 缺少主日期');
        const candidates = {
          date: result.isLeap ? undefined : result.date,
          leapMonthDate: result.leapMonthDate,
        };
        for (const field of ['date', 'leapMonthDate'] as const) {
          const actual = candidates[field];
          if (
            expected[field] ||
            (year >= firstYear && year < lastYear) ||
            (actual && actual >= first && actual <= last)
          ) {
            assert.equal(
              actual,
              expected[field],
              source + ' ' + input + ' ' + field + ' 农历反查'
            );
          }
        }
      }
    }
  }
  console.log(
    `${source} ${firstYear}–${lastYear}：${dayCount} 天、${terms.size} 个节气、${inverse.size} 个有效农历输入通过。与原表每日节气名称或日序不同 ${rangeDifferences} 天。`
  );
}

const pmo = load('pmo', 1900, 2025);
verify(pmo, pmo.terms);
const hko = load('hko', 1901, 2100);
const adjusted = new Map(hko.terms);
for (const entry of differences) {
  assert.equal(
    adjusted.get(entry.hko),
    entry.term,
    '港表差异清单 ' + entry.hko
  );
  assert.equal(pmo.terms.get(entry.pmo), entry.term, '紫金山正文 ' + entry.pmo);
  assert(!adjusted.has(entry.pmo), '港表差异目标已被占用 ' + entry.pmo);
  adjusted.delete(entry.hko);
  adjusted.set(entry.pmo, entry.term);
}
verify(hko, adjusted);
console.log(
  `已验证港表已知交节日差异 ${differences.length} 处，未发现其他差异。`
);
