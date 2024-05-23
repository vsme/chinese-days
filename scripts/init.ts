import fs from "fs";
import generate from "./generate";
import { Holiday } from '../src/holidays/arrangement';
import dayjs from "../src/utils/dayjs";

const data = generate();

// 反向映射 Holiday 枚举
const holidayMap: Record<string, keyof typeof Holiday> = Object.fromEntries(
  Object.entries(Holiday).map(([key, value]) => [value, key as keyof typeof Holiday])
);

const mapToEnum = (obj: Record<string, string>): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (holidayMap[value]) {
      result[key] = `${holidayMap[value]}`;
    } else {
      result[key] = `${value}`;
    }
  }
  return result;
};

// 转换数据
const holidays = mapToEnum(data.holidays);
const workdays = mapToEnum(data.workdays);
const inLieuDays = mapToEnum(data.inLieuDays);

const startDate = dayjs('2000-01-01');

const getDaysSince2000 = (date: string): number => {
  const givenDate = dayjs(date);
  const diffDays = givenDate.diff(startDate, 'day');
  return diffDays;
}

const compress = (dates: Record<string, Holiday>) => {
  const compressedDates: Record<string, number[]> = {};
  for (const [date, holidayInfo] of Object.entries(dates)) {
    const [holidayName, ,] = holidayInfo.split(',');
    const daysSince2000 = getDaysSince2000(date);
    if (!compressedDates[holidayName]) {
      compressedDates[holidayName] = [];
    }
    compressedDates[holidayName].push(daysSince2000);
  }
  return compressedDates;
}

const tsContent = `/** 自动生成的文件，请勿手动修改，数字含义是与 2000 年 1 月 1 日 相差天数 */

export const holidays: Record<string, number[]> = ${JSON.stringify(compress(holidays))};
export const workdays: Record<string, number[]> = ${JSON.stringify(compress(workdays))};
export const inLieuDays: Record<string, number[]> = ${JSON.stringify(compress(inLieuDays))};`

// 保存到 constants.ts 文件
fs.writeFile('./src/holidays/constants.ts', tsContent, (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});