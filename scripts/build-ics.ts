import fs from "fs";
import ical, {
  ICalEventClass,
  ICalEventStatus,
  ICalEventTransparency,
} from "ical-generator";
import generate from "../src/holidays/generate";
import dayjs, { Dayjs } from "../src/utils/dayjs";
import { Holiday } from "../src/holidays/arrangement";

const { holidays, workdays, inLieuDays } = generate();

const endYear = Number(Object.keys(holidays)[0].slice(0, 4))

// 创建一个新的日历
const cal = ical({
  name: "中国节假日",
  timezone: "Asia/Shanghai",
  prodId: { company: "yaavi.me", product: "Chinese Days", language: "CN" },
});

// 设置日历描述
cal.description(`${endYear - 2}~${endYear}年中国节假日日历`);

// 添加时区信息
cal.timezone({
  name: "Asia/Shanghai",
  generator: (tzid) => `
BEGIN:VTIMEZONE
TZID:${tzid}
X-LIC-LOCATION:${tzid}
BEGIN:STANDARD
TZOFFSETFROM:+0800
TZOFFSETTO:+0800
TZNAME:CST
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE`,
});

const buildHolidays = (
  year: number,
  days: Record<string, Holiday>,
  mark: "(休)" | "(班)" | string
) => {
  // 合并相同节日的日期
  const mergedHolidays: Record<
    string,
    {
      chineseName: string;
      dates: string[];
    }
  > = {};

  for (const [date, info] of Object.entries(days)) {
    if (date.startsWith(String(year))) {
      const [name, chineseName] = info.split(",");
      if (!mergedHolidays[name]) {
        mergedHolidays[name] = {
          chineseName,
          dates: [],
        };
      }
      mergedHolidays[name].dates.push(date);
    }
  }

  // 检查日期是否连续的函数
  const areDatesContinuous = (date1: Dayjs, date2: Dayjs) => {
    return dayjs(date2).diff(dayjs(date1), "day") === 1;
  };

  for (const [name, details] of Object.entries(mergedHolidays)) {
    const { chineseName, dates } = details;
    dates.sort(); // 确保日期按顺序排列

    let startDate = dayjs(dates[0]);
    let endDate = startDate;

    for (let i = 1; i < dates.length; i++) {
      const currentDate = dayjs(dates[i]);

      if (areDatesContinuous(endDate, currentDate)) {
        endDate = currentDate;
      } else {
        // 添加当前事件
        cal.createEvent({
          start: startDate.toDate(),
          end: endDate.add(1, "day").toDate(),
          description: `${chineseName}放假: 共${mark === '(休)' ? '休息' : '需补班'} ${dates.length} 天`,
          status: ICalEventStatus.CONFIRMED,
          summary: `${chineseName}${mark}`,
          transparency: ICalEventTransparency.TRANSPARENT,
          allDay: true,
          class: ICalEventClass.PUBLIC,
        });

        // 重置开始和结束日期
        startDate = currentDate;
        endDate = currentDate;
      }
    }

    // 添加最后一个事件
    cal.createEvent({
      start: startDate.toDate(),
      end: endDate.add(1, "day").toDate(),
      description: `${chineseName}放假: 共${mark === '(休)' ? '休息' : '需补班'} ${dates.length} 天`,
      status: ICalEventStatus.CONFIRMED,
      summary: `${chineseName}${mark}`,
      transparency: ICalEventTransparency.TRANSPARENT,
      allDay: true,
      class: ICalEventClass.PUBLIC,
    });
  }
};

for (let i = endYear; i > endYear - 3; i--) {
  buildHolidays(i, holidays, "(休)");
  buildHolidays(i, workdays, "(班)");
}

// 将日历保存到 ./dist/holidays.ics 文件
fs.writeFile("./dist/holidays.ics", cal.toString(), "utf8", (err) => {
  if (err) throw err;
  console.log("The ICS file has been saved!");
});
