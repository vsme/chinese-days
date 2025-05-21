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
  test('should throw an error for invalid date', () => {
    // The error message uses `typeof date` where `date` is the Dayjs object.
    // So, it will always be 'object' if the error is thrown from _validateDate's check.
    expect(() => isHoliday('invalid-date')).toThrow(
      'unsupported type object, expected type is Date or Dayjs'
    );
    // Test with other functions that use _validateDate with various invalid inputs
    expect(() => isWorkday('invalid-date-for-isWorkday')).toThrow(
      'unsupported type object, expected type is Date or Dayjs'
    );
    expect(() => getDayDetail('yet-another-invalid-date')).toThrow( // Use a known invalid string
      'unsupported type object, expected type is Date or Dayjs'
    );
     // For numeric input like 12345, dayjs(12345) is a valid date (Unix ms timestamp).
     // So, _validateDate does NOT throw an error. isInLieu(12345) would then calculate based on that date.
     // Assuming 1970-01-01T00:00:12.345Z is not an inLieu day.
     expect(isInLieu(12345)).toBe(false); // This was correct.

    // Test _validateDate with multiple arguments (indirectly)
    // Use a known invalid string for one and a valid for other to ensure proper handling
    expect(() => getHolidaysInRange('invalid-start', '2024-01-01')).toThrow(
      'unsupported type object, expected type is Date or Dayjs'
    );
    expect(() => getWorkdaysInRange('2024-01-01', 'invalid-end')).toThrow(
      'unsupported type object, expected type is Date or Dayjs'
    );
     // Specifically target line 12 (formerly line 9) in _validateDate: throw new Error(`unsupported type ${typeof date}, ...`);
     // by providing an input (an invalid string) that results in date.isValid() being false.
     // The error message will use `typeof date` (which is 'object').
     const testLine12DirectlyViaGetDayDetail = () => {
      getDayDetail('final-check-invalid-date');
     };
     expect(testLine12DirectlyViaGetDayDetail).toThrow('unsupported type object, expected type is Date or Dayjs');

     // Test with an actual invalid Date object.
     // dayjs(new Date('foo')) results in a Dayjs object where isValid() is false.
     // typeof date (the Dayjs object) is 'object'.
     expect(() => isHoliday(new Date('foo'))).toThrow('unsupported type object, expected type is Date or Dayjs');
  });


  describe.each([
    { fn: isHoliday, fnName: 'isHoliday', cases: [
      { date: '2024-05-01', expected: true, desc: 'Labour Day' },
      { date: '2024-05-06', expected: false, desc: 'Regular Monday' },
      { date: '2024-01-01', expected: true, desc: "New Year's Day 2024" },
      { date: '2023-12-31', expected: true, desc: 'Sunday NYE 2023 (Weekend)' },
      { date: '2024-02-29', expected: false, desc: 'Leap day 2024 (Thursday)' },
      { date: '2023-02-28', expected: false, desc: 'Non-leap year Feb 28th (Tuesday)' },
      { date: '2024-10-05', expected: true, desc: 'National Day Holiday Period (Saturday)' }, // Weekend during holiday period
      { date: '2024-10-07', expected: true, desc: 'National Day Holiday Period (Monday)' },   // Weekday during holiday period
      { date: '2024-04-04', expected: true, desc: 'Tomb Sweeping Day 2024 (Thursday)' },
      { date: '2024-04-06', expected: true, desc: 'Tomb Sweeping Day makeup (Saturday)' },
      { date: '2024-04-07', expected: false, desc: 'Tomb Sweeping Day makeup work (Sunday)' }, // This is a workday
    ]},
    { fn: isWorkday, fnName: 'isWorkday', cases: [
      { date: '2024-05-01', expected: false, desc: 'Labour Day' },
      { date: '2024-05-06', expected: true, desc: 'Regular Monday' },
      { date: '2024-01-01', expected: false, desc: "New Year's Day 2024" },
      { date: '2023-12-31', expected: false, desc: 'Sunday NYE 2023 (Weekend)' },
      { date: '2024-02-29', expected: true, desc: 'Leap day 2024 (Thursday)' },
      { date: '2023-02-28', expected: true, desc: 'Non-leap year Feb 28th (Tuesday)' },
      { date: '2024-10-05', expected: false, desc: 'National Day Holiday Period (Saturday)' },
      { date: '2024-10-07', expected: false, desc: 'National Day Holiday Period (Monday)' },
      { date: '2024-04-07', expected: true, desc: 'Tomb Sweeping Day makeup work (Sunday)' }, // This is a workday
      { date: '2024-05-11', expected: true, desc: 'Labour Day makeup work (Saturday)' }, // This is a workday
    ]},
    { fn: isInLieu, fnName: 'isInLieu', cases: [
      { date: '2024-05-01', expected: false, desc: 'Labour Day (actual holiday, not in lieu)' }, // Labour day itself is not "inLieu" but part of a holiday period that has inLieu days
      { date: '2024-05-03', expected: true, desc: 'Labour Day holiday period (in lieu)' },
      { date: '2024-05-06', expected: false, desc: 'Regular Monday (not in lieu)' },
      { date: '2024-02-15', expected: true, desc: 'Spring Festival (in lieu)' }, // Feb 15 is an inLieu day
      { date: '2024-02-16', expected: true, desc: 'Spring Festival (in lieu)' }, // Feb 16 is an inLieu day
      { date: '2024-02-17', expected: false, desc: 'Spring Festival holiday (Saturday), but not specifically inLieu' }, // Feb 17 is a holiday, not inLieu
      { date: '2024-02-18', expected: false, desc: 'Spring Festival makeup work (Sunday), not inLieu holiday'},
    ]},
  ])('$fnName', ({ fn, cases }) => {
    test.each(cases)('$fnName("$date") should be $expected ($desc)', ({ date, expected }) => {
      expect(fn(date)).toBe(expected);
    });
  });

  test('getDayDetail should return correct details', () => {
    const date = '2024-04-29'; // Regular Monday
    const detail = getDayDetail(date);

    expect(detail).toEqual({
      date: '2024-04-29',
      work: true,
      name: "Monday",
    });
  });

  // Refactor getDayDetail tests to be data-driven
  describe('getDayDetail', () => {
    const testCases = [
      {
        date: '2025-01-26', // Sunday, but a makeup workday for Spring Festival
        expected: { date: '2025-01-26', work: true, name: "Spring Festival,春节,4" },
        desc: 'Makeup workday (Sunday) for Spring Festival'
      },
      {
        date: '2024-05-01', // Labour Day (Holiday)
        expected: { date: '2024-05-01', work: false, name: "Labour Day,劳动节,1" },
        desc: 'Actual holiday (Labour Day)'
      },
      {
        date: '2025-05-01', // Labour Day 2025 (Holiday)
        expected: { date: '2025-05-01', work: false, name: "Labour Day,劳动节,2" },
        desc: 'Actual holiday (Labour Day 2025)'
      },
      {
        date: '2024-09-17', // Mid-Autumn Festival 2024 (Holiday)
        expected: { date: '2024-09-17', work: false, name: "Mid-autumn Festival,中秋,1" },
        desc: 'Mid-Autumn Festival (Holiday)'
      },
      {
        date: '2024-09-14', // Saturday, but a makeup workday for Mid-Autumn Festival
        expected: { date: '2024-09-14', work: true, name: "Mid-autumn Festival,中秋,1" }, // Makeup days often refer to the primary holiday name
        desc: 'Makeup workday (Saturday) for Mid-Autumn Festival'
      },
      {
        date: '2024-07-06', // Regular Saturday (Weekend)
        expected: { date: '2024-07-06', work: false, name: "Saturday" },
        desc: 'Regular weekend (Saturday)'
      },
      {
        date: '2024-07-08', // Regular Monday
        expected: { date: '2024-07-08', work: true, name: "Monday" },
        desc: 'Regular weekday (Monday)'
      }
    ];

    test.each(testCases)('should return correct details for $date ($desc)', ({ date, expected }) => {
      const detail = getDayDetail(date);
      expect(detail).toEqual(expected);
    });
  });

  test('getHolidaysInRange should return correct holidays within a range', () => {
    const start = '2024-05-01';
    const end = '2024-05-31';
    const holidaysInRange = getHolidaysInRange(start, end, false); // Only official holidays

    // Labour Day 2024 is May 1-5. "false" means don't include *normal* weekends.
    // But if a weekend day IS an official holiday, it should be included.
    expect(holidaysInRange).toEqual([
      "2024-05-01", "2024-05-02", "2024-05-03", "2024-05-04", "2024-05-05"
    ]);
  });

  test('getHolidaysInRange should return correct holidays including weekends within a range', () => {
    const start = '2024-05-01';
    const end = '2024-05-05'; // Short range covering Labour day and a weekend
    const holidaysInRange = getHolidaysInRange(start, end, true); // Include weekends

    expect(holidaysInRange).toEqual([
      "2024-05-01", // Holiday
      "2024-05-02", // Holiday
      "2024-05-03", // Holiday
      "2024-05-04", // Saturday
      "2024-05-05", // Sunday
    ]);
  });

  // Adding more tests for getHolidaysInRange for edge cases
  describe('getHolidaysInRange - Edge Cases', () => {
    test('should handle year boundaries', () => {
      const holidays = getHolidaysInRange('2023-12-30', '2024-01-02', true);
      expect(holidays).toEqual(['2023-12-30', '2023-12-31', '2024-01-01']); // Dec 30 (Sat), Dec 31 (Sun), Jan 1 (Holiday)
    });
    test('should handle leap year February', () => {
      const holidays = getHolidaysInRange('2024-02-28', '2024-03-02', true);
      // Feb 28 (Wed, Workday), Feb 29 (Thu, Workday), Mar 1 (Fri, Workday), Mar 2 (Sat, Weekend)
      expect(holidays).toEqual(['2024-03-02']);
    });
     test('should return empty array for a range with no holidays', () => {
      const holidays = getHolidaysInRange('2024-07-08', '2024-07-09', false); // Mon, Tue (no official holidays)
      expect(holidays).toEqual([]);
    });
    test('should return only weekends if no official holidays in range and includeWeekends is true', () => {
      const holidays = getHolidaysInRange('2024-07-08', '2024-07-14', true); // Range includes a weekend
      expect(holidays).toEqual(['2024-07-13', '2024-07-14']);
    });
  });


  test('getWorkdaysInRange should return correct workdays within a range (excluding weekends unless makeup)', () => {
    const start = '2024-05-01'; // Wed (Holiday)
    const end = '2024-05-12'; // Sun (Weekend, but 5/11 is makeup workday)
    const workdaysInRange = getWorkdaysInRange(start, end, false); // Exclude normal weekends

    // Based on current code logic: includeWeekends:false means only Mon-Fri workdays.
    // So, 2024-05-11 (Saturday, makeup workday) should be excluded.
    expect(workdaysInRange).toEqual([
      // 2024-05-01 to 05-05 are Labour Day holidays
      '2024-05-06', // Mon
      '2024-05-07', // Tue
      '2024-05-08', // Wed
      '2024-05-09', // Thu
      '2024-05-10', // Fri
      // '2024-05-11', // Sat (Makeup workday) - EXCLUDED due to includeWeekends: false
    ]);
  });

  test('getWorkdaysInRange should return correct workdays including normal workdays on weekends', () => {
    const start = '2024-05-01';
    const end = '2024-05-12';
    const workdaysInRange = getWorkdaysInRange(start, end, true); // Include all workdays (normal + makeup)

     expect(workdaysInRange).toEqual([
      '2024-05-06',
      '2024-05-07',
      '2024-05-08',
      '2024-05-09',
      '2024-05-10',
      '2024-05-11', // Makeup workday
    ]);
  });
  
  // Adding more tests for getWorkdaysInRange for edge cases
  describe('getWorkdaysInRange - Edge Cases', () => {
    test('should handle year boundaries', () => {
      const workdays = getWorkdaysInRange('2023-12-30', '2024-01-03', true);
      // 2023-12-30 (Sat), 2023-12-31 (Sun), 2024-01-01 (Mon, Holiday NYD)
      // 2024-01-02 (Tue), 2024-01-03 (Wed)
      expect(workdays).toEqual(['2024-01-02', '2024-01-03']);
    });
    test('should handle leap year February', () => {
      const workdays = getWorkdaysInRange('2024-02-28', '2024-03-02', true);
      // Feb 28 (Wed), Feb 29 (Thu), Mar 1 (Fri), Mar 2 (Sat, Weekend)
      expect(workdays).toEqual(['2024-02-28', '2024-02-29', '2024-03-01']);
    });
    test('should return empty array for a range with no workdays (e.g. full holiday period)', () => {
      const workdays = getWorkdaysInRange('2024-10-01', '2024-10-07', true); // National Day holiday week
      expect(workdays).toEqual([]);
    });
  });

  test('findWorkday should return correct workday', () => {
    const date = '2024-05-01'; // Labour Day (Holiday)
    const nextWorkday = findWorkday(1, date); // Next workday from May 1st

    expect(nextWorkday).toBe('2024-05-06'); // May 6th is the first workday after Labour day holiday period
  });

  // Refactor findWorkday tests to be data-driven
  describe('findWorkday', () => {
    const testCases = [
      // Positive delta
      { delta: 1, date: '2024-05-01', expected: '2024-05-06', desc: 'Next workday after a holiday' },
      { delta: 1, date: '2024-05-06', expected: '2024-05-07', desc: 'Next workday from a workday' },
      { delta: 1, date: '2024-05-10', expected: '2024-05-11', desc: 'Next workday is a makeup Saturday workday' },
      { delta: 2, date: '2024-05-10', expected: '2024-05-13', desc: 'Second next workday, skipping weekend after makeup Saturday' },
      { delta: 1, date: '2023-12-29', expected: '2024-01-02', desc: 'Next workday across New Year holiday' }, // Fri -> Tue (Mon is NYD)
      // Negative delta
      // Corrected expectation: Previous workday for May 6 (Mon) is Apr 30 (Tue), as May 1-5 are holidays and Apr 28 (Sun) was a workday before that.
      // findWorkday(-1, '2024-05-06') result is '2024-04-30'
      { delta: -1, date: '2024-05-06', expected: '2024-04-30', desc: 'Previous workday from Mon, skipping Labour Day holiday period to Apr 30' },
      { delta: -1, date: '2024-05-13', expected: '2024-05-11', desc: 'Previous workday is a makeup Saturday' },
      { delta: -1, date: '2024-01-02', expected: '2023-12-29', desc: 'Previous workday across New Year holiday' }, // Tue -> Fri (Mon is NYD)
      // Zero delta
      { delta: 0, date: '2024-05-11', expected: '2024-05-11', desc: 'Current day is a makeup Saturday workday' },
      { delta: 0, date: '2024-05-12', expected: '2024-05-13', desc: 'Current day is Sunday (holiday), finds next workday' }, // Sunday, next is Monday
      { delta: 0, date: '2024-05-01', expected: '2024-05-06', desc: 'Current day is Labour Day (holiday), finds next workday'}, // May 1st is holiday, next workday is May 6th
      { delta: 0, date: '2024-07-08', expected: '2024-07-08', desc: 'Current day is a regular workday (Monday)'}
    ];

    test.each(testCases)('findWorkday($delta, "$date") should be $expected ($desc)', ({ delta, date, expected }) => {
      expect(findWorkday(delta, date)).toBe(expected);
    });
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
