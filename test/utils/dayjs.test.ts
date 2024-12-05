import simpleDayjs from "../../src/utils/dayjs";
// import simpleDayjs from "dayjs";

describe("SimpleDayjs", () => {
  it("should return true for a valid date", () => {
    let date = simpleDayjs();
    expect(date.isValid()).toBe(true);

    date = simpleDayjs("2024-02-10");
    expect(date.isValid()).toBe(true);
  });

  it("should return false for an invalid date", () => {
    const date = simpleDayjs("invalid-date");
    expect(date.isValid()).toBe(false);
  });

  it("should calculate the difference", () => {
    const date1 = simpleDayjs("2024-02-10");
    const date2 = simpleDayjs("2000-01-01");
    expect(date1.diff(date2, "year")).toBe(24);
    expect(date1.diff(date2, "month")).toBe(289);
    expect(date1.diff(date2, "day")).toBe(8806);
    expect(date1.diff(date2)).toBe(8806);
  });

  it("should format the start of the year", () => {
    const date = simpleDayjs("2024-02-10");
    expect(date.startOf("year").format("YYYY-MM-DD")).toBe("2024-01-01");
  });

  it("should format the end of the ...", () => {
    const date = simpleDayjs("2024-02-10");
    expect(date.endOf("year").format("YYYY-MM-DD HH:mm:ss")).toBe("2024-12-31 23:59:59");
    expect(date.endOf("month").format("YYYY-MM-DD HH:mm:ss")).toBe("2024-02-29 23:59:59");
    expect(date.endOf("day").format("YYYY-MM-DD HH:mm:ss")).toBe("2024-02-10 23:59:59");
  });

  it("should add one month to the date", () => {
    const date = simpleDayjs("2024-02-10");
    expect(date.add(1, "month").format("YYYY-MM-DD")).toBe("2024-03-10");
  });

  it("should get and set the year", () => {
    const date = simpleDayjs("2024-02-10");
    expect(date.year()).toBe(2024);
    expect(date.year(2025).format("YYYY-MM-DD")).toBe("2025-02-10");
  });

  it("should get and set the month", () => {
    const date = simpleDayjs("2024-02-10");
    expect(date.month()).toBe(1); // 注意月份是从0开始的
    expect(date.month(5).format("YYYY-MM-DD")).toBe("2024-06-10");
  });

  it("should get and set the date", () => {
    const date = simpleDayjs("2024-02-10");
    expect(date.date()).toBe(10);
    expect(date.date(15).format("YYYY-MM-DD")).toBe("2024-02-15");
  });

  it("should return the day of the week", () => {
    const date = simpleDayjs("2024-02-10");
    expect(date.day()).toBe(6); // 6 表示星期六
  });

  it("should set the day of the week and return the new date", () => {
    const date = simpleDayjs("2024-02-10");
    expect(date.day(1).format("YYYY-MM-DD")).toBe("2024-02-05"); // 将日期调整到下一个星期一
  });

  it("should format the date with day of the week", () => {
    const date = simpleDayjs("2024-02-10");
    expect(date.format("dddd, YYYY-MM-DD")).toBe("Saturday, 2024-02-10");
  });

  it("should check if a date is before another date", () => {
    const date1 = simpleDayjs("2024-02-10");
    const date2 = simpleDayjs("2023-01-01");
    expect(date1.isBefore(date2)).toBe(false);
  });

  it("should check if a date is after another date", () => {
    const date1 = simpleDayjs("2024-02-10");
    const date2 = simpleDayjs("2023-01-01");
    expect(date1.isAfter(date2)).toBe(true);
  });

  it("should check if two dates are the same (day)", () => {
    const date1 = simpleDayjs("2024-02-10");
    const date2 = simpleDayjs("2024-02-10");
    expect(date1.isSame(date2, "day")).toBe(true);
  });

  it("should check if two dates are the same (month)", () => {
    const date1 = simpleDayjs("2024-02-10");
    const date2 = simpleDayjs("2024-02-01");
    expect(date1.isSame(date2, "month")).toBe(true);
  });

  it("should check if two dates are the same (year)", () => {
    const date1 = simpleDayjs("2024-02-10");
    const date2 = simpleDayjs("2024-01-01");
    expect(date1.isSame(date2, "year")).toBe(true);
  });
});
