export interface LunarDateDetail {
  /** 阳历日期 */
  date: string;
  /** 农历年份 */
  lunarYear: number;
  /** 农历月份 */
  lunarMon: number;
  /** 农历日期 */
  lunarDay: number;
  /** 是否闰月 */
  isLeap: boolean;
  /** 年柱，天干地支表示的年份 */
  yearCyl: string;
  /** 月柱，天干地支表示的月份 */
  monCyl: string;
  /** 日柱，天干地支表示的日期 */
  dayCyl: string;
  /** 生肖 */
  zodiac: string;
  /** 农历年份的中文写法 */
  lunarYearCN: string;
  /** 农历月份的中文写法 */
  lunarMonCN: string;
  /** 农历日期的中文写法 */
  lunarDayCN: string;
}

/**
 * LUNAR_INFO 数组值的计算原理：
 *
 * 每个值使用 16 进制表示，包括以下部分：
 * 1. 前 4 位：表示闰月的月份，如果没有闰月为 0。
 * 2. 中间 12 位：表示 1 到 12 月的大小月，1 为大月（30 天），0 为小月（29 天）。
 * 3. 后 4 位：表示闰月的天数，如果没有闰月为 0。
 *
 * 以 `0x04bd8` 为例：
 * - `0x` 表示这是一个 16 进制数。
 * - `04bd8` 是具体的 16 进制值。
 *
 * 转换为二进制后，`04bd8` 为 `0000 0100 1011 1101 1000`：
 * 1. 前 4 位 `0000`：表示该年份没有闰月（若有闰月，该值为闰月的月份）。
 * 2. 中间 12 位 `0100 1011 1101`：从左到右分别表示 1 到 12 月的天数。`1` 表示大月（30 天），`0` 表示小月（29 天）。
 *    - `0`（1月）：小月（29 天）
 *    - `1`（2月）：大月（30 天）
 *    - `0`（3月）：小月（29 天）
 *    - `1`（4月）：大月（30 天）
 *    - `0`（5月）：小月（29 天）
 *    - `1`（6月）：大月（30 天）
 *    - `1`（7月）：大月（30 天）
 *    - `1`（8月）：大月（30 天）
 *    - `1`（9月）：大月（30 天）
 *    - `1`（10月）：大月（30 天）
 *    - `0`（11月）：小月（29 天）
 *    - `0`（12月）：小月（29 天）
 * 3. 后 4 位 `1000`：表示闰月的天数。如果前 4 位为 `0000`（即没有闰月），则这一部分不使用。
 */
export const LUNAR_INFO: number[] = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, //1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, //1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, //1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, //1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, //1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, //1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, //1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, //1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, //1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, //1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, //2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, //2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, //2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, //2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, //2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, //2050-2059
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, //2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, //2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, //2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, //2090-2099
  0x0d520 //2100
];

export const CHINESE_NUMBER = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
export const NUMBER_MONTH: string[] = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
export const NUMBER_1: string[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const NUMBER_2: string[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
export const ZODIACS: string[] = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];