import dayjs, { Dayjs } from 'dayjs';
import { holidays, workdays, inLieuDays } from './arrangement';
import generate from './generate'

generate()

interface Holidays {
  [key: string]: string;
}

interface DayDetails {
  year: number | null;
  month: number | null;
  day: number | null;
  holiday: string | null;
  dayType: DayType | null;
}

enum DayType {
  Holiday,
  Workday,
  InLieu
}

const _wrapDate = (date: dayjs.ConfigType): Dayjs => {
  return dayjs(date);
}

const _validateDate = (...dates: dayjs.ConfigType[]): Dayjs | Dayjs[] => {
  if (dates.length !== 1) {
    return dates.map(date => _validateDate(date)) as Dayjs[];
  }
  const date = _wrapDate(dates[0]);
  if (!date.isValid()) {
    throw new Error(`unsupported type ${typeof date}, expected type is Date or Dayjs`);
  }
  const allHolidays = Object.keys(holidays).sort()
  const minYear = dayjs(allHolidays[0]).year();
  const maxYear = dayjs(allHolidays.slice(-1)[0]).year();
  if (!(minYear <= date.year() && date.year() <= maxYear)) {
    throw new Error(`no available data for year ${date.year()}, only year between [${minYear}, ${maxYear}] supported`);
  }
  return date;
}

/** 是否节假日 */
const isHoliday = (date: dayjs.ConfigType): boolean => {
  return !isWorkday(date);
}

/** 是否工作日 */
const isWorkday = (date: dayjs.ConfigType): boolean => {
  const validDate = _validateDate(date) as Dayjs;
  const weekday = validDate.day();
  const formattedDate = validDate.format('YYYY-MM-DD');

  return !!(workdays[formattedDate] || (weekday >= 1 && weekday <= 5 && !holidays[formattedDate]));
}

/** 是否调休日 - 是节假日，但后续有需要补班 */
const isInLieu = (date: dayjs.ConfigType): boolean => {
  date = _validateDate(date) as Dayjs;
  return !!inLieuDays[date.format('YYYY-MM-DD')];
}

/** 获取工作日详情 */
const getDayDetail = (date: dayjs.ConfigType): { work: boolean, name: string } => {
  date = _validateDate(date) as Dayjs;
  if (workdays[date.format('YYYY-MM-DD')]) {
    return {
      work: true,
      name: workdays[date.format('YYYY-MM-DD')]
    }
  } else if (holidays[date.format('YYYY-MM-DD')]) {
    return {
      work: false,
      name: holidays[date.format('YYYY-MM-DD')]
    }
  } else {
    const weekday = date.day();
    return {
      work: weekday !== 0 && weekday !== 6,
      name: date.format('dddd')
    }
  }
}

const getDates = (start: dayjs.ConfigType, end: dayjs.ConfigType): Dayjs[] => {
  start = _wrapDate(start);
  end = _wrapDate(end);
  const deltaDays = end.diff(start, 'day');
  return Array.from({ length: deltaDays + 1 }, (_, i) => start.add(i, 'day'));
}

/** 获取节假日 */
const getHolidays = (start: dayjs.ConfigType, end: dayjs.ConfigType, includeWeekends: boolean = true): Dayjs[] => {
  start = _validateDate(start) as Dayjs;
  end = _validateDate(end) as Dayjs;
  if (includeWeekends) {
    return getDates(start, end).filter(isHoliday);
  }
  return getDates(start, end).filter(date => holidays[date.format('YYYY-MM-DD')]);
}

/** 获取工作日 */
const getWorkdays = (start: dayjs.ConfigType, end: dayjs.ConfigType, includeWeekends: boolean = true): Dayjs[] => {
  start = _validateDate(start) as Dayjs;
  end = _validateDate(end) as Dayjs;
  if (includeWeekends) {
    return getDates(start, end).filter(isWorkday);
  }
  return getDates(start, end).filter(date => isWorkday(date) && date.day() >= 1 && date.day() <= 5);
}

/* 查找从 date 开始 第 n 个工作日, 0 为当天 */
const findWorkday = (deltaDays: number = 0, date: dayjs.ConfigType = dayjs()): Dayjs => {
  date = _wrapDate(date);

  if (deltaDays === 0) {
    if (isWorkday(date)) {
      return date;
    }
    deltaDays = 1;
  }

  const sign = deltaDays > 0 ? 1 : -1;
  let daysToAdd = Math.abs(deltaDays);

  while (daysToAdd > 0) {
    date = date.add(sign, 'day');
    if (isWorkday(date)) {
      daysToAdd--;
    }
  }

  return date;
}

export default {
  isInLieu,
  getDayDetail,
  getDates,
  getHolidays,
  getWorkdays,
  findWorkday,
}