import Arrangement, { Holiday } from '../../src/holidays/arrangement';
import {
  isHoliday,
  isWorkday,
  isInLieu,
  getDayDetail,
  getHolidaysInRange,
  getWorkdaysInRange,
  findWorkday,
} from '../../src';

describe('Holiday Functions', () => {
  test('isHoliday should return correct boolean values', () => {
    const date1 = '2024-05-01';
    const date2 = '2024-05-06';

    expect(isHoliday(date1)).toBe(true); 
    expect(isHoliday(date2)).toBe(false);
  });

  test('isWorkday should return correct boolean values', () => {
    const date1 = '2024-05-01';
    const date2 = '2024-05-06';

    expect(isWorkday(date1)).toBe(false);
    expect(isWorkday(date2)).toBe(true); 
  });

  test('isInLieu should return correct boolean values', () => {
    const date1 = '2024-05-01';
    const date2 = '2024-05-03';

    expect(isInLieu(date1)).toBe(false);
    expect(isInLieu(date2)).toBe(true);
  });

  test('getDayDetail should return correct details', () => {
    const date = '2024-05-01';
    const detail = getDayDetail(date);

    expect(detail).toEqual({
      date: '2024-05-01',
      work: false,
      name: Holiday.L,
    });
  });

  test('getHolidaysInRange should return correct holidays within a range', () => {
    const start = '2024-05-01';
    const end = '2024-05-31';
    const holidaysInRange = getHolidaysInRange(start, end, true);

    expect(holidaysInRange).toContain('2024-05-01');
  });

  test('getWorkdaysInRange should return correct workdays within a range', () => {
    const start = '2024-05-01';
    const end = '2024-05-31';
    const workdaysInRange = getWorkdaysInRange(start, end, true);

    expect(workdaysInRange).toContain('2024-05-06');
  });

  test('findWorkday should return correct workday', () => {
    const date = '2024-05-01';
    const nextWorkday = findWorkday(1, date);

    expect(nextWorkday).toBe('2024-05-06');
  });
});

describe('Arrangement Class', () => {
  let arrangement: Arrangement;

  beforeEach(() => {
    arrangement = new Arrangement();
  });

  test('should correctly handle 2023 holidays', () => {
    arrangement.y(2024)
    .ny().r(1, 1)
    .s().r(2, 10).to(2, 17).w(2, 4).w(2, 18).i(2, 15).to(2, 16)
    .t().r(4, 4).to(4, 6).w(4, 7).i(4, 5)
    .l().r(5, 1).to(5, 5).w(4, 28).w(5, 11).i(5, 2).to(5, 3)
    .d().r(6, 10)
    .m().r(9, 15).to(9, 17).w(9, 14).i(9, 16)
    .n().r(10, 1).to(10, 7).w(9, 29).w(10, 12).i(10, 4).i(10, 7)

    expect(arrangement.holidays).toHaveProperty('2024-05-01');
    expect(arrangement.holidays).toHaveProperty('2024-05-02');
    expect(arrangement.holidays).toHaveProperty('2024-05-04');
    expect(arrangement.holidays).toHaveProperty('2024-05-05');
    expect(arrangement.workdays).toHaveProperty('2024-04-28');
    expect(arrangement.workdays).toHaveProperty('2024-05-11');
  });
});
