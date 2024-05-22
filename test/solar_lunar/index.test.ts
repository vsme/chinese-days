import {
  getLunarDate,
  getLunarDatesInRange,
  getSolarDateFromLunar,
} from "../../src";

describe("solar_lunar", () => {
  test("getLunarDate should return correct lunar date for a given solar date", () => {
    let result = getLunarDate("2057-09-28");
    expect(result).toEqual({
      date: "2057-09-28",
      lunarYear: 2057,
      lunarMon: 8,
      lunarDay: 30,
      isLeap: false,
      lunarDayCN: "三十",
      lunarMonCN: "八月",
      lunarYearCN: "二零五七",
      yearCyl: "丁丑",
      monCyl: "己酉",
      dayCyl: "戊子",
      zodiac: "牛",
    });

    result = getLunarDate("2097-08-07");
    expect(result).toEqual({
      date: "2097-08-07",
      dayCyl: "丙寅",
      isLeap: false,
      lunarDay: 1,
      lunarDayCN: "初一",
      lunarMon: 7,
      lunarMonCN: "七月",
      lunarYear: 2097,
      lunarYearCN: "二零九七",
      monCyl: "戊申",
      yearCyl: "丁巳",
      zodiac: "蛇",
    });

    result = getLunarDate("2001-04-27");
    expect(result.isLeap).toBe(false);

    result = getLunarDate("2001-05-27");
    expect(result.isLeap).toBe(true);
  });

  test("getSolarDateFromLunar should return correct solar date for a given lunar date", () => {
    let result = getSolarDateFromLunar("2001-03-05");
    expect(result).toEqual({ date: "2001-03-29", leapMonthDate: undefined });

    result = getSolarDateFromLunar("2001-04-05");
    expect(result).toEqual({ date: "2001-04-27", leapMonthDate: "2001-05-27" });
  });

  test("getLunarDatesInRange should return correct lunar dates for a given solar date range", () => {
    let result = getLunarDatesInRange("2001-05-21", "2001-05-26");
    expect(result).toEqual([
      {
        date: "2001-05-21",
        lunarYear: 2001,
        lunarMon: 4,
        lunarDay: 29,
        isLeap: false,
        zodiac: "蛇",
        yearCyl: "辛巳",
        monCyl: "癸巳",
        dayCyl: "甲申",
        lunarYearCN: "二零零一",
        lunarMonCN: "四月",
        lunarDayCN: "廿九",
      },
      {
        date: "2001-05-22",
        lunarYear: 2001,
        lunarMon: 4,
        lunarDay: 30,
        isLeap: false,
        zodiac: "蛇",
        yearCyl: "辛巳",
        monCyl: "癸巳",
        dayCyl: "乙酉",
        lunarYearCN: "二零零一",
        lunarMonCN: "四月",
        lunarDayCN: "三十",
      },
      {
        date: "2001-05-23",
        lunarYear: 2001,
        lunarMon: 5,
        lunarDay: 1,
        isLeap: false,
        zodiac: "蛇",
        yearCyl: "辛巳",
        monCyl: "甲午",
        dayCyl: "丙戌",
        lunarYearCN: "二零零一",
        lunarMonCN: "五月",
        lunarDayCN: "初一",
      },
      {
        date: "2001-05-24",
        lunarYear: 2001,
        lunarMon: 4,
        lunarDay: 2,
        isLeap: true,
        zodiac: "蛇",
        yearCyl: "辛巳",
        monCyl: "癸巳",
        dayCyl: "丁亥",
        lunarYearCN: "二零零一",
        lunarMonCN: "四月",
        lunarDayCN: "初二",
      },
      {
        date: "2001-05-25",
        lunarYear: 2001,
        lunarMon: 4,
        lunarDay: 3,
        isLeap: true,
        zodiac: "蛇",
        yearCyl: "辛巳",
        monCyl: "癸巳",
        dayCyl: "戊子",
        lunarYearCN: "二零零一",
        lunarMonCN: "四月",
        lunarDayCN: "初三",
      },
      {
        date: "2001-05-26",
        lunarYear: 2001,
        lunarMon: 4,
        lunarDay: 4,
        isLeap: true,
        zodiac: "蛇",
        yearCyl: "辛巳",
        monCyl: "癸巳",
        dayCyl: "己丑",
        lunarYearCN: "二零零一",
        lunarMonCN: "四月",
        lunarDayCN: "初四",
      },
    ]);
  });
});
