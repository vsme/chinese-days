/* 自己实现一个简易的 dayjs，供项目中使用 */
export type ConfigType = string | number | Date | Dayjs | null | undefined;

export class Dayjs {
  private _date: Date;
  private static daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  constructor(date?: ConfigType) {
    if (date instanceof Dayjs) {
      this._date = new Date(date.toDate());
    } else if (date instanceof Date) {
      this._date = new Date(date);
    } else if (typeof date === "string" || typeof date === "number") {
      this._date = new Date(date);
    } else {
      this._date = new Date();
    }
  }

  toDate(): Date {
    return this._date;
  }

  isValid(): boolean {
    return !isNaN(this._date.getTime());
  }

  diff(
    date: string | number | Date | Dayjs | null | undefined,
    unit: "day" | "month" | "year" = "day"
  ): number {
    const targetDate = new Dayjs(date).toDate();
    const diffTime = this._date.getTime() - targetDate.getTime();
    switch (unit) {
      case "year":
        return this._date.getFullYear() - targetDate.getFullYear();
      case "month":
        return (
          (this._date.getFullYear() - targetDate.getFullYear()) * 12 +
          (this._date.getMonth() - targetDate.getMonth())
        );
      case "day":
      default:
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  startOf(unit?: "year" | "month" | "day"): Dayjs {
    const newDate = new Date(this._date);
    switch (unit) {
      case "year":
        newDate.setMonth(0);
        newDate.setDate(1);
        newDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        newDate.setDate(1);
        newDate.setHours(0, 0, 0, 0);
        break;
      case "day":
        newDate.setHours(0, 0, 0, 0);
        break;
    }
    return new Dayjs(newDate);
  }

  endOf(unit?: "year" | "month" | "day"): Dayjs {
    const newDate = new Date(this._date);
    switch (unit) {
      case "year":
        newDate.setMonth(11);
        newDate.setDate(31);
        newDate.setHours(23, 59, 59, 999);
        break;
      case "month":
        newDate.setDate(new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate());
        newDate.setHours(23, 59, 59, 999);
        break;
      case "day":
        newDate.setHours(23, 59, 59, 999);
        break;
    }
    return new Dayjs(newDate);
  }

  add(value: number, unit: "year" | "month" | "day"): Dayjs {
    const newDate = new Date(this._date);
    switch (unit) {
      case "year":
        newDate.setFullYear(newDate.getFullYear() + value);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + value);
        break;
      case "day":
        newDate.setDate(newDate.getDate() + value);
        break;
    }
    return new Dayjs(newDate);
  }

  subtract(value: number, unit: "year" | "month" | "day"): Dayjs {
    return this.add(-value, unit);
  }

  format(formatStr: string): string {
    const map: { [key: string]: number | string } = {
      YYYY: this._date.getFullYear(),
      MM: (this._date.getMonth() + 1).toString().padStart(2, "0"),
      DD: this._date.getDate().toString().padStart(2, "0"),
      HH: this._date.getHours().toString().padStart(2, "0"),
      mm: this._date.getMinutes().toString().padStart(2, "0"),
      ss: this._date.getSeconds().toString().padStart(2, "0"),
      dddd: Dayjs.daysOfWeek[this._date.getDay()],
    };

    return formatStr.replace(/YYYY|MM|DD|HH|mm|ss|dddd/g, (matched) => {
      return map[matched].toString();
    });
  }

  year(): number;
  year(year: number): Dayjs;
  year(year?: number): number | Dayjs {
    if (year === undefined) return this._date.getFullYear();
    const newDate = new Date(this._date);
    newDate.setFullYear(year);
    return new Dayjs(newDate);
  }

  month(): number;
  month(month: number): Dayjs;
  month(month?: number): number | Dayjs {
    if (month === undefined) return this._date.getMonth();
    const newDate = new Date(this._date);
    newDate.setMonth(month);
    return new Dayjs(newDate);
  }

  date(): number;
  date(day: number): Dayjs;
  date(day?: number): number | Dayjs {
    if (day === undefined) return this._date.getDate();
    const newDate = new Date(this._date);
    newDate.setDate(day);
    return new Dayjs(newDate);
  }

  day(): number;
  day(day: number): Dayjs;
  day(day?: number): number | Dayjs {
    if (day === undefined) {
      return this._date.getDay();
    } else {
      const currentDay = this._date.getDay();
      const diff = day - currentDay;
      const newDate = new Date(this._date);
      newDate.setDate(this._date.getDate() + diff);
      return new Dayjs(newDate);
    }
  }

  isBefore(date: string | number | Date | Dayjs | null | undefined): boolean {
    const targetDate = new Dayjs(date).toDate();
    return this._date.getTime() < targetDate.getTime();
  }

  isAfter(date: string | number | Date | Dayjs | null | undefined): boolean {
    const targetDate = new Dayjs(date).toDate();
    return this._date.getTime() > targetDate.getTime();
  }

  isSame(
    date: string | number | Date | Dayjs | null | undefined,
    unit: "year" | "month" | "day" = "day"
  ): boolean {
    const targetDate = new Dayjs(date).toDate();
    switch (unit) {
      case "year":
        return this._date.getFullYear() === targetDate.getFullYear();
      case "month":
        return (
          this._date.getFullYear() === targetDate.getFullYear() &&
          this._date.getMonth() === targetDate.getMonth()
        );
      case "day":
      default:
        return (
          this._date.getFullYear() === targetDate.getFullYear() &&
          this._date.getMonth() === targetDate.getMonth() &&
          this._date.getDate() === targetDate.getDate()
        );
    }
  }

  isBetween(
    startDate: string | number | Date | Dayjs | null | undefined,
    endDate: string | number | Date | Dayjs | null | undefined,
    unit?: "year" | "month" | "day"
  ): boolean {
    const start = new Dayjs(startDate).startOf(unit);
    const end = new Dayjs(endDate).endOf(unit);
    return this.isAfter(start) && this.isBefore(end) || this.isSame(start) || this.isSame(end);
  }
}

const simpleDayjs = (date?: ConfigType): Dayjs => new Dayjs(date);

export default simpleDayjs;
