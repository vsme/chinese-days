import fs from "fs";
import { Holiday } from "../src";
import dayjs from "../src/utils/dayjs";
import {
  holidays as compressedHolidays,
  workdays as compressedWorkdays,
  inLieuDays as compressedInLieuDays,
} from "../src/holidays/constants";

const getOriginal = (dates: Record<string, number[]>) => {
  const dateMap: Map<string, Holiday> = new Map();
  Object.keys(dates).forEach((key) => {
    const days = dates[key];
    days.forEach((n) => {
      dateMap.set(
        dayjs("2000-01-01").add(n, "day").format("YYYY-MM-DD"),
        Holiday[key as keyof typeof Holiday]
      );
    });
  });
  return Object.fromEntries(dateMap);
};

const holidays = getOriginal(compressedHolidays);
const workdays = getOriginal(compressedWorkdays);
const inLieuDays = getOriginal(compressedInLieuDays);

const tsContent = JSON.stringify({ holidays, workdays, inLieuDays });

// 保存到 ./dist/chinese-days.json 文件
fs.writeFile("./dist/chinese-days.json", tsContent, (err) => {
  if (err) throw err;
  console.log("The json file has been saved!");
});
