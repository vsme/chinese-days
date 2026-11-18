import dayjs, { type ConfigType } from '../utils/dayjs';
import {
  type LunarDateDetail,
  LUNAR_INFO,
  CHINESE_NUMBER,
  NUMBER_MONTH,
  NUMBER_1,
  NUMBER_2,
  ZODIACS,
} from './constants';

// 农历年表从 1900 年正月开始。公历 1900 年 1 月 1 日是上一农历年的腊月初一。
const precedingMonth = { year: 1899, month: 12, days: 30 } as const;

/**
 * 获取指定农历年的天数
 * @param y 年份
 * @returns 农历年天数
 */
const lunarYearDays = (y: number): number => {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[y - 1900] & i) !== 0 ? 1 : 0;
  }
  return sum + yearLeapDays(y);
};

/**
 * 获取指定年份的闰月月份
 * @param y 年份
 * @returns 闰月月份，非闰年返回0
 */
const yearLeapMonth = (y: number): number => LUNAR_INFO[y - 1900] & 0xf;

/**
 * 获取指定年份的闰月天数
 * @param y 年份
 * @returns 闰月天数，非闰年返回0
 */
const yearLeapDays = (y: number): number =>
  yearLeapMonth(y) ? ((LUNAR_INFO[y - 1900] & 0x10000) !== 0 ? 30 : 29) : 0;

/**
 * 获取天干地支表示的月份或日期
 * @param num 月份或日期的数值
 * @returns 天干地支表示
 */
const cyclicalm = (num: number): string =>
  NUMBER_1[num % 10] + NUMBER_2[num % 12];

/**
 * 获取指定年月的阴历天数
 * @param y 农历年份
 * @param m 农历月份
 * @returns 月份天数
 */
export const monthDays = (y: number, m: number): number => {
  if (y === precedingMonth.year && m === precedingMonth.month)
    return precedingMonth.days;
  return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) === 0 ? 29 : 30;
};

/**
 * 获取指定年份的生肖
 * @param y 农历年份
 * @returns 生肖
 */
const getYearZodiac = (y: number): string => ZODIACS[(y - 4) % 12];

/**
 * 获取指定日期的农历表示
 * @param day 日期
 * @returns 农历表示
 */
const getDateCN = (day: number): string => {
  const prefixes = ['初', '十', '廿', '三十'];

  if (day === 10) return '初十';
  if (day === 20) return '二十';
  if (day === 30) return '三十';

  const tensPlace = Math.floor(day / 10);
  const unitsPlace = day % 10;

  return prefixes[tensPlace] + CHINESE_NUMBER[unitsPlace];
};

/**
 * 获取指定农历年份的天干地支表示
 * @param lunarYear 农历年份
 * @returns 天干地支表示
 */
const getLunarYearText = (lunarYear: number): string => {
  return `${NUMBER_1[(lunarYear - 4) % 10]}${NUMBER_2[(lunarYear - 4) % 12]}年`;
};

/**
 * 获取指定范围内的所有农历年份 信息
 * @param startYear 起始农历年份
 * @param endYear 结束农历年份
 * @returns 农历年份列表
 */
export const getLunarYears = (startYear: number, endYear: number) => {
  const years = [];
  for (let i = startYear; i <= endYear; i++) {
    years.push({
      year: i,
      lunarYear: getLunarYearText(i),
      lunarYearCN: i
        .toString()
        .split('')
        .map(i => CHINESE_NUMBER[Number(i)])
        .join(''),
    });
  }
  return years;
};

/**
 * 获取指定阳历年份的闰月
 * @param year 年份
 * @returns 农历闰月月份
 */
export const getYearLeapMonth = (year: number) => {
  const leap = yearLeapMonth(year);
  return {
    year,
    leapMonth: leap || undefined,
    leapMonthCN: leap ? `闰${NUMBER_MONTH[leap - 1]}月` : undefined,
    days: leap ? ((LUNAR_INFO[year - 1900] & 0x10000) !== 0 ? 30 : 29) : 0,
  };
};

// offset 为距 1900 年正月初一（公历 1 月 31 日）的天数。
const lunarPartsFromOffset = (offset: number) => {
  let monthCycle = 14; // 1900 年正月为戊寅月
  if (offset < 0 && offset >= -precedingMonth.days) {
    return {
      lunarYear: precedingMonth.year,
      lunarMon: precedingMonth.month,
      lunarDay: offset + precedingMonth.days + 1,
      isLeap: false,
      monthCycle: monthCycle - 1,
    };
  }
  let temp = 0;
  let i = 1900;
  for (; i < 2100 && offset > 0; i++) {
    temp = lunarYearDays(i);
    offset -= temp;
    monthCycle += 12; // 每经过一年增加12个月柱
  }

  if (offset < 0) {
    offset += temp;
    i--;
    monthCycle -= 12;
  }

  const leap = yearLeapMonth(i); // 闰哪个月
  let isLeap = false;
  let monthIndex = 0;

  for (let j = 1; j < 13 && offset >= 0; j++) {
    if (leap > 0 && j === leap + 1 && !isLeap) {
      --j;
      isLeap = true;
      temp = yearLeapDays(i);
    } else {
      temp = monthDays(i, j);
    }

    if (isLeap && j === leap + 1) {
      isLeap = false;
    }

    offset -= temp;
    if (!isLeap) {
      monthCycle++;
    }

    monthIndex = j; // 农历月份
  }

  if (offset < 0) {
    offset += temp;
    monthIndex--;
    monthCycle--;
  }

  return {
    lunarYear: i,
    lunarMon: monthIndex + 1,
    lunarDay: offset + 1,
    isLeap,
    monthCycle,
  };
};

