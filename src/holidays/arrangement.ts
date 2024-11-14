import dayjs from "../utils/dayjs";

export enum Holiday {
  NY = "New Year's Day,元旦,1",
  S = "Spring Festival,春节,4",
  T = "Tomb-sweeping Day,清明,1",
  L = "Labour Day,劳动节,2",
  D = "Dragon Boat Festival,端午,1",
  N = "National Day,国庆节,3",
  M = "Mid-autumn Festival,中秋,1",

  /** special holidays */
  A = "Anti-Fascist 70th Day,中国人民抗日战争暨世界反法西斯战争胜利70周年纪念日,1",
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

class Arrangement {
  private dayDetails: DayDetails = {};
  public holidays: Record<string, Holiday> = {};
  public workdays: Record<string, Holiday> = {};
  public inLieuDays: Record<string, Holiday> = {};

  /** year at */
  y(year: number) {
    this.dayDetails.year = year;
    return this;
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
    this.dayDetails.dayType = dayType;
    const date = dayjs(`${this.dayDetails.year}-${month}-${day}`);
    if (dayType === DayType.Holiday) {
      this.holidays[date.format("YYYY-MM-DD")] = this.dayDetails.holiday;
    } else if (dayType === DayType.Workday) {
      this.workdays[date.format("YYYY-MM-DD")] = this.dayDetails.holiday;
    } else if (dayType === DayType.InLieu) {
      this.inLieuDays[date.format("YYYY-MM-DD")] = this.dayDetails.holiday;
    }
    this.dayDetails.month = month;
    this.dayDetails.day = day;
    return this;
  }

  to(month: number, day: number) {
    if (
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
    const diffDays = endDate.diff(startDate, "day");
    for (let i = 1; i <= diffDays; i++) {
      const theDate = startDate.add(i, "day");
      if (this.dayDetails.dayType === DayType.Holiday) {
        this.holidays[theDate.format("YYYY-MM-DD")] = this.dayDetails
          .holiday as Holiday;
      } else if (this.dayDetails.dayType === DayType.Workday) {
        this.workdays[theDate.format("YYYY-MM-DD")] = this.dayDetails
          .holiday as Holiday;
      } else if (this.dayDetails.dayType === DayType.InLieu) {
        this.inLieuDays[theDate.format("YYYY-MM-DD")] = this.dayDetails
          .holiday as Holiday;
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
