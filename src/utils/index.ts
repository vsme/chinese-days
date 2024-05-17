import dayjs from "dayjs";

// wrapDate to the start of the day
export const wrapDate = (date: dayjs.ConfigType): dayjs.Dayjs => {
  return dayjs(date).startOf("day");
};
