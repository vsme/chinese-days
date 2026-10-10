import Arrangement, { Holiday } from '../../src/holidays/arrangement';
import { getSolarDateFromLunar } from '../../src/solar_lunar';
import { getSolarTermDate } from '../../src/solar_terms';

export const POLICY_SOURCE =
  'https://www.gov.cn/zhengce/content/202411/content_6986380.htm';
const HOLIDAY_TYPES = {
  ny: Holiday.NY,
  s: Holiday.S,
  t: Holiday.T,
  l: Holiday.L,
  d: Holiday.D,
  n: Holiday.N,
  m: Holiday.M,
} as const;
export type StandardHoliday = keyof typeof HOLIDAY_TYPES;

function shift(day: string, offset: number) {
  const value = new Date(`${day}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}
export function isWeekday(day: string) {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
  return weekday > 0 && weekday < 6;
}
// Select the regulation in force for the requested year. The 2024 branch
// supports historical regression tests; production still only appends new years.
// This is shared prompt/validation context, never a per-year manual checklist.
export function holidayPolicy(year: number) {
  if (!Number.isInteger(year) || year < 2024 || year > 2100)
    throw new Error('Automatic inLieu policy supports 2024–2100');
  const expanded = year >= 2025;
  const arrangement = new Arrangement();
  const standardDays = Object.fromEntries(
    Object.entries(HOLIDAY_TYPES).map(([id, holiday]) => [
      id,
      arrangement.getHolidayDays(year, holiday),
    ])
  ) as Record<StandardHoliday, number>;
  const consecutive = (start: string, count: number) =>
    Array.from({ length: count }, (_, offset) => shift(start, offset));
  const firstDay = getSolarDateFromLunar(`${year}-01-01`).date;
  const statutory: Record<StandardHoliday, string[]> = {
    ny: consecutive(`${year}-01-01`, standardDays.ny),
    s: consecutive(shift(firstDay, expanded ? -1 : 0), standardDays.s),
    t: consecutive(
      getSolarTermDate(year, 4, 'pure_brightness'),
      standardDays.t
    ),
    l: consecutive(`${year}-05-01`, standardDays.l),
    d: consecutive(getSolarDateFromLunar(`${year}-05-05`).date, standardDays.d),
    n: consecutive(`${year}-10-01`, standardDays.n),
    m: consecutive(getSolarDateFromLunar(`${year}-08-15`).date, standardDays.m),
  };
  return {
    effectiveFrom: expanded ? '2025-01-01' : '2014-01-01',
    source: expanded
      ? POLICY_SOURCE
      : 'https://xzfg.moj.gov.cn/mobile/law/detail?LawID=6',
    standardDays,
    statutory,
    convention:
      '公告未明确补假落日时，按假期内日期顺序，优先将非周末且非法定假日的日期用于补假；剩余日期标记为 inLieu。这是本项目的分类约定，不是公告逐日认定。合并假期按日期并集计算，法定天数按节日分别累加。',
  };
}
