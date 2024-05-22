import dayjs from 'dayjs';
import { holidays, workdays, inLieuDays } from '../../src/holidays/constants';
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
      name: holidays['2024-05-01'],
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
    arrangement.yearAt(2024)
    .nyd().rest(1, 1)
    .sf().rest(2, 10).to(2, 17).work(2, 4).work(2, 18).inLieu(2, 15).to(2, 16)
    .tsd().rest(4, 4).to(4, 6).work(4, 7).inLieu(4, 5)
    .ld().rest(5, 1).to(5, 5).work(4, 28).work(5, 11).inLieu(5, 2).to(5, 3)
    .dbf().rest(6, 10)
    .maf().rest(9, 15).to(9, 17).work(9, 14).inLieu(9, 16)
    .nd().rest(10, 1).to(10, 7).work(9, 29).work(10, 12).inLieu(10, 4).inLieu(10, 7)

    expect(arrangement.holidays).toHaveProperty('2024-05-01');
    expect(arrangement.holidays).toHaveProperty('2024-05-02');
    expect(arrangement.holidays).toHaveProperty('2024-05-04');
    expect(arrangement.holidays).toHaveProperty('2024-05-05');
    expect(arrangement.workdays).toHaveProperty('2024-04-28');
    expect(arrangement.workdays).toHaveProperty('2024-05-11');
  });
});