/**
 * 计算指定日期的农历元素
 * @param date 指定日期
 * @returns 农历信息
 */
export const getLunarDate = (date: ConfigType): LunarDateDetail => {
  const objDate = dayjs(date);
  const [year, month, day] = objDate
    .format('YYYY-MM-DD')
    .split('-')
    .map(Number);
  const offset = Math.floor(
    (Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) /
      (24 * 60 * 60 * 1000)
  );

  const { lunarYear, lunarMon, lunarDay, isLeap, monthCycle } =
    lunarPartsFromOffset(offset);
  return {
    date: objDate.format('YYYY-MM-DD'), // 公历日期
    lunarYear, // 农历年份
    lunarMon, // 农历月份
    lunarDay, // 农历日期
    isLeap, // 是否闰月
    zodiac: getYearZodiac(lunarYear), // 生肖
    yearCyl: cyclicalm(lunarYear - 1864), // 年柱
    monCyl: cyclicalm(monthCycle), // 月柱
    dayCyl: cyclicalm(offset + 40), // 日柱
    lunarYearCN: `${lunarYear
      .toString()
      .split('')
      .map(i => CHINESE_NUMBER[Number(i)])
      .join('')}`, // 农历年份中文表示
    lunarMonCN: `${NUMBER_MONTH[lunarMon - 1]}月`, // 农历月份中文表示
    lunarDayCN: getDateCN(lunarDay), // 农历日期中文表示
  };
};

/**
 * 获取范围内所有日期的农历信息
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 范围内所有日期的农历信息
 */
export const getLunarDatesInRange = (
  startDate: ConfigType,
  endDate: ConfigType
): LunarDateDetail[] => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const lunarDates: LunarDateDetail[] = [];

  for (
    let date = start;
    date.isBefore(end) || date.isSame(end, 'day');
    date = date.add(1, 'day')
  ) {
    lunarDates.push(getLunarDate(date));
  }

  return lunarDates;
};

/**
 * 根据阴历日期查询阳历日期
 * @param lunarDate 农历日期
 * @returns 阳历日期
 */
export const getSolarDateFromLunar = (
  lunarDate: ConfigType
): {
  /** 优先普通月，只有闰月有效时返回闰月日期。 */
  date: string | undefined;
  /** date 是否取自闰月；无有效日期时为 false。 */
  isLeap: boolean;
  leapMonthDate?: string;
} => {
  // 农历二月可有三十天，日期字符串须保留原始年月日。
  const input = typeof lunarDate === 'string' ? lunarDate.trim() : lunarDate;
  const dateText =
    typeof input === 'string' && /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(input)
      ? input
      : dayjs(input).format('YYYY-MM-DD');
  const [lunarYear, lunarMonth, lunarDay] = dateText.split(/[-/]/).map(Number);
  if (
    lunarYear === precedingMonth.year &&
    lunarMonth === precedingMonth.month &&
    lunarDay >= 1 &&
    lunarDay <= precedingMonth.days
  ) {
    return {
      date: dayjs(new Date(1900, 0, lunarDay)).format('YYYY-MM-DD'),
      isLeap: false,
      leapMonthDate: undefined,
    };
  }
  if (
    !LUNAR_INFO[lunarYear - 1900] ||
    !(lunarMonth >= 1 && lunarMonth <= 12 && lunarDay >= 1 && lunarDay <= 30)
  ) {
    return { date: undefined, isLeap: false, leapMonthDate: undefined };
  }

  // 计算从农历年开始到指定农历日期的总天数
  let offset = 0;
  for (let i = 1900; i < lunarYear; i++) {
    offset += lunarYearDays(i);
  }

  const leapMonth = yearLeapMonth(lunarYear);
  for (let i = 1; i < lunarMonth; i++) {
    offset += monthDays(lunarYear, i);
    if (i === leapMonth) {
      offset += yearLeapDays(lunarYear);
    }
  }

  offset += lunarDay - 1;

  // 通过在基准日期上添加偏移量来获取阳历日期
  const baseDate = dayjs(new Date(1900, 0, 31));
  const regularDays = monthDays(lunarYear, lunarMonth);
  const regularDate =
    lunarDay <= regularDays
      ? baseDate.add(offset, 'day').format('YYYY-MM-DD')
      : undefined;
  const leapMonthDate =
    leapMonth === lunarMonth && lunarDay <= yearLeapDays(lunarYear)
      ? baseDate.add(offset + regularDays, 'day').format('YYYY-MM-DD')
      : undefined;
  return {
    date: regularDate ?? leapMonthDate,
    isLeap: regularDate === undefined && leapMonthDate !== undefined,
    leapMonthDate,
  };
};

export default {
  getLunarYears,
  getYearLeapMonth,
  getLunarDate,
  getLunarDatesInRange,
  getSolarDateFromLunar,
};
