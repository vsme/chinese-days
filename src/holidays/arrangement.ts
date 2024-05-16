import dayjs from 'dayjs';

export enum Holiday {
  NewYearsDay = "New Year's Day,元旦,1",
  SpringFestival = "Spring Festival,春节,3",
  TombSweepingDay = "Tomb-sweeping Day,清明,1",
  LabourDay = "Labour Day,劳动节,1",
  DragonBoatFestival = "Dragon Boat Festival,端午,1",
  NationalDay = "National Day,国庆节,3",
  MidAutumnFestival = "Mid-autumn Festival,中秋,1",

  /** special holidays */
  AntiFascist70thDay = "Anti-Fascist 70th Day,中国人民抗日战争暨世界反法西斯战争胜利70周年纪念日,1",
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

const dayDetails: DayDetails = {};

const holidays: Record<string, Holiday> = {};
const workdays: Record<string, Holiday> = {};
const inLieuDays: Record<string, Holiday> = {};

const yearAt = (year: number) => {
  dayDetails.year = year;
  return arrangement;
}

const mark = (holiday: Holiday) => {
  dayDetails.holiday = holiday;
  return arrangement;
}

/* 存储 */
const save = (month: number, day: number, dayType: DayType) => {
  if (!dayDetails.year) {
    throw new Error("should set year before saving holiday");
  }
  if (!dayDetails.holiday) {
    throw new Error("should set holiday before saving holiday");
  }
  dayDetails.dayType = dayType;
  const date = dayjs(`${dayDetails.year}-${month}-${day}`);
  if (dayType === DayType.Holiday) {
    holidays[date.format('YYYY-MM-DD')] = dayDetails.holiday;
  } else if (dayType === DayType.Workday) {
    workdays[date.format('YYYY-MM-DD')] = dayDetails.holiday;
  } else if (dayType === DayType.InLieu) {
    inLieuDays[date.format('YYYY-MM-DD')] = dayDetails.holiday;
  }
  dayDetails.month = month;
  dayDetails.day = day;
  return arrangement;
}

/* 添加日期 */
const to = (month: number, day: number) => {
  if (!dayDetails.year || !dayDetails.month || !dayDetails.day) {
    throw new Error("should set year/month/day before saving holiday range");
  }
  const startDate = dayjs(`${dayDetails.year}-${dayDetails.month}-${dayDetails.day}`);
  const endDate = dayjs(`${dayDetails.year}-${month}-${day}`);
  if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
    throw new Error("end date should be after start date");
  }
  const diffDays = endDate.diff(startDate, 'day');
  for (let i = 1; i <= diffDays; i++) {
    const theDate = startDate.add(i, 'day');
    if (dayDetails.dayType === DayType.Holiday) {
      holidays[theDate.format('YYYY-MM-DD')] = dayDetails.holiday as Holiday;
    } else if (dayDetails.dayType === DayType.Workday) {
      workdays[theDate.format('YYYY-MM-DD')] = dayDetails.holiday as Holiday;
    } else if (dayDetails.dayType === DayType.InLieu) {
      inLieuDays[theDate.format('YYYY-MM-DD')] = dayDetails.holiday as Holiday;
    }
  }
  return arrangement;
}

const arrangement = {
  yearAt,
  to,

  work: (month: number, day: number) => save(month, day, DayType.Workday),
  rest: (month: number, day: number) => save(month, day, DayType.Holiday),
  inLieu: (month: number, day: number) => save(month, day, DayType.InLieu),
  
  // Special holiday markers
  nyd: () => mark(Holiday.NewYearsDay),
  sf: () => mark(Holiday.SpringFestival),
  tsd: () => mark(Holiday.TombSweepingDay),
  ld: () => mark(Holiday.LabourDay),
  dbf: () => mark(Holiday.DragonBoatFestival),
  nd: () => mark(Holiday.NationalDay),
  maf: () => mark(Holiday.MidAutumnFestival),
  afd: () => mark(Holiday.AntiFascist70thDay),
};

export {
  arrangement,
  holidays,
  workdays,
  inLieuDays
}
