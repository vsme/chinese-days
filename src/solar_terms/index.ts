import dayjs, { Dayjs, type ConfigType } from "../utils/dayjs";
import { wrapDate } from '../utils'
import {
  SOLAR_TERMS_C_NUMS,
  SOLAR_TERMS_DELTA,
  SOLAR_TERMS_MONTH,
  SOLAR_TERMS,
  type SolarTermKey,
} from "./constants";

/* Get solar term date => 获取节气日期 */
const getSolarTermDate = (
  year: number,
  month: number,
  term: SolarTermKey
): string => {
  const century = year >= 2000 ? 21 : 20;
  const Y = year % 100;
  const D = 0.2422;
  const C = SOLAR_TERMS_C_NUMS[term][century === 21 ? 1 : 0];
  let L = Math.floor(Y / 4);

  if (
    [
      "lesser_cold",
      "greater_cold",
      "the_beginning_of_spring",
      "rain_water",
    ].includes(term)
  ) {
    L = Math.floor((Y - 1) / 4);
  }

  let day = Math.floor(Y * D + C) - L;
  const delta = SOLAR_TERMS_DELTA[`${year}_${term}` as keyof typeof SOLAR_TERMS_DELTA];
  if (delta) {
    day += delta;
  }

  return dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');
};

export interface SolarTerm {
  date: string;
  term: SolarTermKey;
  name: string;
};

/**
 * Get solar terms => 获取范围日期内的节气
 * @param start 开始日期
 * @param end 不传只查当天
 * @returns Array of solar terms => 节气数组
 */
const getSolarTerms = (
  start: ConfigType,
  end?: ConfigType
): SolarTerm[] => {
  const result: SolarTerm[] = [];
  let current = wrapDate(start);
  const endDate = wrapDate(end || start);

  while (current.isBefore(endDate) || current.isSame(endDate)) {
    const year = current.year();
    const month = current.month() + 1;

    SOLAR_TERMS_MONTH[month].forEach((term: SolarTermKey) => {
      const solarTermDate = dayjs(getSolarTermDate(year, month, term));
      if (
        (solarTermDate?.isBefore(endDate) || solarTermDate?.isSame(endDate)) &&
        (solarTermDate?.isAfter(current) || solarTermDate?.isSame(current))
      ) {
        result.push({
          date: solarTermDate.format("YYYY-MM-DD"),
          term,
          name: SOLAR_TERMS[term],
        });
      }
    });

    /* 处理下个日期 */
    month === 12
      ? (current = current.add(1, "year").startOf("year"))
      : (current = current.add(1, "month").startOf("month"));
  }

  return result;
};

export {
  getSolarTermDate,
  getSolarTerms,
}