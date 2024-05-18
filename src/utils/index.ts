import dayjs, { type Dayjs } from "dayjs";

// wrapDate to the start of the day
export const wrapDate = (date: dayjs.ConfigType): dayjs.Dayjs => {
  return dayjs(date).startOf("day");
};


export const getDates = (start: dayjs.ConfigType, end: dayjs.ConfigType): Dayjs[] => {
  start = wrapDate(start);
  end = wrapDate(end);
  const deltaDays = end.diff(start, 'day');
  return Array.from({ length: deltaDays + 1 }, (_, i) => start.add(i, 'day'));
}
