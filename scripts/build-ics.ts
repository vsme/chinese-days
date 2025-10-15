import fs from "fs";
import ical, {
  ICalEventClass,
  ICalEventStatus,
  ICalEventTransparency,
} from "ical-generator";
import generate from "../src/holidays/generate";
import dayjs, { Dayjs } from "../src/utils/dayjs";
import { createHash } from 'crypto';

enum DayType {
  Workday = 1,
  Holiday = 2,
}

const { holidays, workdays } = generate();
const endYear = Number(Object.keys(holidays)[0].slice(0, 4))

// 确保 dist 和 dist/years 目录存在
fs.mkdirSync("./dist", { recursive: true });
fs.mkdirSync("./dist/years", { recursive: true });

// 获取所有年份
const getAllYears = () => {
  const years = new Set<number>();
  Object.keys(holidays).forEach(date => years.add(Number(date.slice(0, 4))));
  Object.keys(workdays).forEach(date => years.add(Number(date.slice(0, 4))));
  return Array.from(years).sort((a, b) => b - a);
};

const buildIcal = (language: 'CN' | 'EN', years?: number[], yearSuffix?: string) => {
  const targetYears = years || [endYear, endYear - 1, endYear - 2];
  const yearRange = years ? (years.length === 1 ? `${years[0]}` : `${Math.min(...years)}~${Math.max(...years)}`) : `${endYear - 2}~${endYear}`;
  
  const info = language == 'CN' ? {
    name: '中国节假日',
    desc: `${yearRange}年中国节假日日历`,
    location: '北京',
    categories: '节假日',
    holiday: '休',
    workday: '班'
  } : {
    name: 'Chinese Public Holidays',
    desc: `Calendar of Chinese Public Holidays for ${yearRange} Years`,
    location: 'Beijing',
    categories: 'Holidays',
    holiday: 'Holiday',
    workday: 'Workday',
  }
  // 创建一个新的日历
  const cal = ical({
    name: info.name,
    timezone: "Asia/Shanghai",
    prodId: { company: "yaavi.me", product: "Chinese Days", language },
  });

  // 设置日历描述
  cal.description(info.desc);

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

  const calAddDays = (startDate: Dayjs, endDate: Dayjs, name: string, mark: DayType) => {
    // 基于事件生成稳定的哈希值
    const generateStableUUID = () => {
      const hash = createHash('sha256');
      hash.update(name + startDate.toDate().toISOString() + endDate.toDate().toISOString() + mark);
      return hash.digest('hex');
    };

    cal.createEvent({
      start: startDate.toDate(),
      end: endDate.add(1, "day").toDate(),
      description: `${mark === DayType.Holiday ? info.holiday : info.workday}`,
      status: ICalEventStatus.CONFIRMED,
      summary: `${name}(${mark === DayType.Holiday ? info.holiday : info.workday})`,
      location: info.location,
      transparency: ICalEventTransparency.TRANSPARENT,
      allDay: true,
      class: ICalEventClass.PUBLIC,
      categories: [{ name: info.categories }],
      x: [
        { key: 'X-MICROSOFT-CDO-ALLDAYEVENT', value: 'TRUE' },
        { key: 'X-MICROSOFT-MSNCALENDAR-ALLDAYEVENT', value: 'TRUE' },
        ...(
          mark == DayType.Holiday
            ? [{ key: 'X-APPLE-SPECIAL-DAY', value: 'WORK-HOLIDAY' }]
            : mark == DayType.Workday
              ? [{ key: 'X-APPLE-SPECIAL-DAY', value: 'ALTERNATE-WORKDAY' }]
              : []
        ),
        { key: 'X-APPLE-UNIVERSAL-ID', value: generateStableUUID() }
      ]
    });
  }

  const buildHolidays = (
    years: number[],
    days: Record<string, string>,
    mark: DayType
  ) => {
    // 合并相同节日的日期
    const mergedHolidays: Record<string, { chineseName: string; dates: string[] }> = {};

    for (const [date, info] of Object.entries(days)) {
      if (years.includes(Number(date.slice(0, 4)))) {
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
      return dayjs(date2).diff(date1, "day") === 1;
    };

    for (const [name, { chineseName, dates }] of Object.entries(mergedHolidays)) {
      dates.sort(); // 确保日期按顺序排列

      let startDate = dayjs(dates[0]);
      let endDate = startDate;

      for (let i = 1; i < dates.length; i++) {
        const currentDate = dayjs(dates[i]);

        if (areDatesContinuous(endDate, currentDate)) {
          endDate = currentDate;
        } else {
          // 添加当前事件
          calAddDays(startDate, endDate, language == 'CN' ? chineseName : name, mark);

          // 重置开始和结束日期
          startDate = currentDate;
          endDate = currentDate;
        }
      }

      // 添加最后一个事件
      calAddDays(startDate, endDate, language == 'CN' ? chineseName : name, mark);
    }
  };

  buildHolidays(targetYears, holidays, DayType.Holiday);
  buildHolidays(targetYears, workdays, DayType.Workday);

  // 生成文件名
  const fileName = yearSuffix && years && years.length > 0
    ? `./dist/years/${years[0]}${language == 'CN' ? '' : '.en'}.ics`
    : `./dist/holidays${language == 'CN' ? '' : '.en'}.ics`;

  // 将日历保存到文件
  fs.writeFile(fileName, cal.toString(), "utf8", (err) => {
    if (err) throw err;
    console.log(`The ${language} ICS file has been saved to ${fileName}!`);
  });
}

// 生成总的 ICS 文件（保持原有功能）
buildIcal('CN')
buildIcal('EN')

// 生成按年份分组的 ICS 文件
const allYears = getAllYears();
allYears.forEach(year => {
  buildIcal('CN', [year], `${year}`);
  buildIcal('EN', [year], `${year}`);
});

console.log(`Generated ICS files for years: ${allYears.join(', ')}`);