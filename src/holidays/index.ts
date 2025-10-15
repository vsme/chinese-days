import dayjs, { Dayjs, type ConfigType } from '../utils/dayjs';
import { wrapDate, getDates } from '../utils';
import generate from './generate';

const { holidays, workdays, inLieuDays } = generate();

// 已简化为仅处理单个日期参数
const _validateDate = (dateInput: ConfigType): Dayjs => {
  // wrapDate 函数处理 Dayjs 实例及其他可供 dayjs() 使用的类型
  const date = wrapDate(dateInput);
  if (!date.isValid()) {
    // 注意：错误信息使用 `typeof dateInput` 以反映传入的原始类型。
    // `typeof date` 对于 Dayjs 实例将是 'object'。
    throw new Error(
      `unsupported type ${typeof dateInput}, expected type is Date or Dayjs`
    );
  }
  return date;
};

/** 是否节假日 */
const isHoliday = (date: ConfigType): boolean => {
  return !isWorkday(date);
};

/** 是否工作日 */
const isWorkday = (date: ConfigType): boolean => {
  const validDate = _validateDate(date);
  const weekday = validDate.day();
  const formattedDate = validDate.format('YYYY-MM-DD');

  return !!(
    workdays[formattedDate] ||
    (weekday >= 1 && weekday <= 5 && !holidays[formattedDate])
  );
};

/** 是否调休日 - 是节假日，但后续有需要补班 */
const isInLieu = (date: ConfigType): boolean => {
  const validDate = _validateDate(date);
  return !!inLieuDays[validDate.format('YYYY-MM-DD')];
};

/** 获取工作日详情 */
const getDayDetail = (
  date: ConfigType
): { work: boolean; name: string; date: string } => {
  const validDate = _validateDate(date);
  const formattedDate = validDate.format('YYYY-MM-DD');
  if (workdays[formattedDate]) {
    return {
      date: formattedDate,
      work: true,
      name: workdays[formattedDate],
    };
  } else if (holidays[formattedDate]) {
    return {
      date: formattedDate,
      work: false,
      name: holidays[formattedDate],
    };
  } else {
    const weekday = validDate.day();
    return {
      date: formattedDate,
      work: weekday !== 0 && weekday !== 6,
      name: validDate.format('dddd'),
    };
  }
};

/** 获取节假日 */
const getHolidaysInRange = (
  startInput: ConfigType,
  endInput: ConfigType,
  includeWeekends: boolean = true
): string[] => {
  const start = _validateDate(startInput);
  const end = _validateDate(endInput);
  if (includeWeekends) {
    return getDates(start, end)
      .filter(isHoliday)
      .map(date => date.format('YYYY-MM-DD'));
  }
  return getDates(start, end)
    .filter(date => holidays[date.format('YYYY-MM-DD')])
    .map(date => date.format('YYYY-MM-DD'));
};

/** 获取工作日 */
const getWorkdaysInRange = (
  startInput: ConfigType,
  endInput: ConfigType,
  includeWeekends: boolean = true
): string[] => {
  const start = _validateDate(startInput);
  const end = _validateDate(endInput);
  if (includeWeekends) {
    return getDates(start, end)
      .filter(isWorkday)
      .map(date => date.format('YYYY-MM-DD'));
  }
  return getDates(start, end)
    .filter(date => isWorkday(date) && date.day() >= 1 && date.day() <= 5)
    .map(date => date.format('YYYY-MM-DD'));
};

/* 查找从 date 开始 第 n 个工作日, 0 为当天 */
const findWorkday = (
  deltaDays: number = 0,
  date: ConfigType = dayjs()
): string => {
  date = wrapDate(date);

  if (deltaDays === 0) {
    if (isWorkday(date)) {
      return date.format('YYYY-MM-DD');
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

  return date.format('YYYY-MM-DD');
};

export {
  isHoliday,
  isWorkday,
  isInLieu,
  getDayDetail,
  getHolidaysInRange,
  getWorkdaysInRange,
  findWorkday,
};
