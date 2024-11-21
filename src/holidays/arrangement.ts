import dayjs from "../utils/dayjs";

export enum Holiday {
  NY = "New Year's Day,元旦",
  S = "Spring Festival,春节",
  T = "Tomb-sweeping Day,清明",
  L = "Labour Day,劳动节",
  D = "Dragon Boat Festival,端午",
  N = "National Day,国庆节",
  M = "Mid-autumn Festival,中秋",

  /** special holidays */
  A = "Anti-Fascist 70th Day,中国人民抗日战争暨世界反法西斯战争胜利70周年纪念日",
}

interface DayDetails {
  year?: number;
  month?: number;
  day?: number;
  holiday?: Holiday;
  dayType?: DayType;
}

enum DayType {
  Workday = 1,
  Holiday = 2,
  InLieu = 3,
}

/** 国务院规定的天数，1999-2025的变化 */
const holidayDays: Record<number, Partial<Record<Holiday, number>>> = {
  // 1999 元旦 1 天、春节、劳动节、国庆节放假 3天
  1999: {
    [Holiday.NY]: 1,
    [Holiday.S]: 3,
    [Holiday.L]: 3,
    [Holiday.N]: 3,
  },
  // 2008 劳动节改为 1 天，增加清明、端午、中秋各 1 天
  2008: {
    [Holiday.T]: 1,
    [Holiday.L]: 1,
    [Holiday.D]: 1,
    [Holiday.M]: 1,
  },
  // 2014 春节剔除除夕，改为初一、二、三，依旧 3 天
  // 2015 增加 中国人民抗日战争暨世界反法西斯战争胜利70周年纪念日 1 天
  2015: {
    [Holiday.A]: 1,
  },
  // 2025 春节和劳动节 各增加 1 天
  2025: {
    [Holiday.S]: 4,
    [Holiday.L]: 2,
  },
};

class Arrangement {
  private dayDetails: DayDetails = {};
  public holidays: Record<string, string> = {};
  public workdays: Record<string, string> = {};
  public inLieuDays: Record<string, string> = {};

  /** year at */
  y(year: number) {
    this.dayDetails.year = year;
    return this;
  }

  /** 查询某年 节假日天数 */
  getHolidayDays(year: number, holiday: Holiday): number {
    let lastDefinedDays = 0;

    // 遍历规则，查找适用于该年份的节日天数
    for (const [ruleYear, holidays] of Object.entries(holidayDays)) {
      const ruleYearNum = parseInt(ruleYear);
      if (ruleYearNum > year) break;
      if (holidays[holiday] !== undefined) {
        lastDefinedDays = holidays[holiday];
      }
    }

    return lastDefinedDays;
  }

  mark(holiday: Holiday) {
    this.dayDetails.holiday = holiday;
    return this;
  }

  save(month: number, day: number, dayType: DayType) {
    if (!this.dayDetails.year) {
      throw new Error("should set year before saving holiday");
    }
    if (!this.dayDetails.holiday) {
      throw new Error("should set holiday before saving holiday");
    }

    this.dayDetails.month = month;
    this.dayDetails.day = day;
    this.dayDetails.dayType = dayType;

    const date = dayjs(`${this.dayDetails.year}-${month}-${day}`).format("YYYY-MM-DD");
    const holidayDays = this.getHolidayDays(this.dayDetails.year, this.dayDetails.holiday);
    const holidayDescription = `${this.dayDetails.holiday},${holidayDays}`

    if (dayType === DayType.Holiday) {
      this.holidays[date] = holidayDescription;
    } else if (dayType === DayType.Workday) {
      this.workdays[date] = holidayDescription;
    } else if (dayType === DayType.InLieu) {
      this.inLieuDays[date] = holidayDescription;
    }
    return this;
  }

  to(month: number, day: number) {
    if (
      !this.dayDetails.holiday ||
      !this.dayDetails.year ||
      !this.dayDetails.month ||
      !this.dayDetails.day
    ) {
      throw new Error("should set year/month/day before saving holiday range");
    }
    const startDate = dayjs(
      `${this.dayDetails.year}-${this.dayDetails.month}-${this.dayDetails.day}`
    );
    const endDate = dayjs(`${this.dayDetails.year}-${month}-${day}`);
    if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
      throw new Error("end date should be after start date");
    }

    const holidayDays = this.getHolidayDays(this.dayDetails.year, this.dayDetails.holiday);
    const holidayDescription = `${this.dayDetails.holiday},${holidayDays}`

    const diffDays = endDate.diff(startDate, "day");
    for (let i = 1; i <= diffDays; i++) {
      const theDate = startDate.add(i, "day").format("YYYY-MM-DD");
      if (this.dayDetails.dayType === DayType.Holiday) {
        this.holidays[theDate] = holidayDescription;
      } else if (this.dayDetails.dayType === DayType.Workday) {
        this.workdays[theDate] = holidayDescription;
      } else if (this.dayDetails.dayType === DayType.InLieu) {
        this.inLieuDays[theDate] = holidayDescription;
      }
    }
    return this;
  }

  /** work day */
  w(month: number, day: number) {
    return this.save(month, day, DayType.Workday);
  }
  /** rest */
  r(month: number, day: number) {
    return this.save(month, day, DayType.Holiday);
  }
  /** in-lieu */
  i(month: number, day: number) {
    return this.save(month, day, DayType.InLieu);
  }

  /** New Year's Day 元旦 */
  ny() {
    return this.mark(Holiday.NY);
  }
  /** Spring Festival 春节 */
  s() {
    return this.mark(Holiday.S);
  }
  /** Tomb-sweeping Day 清明 */
  t() {
    return this.mark(Holiday.T);
  }

  /** Labour Day 五一 */
  l() {
    return this.mark(Holiday.L);
  }
  /** Dragon Boat Festival 端午 */
  d() {
    return this.mark(Holiday.D);
  }
  /** National Day 国庆节 */
  n() {
    return this.mark(Holiday.N);
  }
  /** Mid-autumn Festival 中秋 */
  m() {
    return this.mark(Holiday.M);
  }
  /** Anti-Fascist 70th Day 中国人民抗日战争暨世界反法西斯战争胜利70周年纪念日 */
  a() {
    return this.mark(Holiday.A);
  }
}

export default Arrangement;
