import fs from "fs";
import generate from "./generate";
import { Holiday } from '../src/holidays/arrangement';

const data = generate();

// 反向映射 Holiday 枚举
const holidayMap: Record<string, keyof typeof Holiday> = Object.fromEntries(
  Object.entries(Holiday).map(([key, value]) => [value, key as keyof typeof Holiday])
);

// 映射函数
type RecordStringHoliday = Record<string, Holiday>;
type RecordStringName = Record<string, { name: string }>;

const mapToEnum = (obj: Record<string, string>): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (holidayMap[value]) {
      result[key] = `Holiday.${holidayMap[value]}`;
    } else {
      result[key] = `{ name: "${value}" }`;
    }
  }
  return result;
};

// 转换数据
const holidays = mapToEnum(data.holidays);
const workdays = mapToEnum(data.workdays);
const inLieuDays = mapToEnum(data.inLieuDays);

const formatObjectString = (obj: Record<string, any>): string => {
  const entries = Object.entries(obj).map(([key, value]) => `  "${key}": ${value}`);
  return `{\n${entries.join(",\n")}\n}`;
};

const tsContent = `import { Holiday } from "./arrangement";

export const holidays: Record<string, Holiday> = ${formatObjectString(holidays)};
export const workdays: Record<string, Holiday> = ${formatObjectString(workdays)};
export const inLieuDays: Record<string, Holiday> = ${formatObjectString(inLieuDays)};
`;

// 保存到 arrangement.ts 文件
fs.writeFile('./src/holidays/constants.ts', tsContent, (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});
