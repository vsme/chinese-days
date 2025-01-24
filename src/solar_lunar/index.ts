import dayjs, { type ConfigType } from "../utils/dayjs";
import { type LunarDateDetail, LUNAR_INFO, CHINESE_NUMBER, NUMBER_MONTH, NUMBER_1, NUMBER_2, ZODIACS } from './constants'

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
}

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
const yearLeapDays = (y: number): number => yearLeapMonth(y) ? ((LUNAR_INFO[y - 1900] & 0x10000) !== 0 ? 30 : 29) : 0;

/**
 * 获取天干地支表示的月份或日期
 * @param num 月份或日期的数值
 * @returns 天干地支表示
 */
const cyclicalm = (num: number): string => NUMBER_1[num % 10] + NUMBER_2[num % 12];

/**
 * 获取指定年月的阴历天数
 * @param y 农历年份
 * @param m 农历月份
 * @returns 月份天数
 */
export const monthDays = (y: number, m: number): number => (LUNAR_INFO[y - 1900] & (0x10000 >> m)) === 0 ? 29 : 30;

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
  const prefixes = ["初", "十", "廿", "三十"];

  if (day === 10) return "初十";
  if (day === 20) return "二十";
  if (day === 30) return "三十";

  const tensPlace = Math.floor(day / 10);
  const unitsPlace = day % 10;

  return prefixes[tensPlace] + (unitsPlace ? CHINESE_NUMBER[unitsPlace] : "");
}


/**
 * 获取指定农历年份的天干地支表示
 * @param lunarYear 农历年份
 * @returns 天干地支表示
 */
const getLunarYearText = (lunarYear: number): string => {
  return `${NUMBER_1[(lunarYear - 4) % 10]}${NUMBER_2[(lunarYear - 4) % 12]}年`;
}

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
      lunarYearCN: i.toString().split('').map(i => CHINESE_NUMBER[Number(i)]).join('')
    });
  }
  return years;
}

/**
 * 获取指定阳历年份的闰月
 * @param year 年份
 * @returns 农历闰月月份
 */
export const getYearLeapMonth = (year: number) => {
  const leap = yearLeapMonth(year)
  return {
    year,
    leapMonth: leap || undefined,
    leapMonthCN: leap ? `闰${NUMBER_MONTH[leap - 1]}月` : undefined,
    days: leap ? (LUNAR_INFO[year - 1900] & 0x10000) !== 0 ? 30 : 29 : 0
  };
}

/**
 * 计算指定日期的农历元素
 * @param date 指定日期
 * @returns 农历信息
 */
export const getLunarDate = (date: ConfigType): LunarDateDetail => {
  const lunarDate: number[] = new Array(7).fill(0);
  let temp = 0;
  let leap = 0;

  const baseDate = dayjs(new Date(1900, 0, 31));
  const objDate = dayjs(date);
  let offset = objDate.diff(baseDate, "day");

  lunarDate[5] = offset + 40; // 日柱，从1900-01-31开始的天数计算
  lunarDate[4] = 14;          // 月柱，从1900-01-31开始的月数计算

  let i = 1900;
  for (; i < 2100 && offset > 0; i++) {
    temp = lunarYearDays(i);
    offset -= temp;
    lunarDate[4] += 12; // 每经过一年增加12个月柱
  }

  if (offset < 0) {
    offset += temp;
    i--;
    lunarDate[4] -= 12;
  }

  lunarDate[0] = i; // 农历年份
  lunarDate[3] = i - 1864; // 年柱，甲子从1864年开始
  leap = yearLeapMonth(i); // 闰哪个月
  lunarDate[6] = 0; // 闰月标记，初始为0

  for (let j = 1; j < 13 && offset >= 0; j++) {
    if (leap > 0 && j === (leap + 1) && lunarDate[6] === 0) {
      --j;
      lunarDate[6] = 1;
      temp = yearLeapDays(i);
    } else {
      temp = monthDays(i, j);
    }

    if (lunarDate[6] === 1 && j === (leap + 1)) {
      lunarDate[6] = 0;
    }

    offset -= temp;
    if (lunarDate[6] === 0) {
      lunarDate[4]++;
    }

    lunarDate[1] = j; // 农历月份
  }

  if (offset === 0 && leap > 0 && lunarDate[6] === 1) {
    lunarDate[6] = 0;
  } else if (offset < 0) {
    offset += temp;
    lunarDate[1]--;
    lunarDate[4]--;
  }

  lunarDate[2] = offset + 1; // 农历日期

  return {
    date: objDate.format('YYYY-MM-DD'), // 公历日期
    lunarYear: lunarDate[0], // 农历年份
    lunarMon: lunarDate[1] + 1, // 农历月份
    lunarDay: lunarDate[2], // 农历日期
    isLeap: Boolean(lunarDate[6]), // 是否闰月
    zodiac: getYearZodiac(lunarDate[0]), // 生肖
    yearCyl: cyclicalm(lunarDate[3]), // 年柱
    monCyl: cyclicalm(lunarDate[4]), // 月柱
    dayCyl: cyclicalm(lunarDate[5]), // 日柱
    lunarYearCN: `${lunarDate[0].toString().split('').map(i => CHINESE_NUMBER[Number(i)]).join('')}`, // 农历年份中文表示
    lunarMonCN: `${NUMBER_MONTH[lunarDate[1]]}月`, // 农历月份中文表示
    lunarDayCN: getDateCN(lunarDate[2]) // 农历日期中文表示
  };
}

/**
 * 获取范围内所有日期的农历信息
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 范围内所有日期的农历信息
 */
export const getLunarDatesInRange = (startDate: ConfigType, endDate: ConfigType): LunarDateDetail[] => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const lunarDates: LunarDateDetail[] = [];

  for (let date = start; date.isBefore(end) || date.isSame(end, 'day'); date = date.add(1, 'day')) {
    lunarDates.push(getLunarDate(date));
  }

  return lunarDates;
}

/**
 * 根据阴历日期查询阳历日期
 * @param lunarDate 农历日期
 * @param isLeapMonth 是否闰月
 * @returns 阳历日期
 */
export const getSolarDateFromLunar = (lunarDate: ConfigType): {
  date: string;
  leapMonthDate?: string;
} => {
  const date = dayjs(lunarDate);
  const lunarYear = date.year();
  const lunarMonth = date.month() + 1;
  const lunarDay = date.date();

  // 计算从农历年开始到指定农历日期的总天数
  let offset = 0;
  for (let i = 1900; i < lunarYear; i++) {
    offset += lunarYearDays(i);
  }

  let leapMonth = yearLeapMonth(lunarYear);
  for (let i = 1; i < lunarMonth; i++) {
    offset += monthDays(lunarYear, i);
    if (i === leapMonth) {
      offset += yearLeapDays(lunarYear);
    }
  }

  offset += lunarDay - 1;

  // 通过在基准日期上添加偏移量来获取阳历日期
  const baseDate = dayjs(new Date(1900, 0, 31));
  const solarDate = baseDate.add(offset, 'day').format('YYYY-MM-DD');


  /* 闰月日期 */
  let leapMonthDateOffset = offset;
  let solarLeapMonthDate: string | undefined;
  if (leapMonth === lunarMonth) {
    leapMonthDateOffset += monthDays(lunarYear, lunarMonth);
    solarLeapMonthDate = baseDate.add(leapMonthDateOffset, 'day').format('YYYY-MM-DD');
  }

  return {
    date: solarDate,
    leapMonthDate: solarLeapMonthDate,
  };
}

export default {
  getLunarYears,
  getYearLeapMonth,
  getLunarDate,
  getLunarDatesInRange,
  getSolarDateFromLunar,
}
