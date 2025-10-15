import Arrangement, { Holiday } from '../../src/holidays/arrangement';
import dayjs from '../../src/utils/dayjs';
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
    // _validateDate 函数会对无效的日期输入抛出错误。
    // 注意：即使这些测试通过捕获抛出的错误来验证其执行，
    //覆盖率工具仍可能错误地报告 _validateDate 中的确切 'throw' 语句行未被覆盖。
    // 错误信息现在使用 `typeof dateInput` (原始传入类型)。
    expect(() => isHoliday('invalid-date')).toThrow(
      'unsupported type string, expected type is Date or Dayjs' // typeof 'invalid-date' 为 'string'
    );
    // 测试其他使用 _validateDate 的函数处理各种无效输入的情况
    expect(() => isWorkday('invalid-date-for-isWorkday')).toThrow(
      'unsupported type string, expected type is Date or Dayjs' // typeof 'invalid-date-for-isWorkday' 为 'string'
    );
    expect(() => getDayDetail('yet-another-invalid-date')).toThrow(
      // 使用一个已知的无效字符串
      'unsupported type string, expected type is Date or Dayjs' // typeof 'yet-another-invalid-date' 为 'string'
    );
    // 对于像 12345 这样的数字输入，dayjs(12345) 是一个有效的日期 (Unix毫秒时间戳)。
    // 因此，_validateDate 不会抛出错误。isInLieu(12345) 会基于该日期进行计算。
    // 假设 1970-01-01T00:00:12.345Z 不是一个调休日。
    expect(isInLieu(12345)).toBe(false); // 此前的判断是正确的。

    // 通过调用 _validateDate 获取开始和结束日期的范围函数，间接测试 _validateDate
    // 使用一个已知的无效字符串作为一端，一个有效日期作为另一端，以确保正确处理
    expect(() => getHolidaysInRange('invalid-start', '2024-01-01')).toThrow(
      'unsupported type string, expected type is Date or Dayjs'
    );
    expect(() => getWorkdaysInRange('2024-01-01', 'invalid-end')).toThrow(
      'unsupported type string, expected type is Date or Dayjs'
    );
    // 通过提供一个导致 date.isValid() 返回 false 的无效字符串输入，
    // 特别针对 _validateDate 中的 throw 语句行。
    // 错误信息将使用 `typeof dateInput` (此处为 'string')。
    const testThrowLineDirectlyViaGetDayDetail = () => {
      getDayDetail('final-check-invalid-date');
    };
    expect(testThrowLineDirectlyViaGetDayDetail).toThrow(
      'unsupported type string, expected type is Date or Dayjs'
    );

    // 使用一个实际的无效 Date 对象进行测试。
    // dayjs(new Date('foo')) 会产生一个 isValid() 为 false 的 Dayjs 对象。
    // typeof dateInput (Date 对象本身) 是 'object'。
    expect(() => isHoliday(new Date('foo'))).toThrow(
      'unsupported type object, expected type is Date or Dayjs'
    );
  });

  describe.each([
    {
      fn: isHoliday,
      fnName: 'isHoliday',
      cases: [
        { date: '2024-05-01', expected: true, desc: '劳动节' },
        { date: '2024-05-06', expected: false, desc: '普通星期一' },
        { date: '2024-01-01', expected: true, desc: '2024年元旦' },
        {
          date: '2023-12-31',
          expected: true,
          desc: '2023年元旦前夕的周日 (周末)',
        },
        { date: '2024-02-29', expected: false, desc: '2024年闰日 (星期四)' },
        { date: '2023-02-28', expected: false, desc: '非闰年2月28日 (星期二)' },
        { date: '2024-10-05', expected: true, desc: '国庆节假日期间 (星期六)' }, // 节假日期间的周末
        { date: '2024-10-07', expected: true, desc: '国庆节假日期间 (星期一)' }, // 节假日期间的工作日
        { date: '2024-04-04', expected: true, desc: '2024年清明节 (星期四)' },
        { date: '2024-04-06', expected: true, desc: '清明节调休 (星期六)' },
        {
          date: '2024-04-07',
          expected: false,
          desc: '清明节调休上班 (星期日)',
        }, // 这是工作日
      ],
    },
    {
      fn: isWorkday,
      fnName: 'isWorkday',
      cases: [
        { date: '2024-05-01', expected: false, desc: '劳动节' },
        { date: '2024-05-06', expected: true, desc: '普通星期一' },
        { date: '2024-01-01', expected: false, desc: '2024年元旦' },
        {
          date: '2023-12-31',
          expected: false,
          desc: '2023年元旦前夕的周日 (周末)',
        },
        { date: '2024-02-29', expected: true, desc: '2024年闰日 (星期四)' },
        { date: '2023-02-28', expected: true, desc: '非闰年2月28日 (星期二)' },
        {
          date: '2024-10-05',
          expected: false,
          desc: '国庆节假日期间 (星期六)',
        },
        {
          date: '2024-10-07',
          expected: false,
          desc: '国庆节假日期间 (星期一)',
        },
        { date: '2024-04-07', expected: true, desc: '清明节调休上班 (星期日)' }, // 这是工作日
        { date: '2024-05-11', expected: true, desc: '劳动节调休上班 (星期六)' }, // 这是工作日
      ],
    },
    {
      fn: isInLieu,
      fnName: 'isInLieu',
      cases: [
        {
          date: '2024-05-01',
          expected: false,
          desc: '劳动节 (节日本身，非调休)',
        }, // 劳动节本身不是“调休”产生的假日，但它所属的假期包含调休日
        { date: '2024-05-03', expected: true, desc: '劳动节假期 (调休)' },
        { date: '2024-05-06', expected: false, desc: '普通星期一 (非调休)' },
        { date: '2024-02-15', expected: true, desc: '春节 (调休)' }, // 2月15日是调休
        { date: '2024-02-16', expected: true, desc: '春节 (调休)' }, // 2月16日是调休
        {
          date: '2024-02-17',
          expected: false,
          desc: '春节假期 (星期六)，但非特指调休性质的假日',
        }, // 2月17日是春节假期，但不是“inLieu”定义的调休产生的假日
        {
          date: '2024-02-18',
          expected: false,
          desc: '春节调休上班 (星期日), 非调休性质的假日',
        },
      ],
    },
  ])('$fnName', ({ fn, cases }) => {
    test.each(cases)(
      '$fnName("$date") 应该为 $expected ($desc)',
      ({ date, expected }) => {
        expect(fn(date)).toBe(expected);
      }
    );
  });

  test('getDayDetail should return correct details', () => {
    const date = '2024-04-29'; // 普通星期一
    const detail = getDayDetail(date);

    expect(detail).toEqual({
      date: '2024-04-29',
      work: true,
      name: 'Monday',
    });
  });

  describe('getDayDetail', () => {
    const testCases = [
      {
        date: '2025-01-26', // 周日，但是春节的调休工作日
        expected: {
          date: '2025-01-26',
          work: true,
          name: 'Spring Festival,春节,4',
        },
        desc: '春节的调休工作日 (周日)',
      },
      {
        date: '2024-05-01', // 劳动节 (节假日)
        expected: {
          date: '2024-05-01',
          work: false,
          name: 'Labour Day,劳动节,1',
        },
        desc: '实际节假日 (劳动节)',
      },
      {
        date: '2025-05-01', // 2025年劳动节 (节假日)
        expected: {
          date: '2025-05-01',
          work: false,
          name: 'Labour Day,劳动节,2',
        },
        desc: '实际节假日 (2025年劳动节)',
      },
      {
        date: '2024-09-17', // 2024年中秋节 (节假日)
        expected: {
          date: '2024-09-17',
          work: false,
          name: 'Mid-autumn Festival,中秋,1',
        },
        desc: '中秋节 (节假日)',
      },
      {
        date: '2024-09-14', // 周六，但是中秋节的调休工作日
        expected: {
          date: '2024-09-14',
          work: true,
          name: 'Mid-autumn Festival,中秋,1',
        }, // 调休工作日通常关联主要节假日名称
        desc: '中秋节的调休工作日 (周六)',
      },
      {
        date: '2024-07-06', // 普通周六 (周末)
        expected: { date: '2024-07-06', work: false, name: 'Saturday' },
        desc: '普通周末 (周六)',
      },
      {
        date: '2024-07-08', // 普通星期一
        expected: { date: '2024-07-08', work: true, name: 'Monday' },
        desc: '普通工作日 (星期一)',
      },
    ];

    test.each(testCases)(
      '对于日期 $date ($desc)，应返回正确的详情',
      ({ date, expected }) => {
        const detail = getDayDetail(date);
        expect(detail).toEqual(expected);
      }
    );
  });

  test('getHolidaysInRange should return correct holidays within a range', () => {
    const start = '2024-05-01';
    const end = '2024-05-31';
    const holidaysInRange = getHolidaysInRange(start, end, false); // 仅官方节假日

    // 2024年劳动节是5月1-5日。"false"表示不包含*常规*周末。
    // 但如果周末某天是官方假期的一部分，则应包含在内。
    expect(holidaysInRange).toEqual([
      '2024-05-01',
      '2024-05-02',
      '2024-05-03',
      '2024-05-04',
      '2024-05-05',
    ]);
  });

  test('getHolidaysInRange should return correct holidays including weekends within a range', () => {
    const start = '2024-05-01';
    const end = '2024-05-05'; // 包含劳动节和周末的短范围
    const holidaysInRange = getHolidaysInRange(start, end, true); // 包含周末

    expect(holidaysInRange).toEqual([
      '2024-05-01', // 节假日
      '2024-05-02', // 节假日
      '2024-05-03', // 节假日
      '2024-05-04', // 周六
      '2024-05-05', // 周日
    ]);
  });

  // getHolidaysInRange 边缘情况的更多测试
  describe('getHolidaysInRange - Edge Cases', () => {
    test('should handle year boundaries', () => {
      const holidays = getHolidaysInRange('2023-12-30', '2024-01-02', true);
      expect(holidays).toEqual(['2023-12-30', '2023-12-31', '2024-01-01']); // 12月30日(周六), 12月31日(周日), 1月1日(节假日)
    });
    test('should handle leap year February', () => {
      const holidays = getHolidaysInRange('2024-02-28', '2024-03-02', true);
      // 2月28日(周三, 工作日), 2月29日(周四, 工作日), 3月1日(周五, 工作日), 3月2日(周六, 周末)
      expect(holidays).toEqual(['2024-03-02']);
    });
    test('should return empty array for a range with no holidays', () => {
      const holidays = getHolidaysInRange('2024-07-08', '2024-07-09', false); // 周一, 周二 (没有官方节假日)
      expect(holidays).toEqual([]);
    });
    test('should return only weekends if no official holidays in range and includeWeekends is true', () => {
      const holidays = getHolidaysInRange('2024-07-08', '2024-07-14', true); // 范围包含一个周末
      expect(holidays).toEqual(['2024-07-13', '2024-07-14']);
    });
  });

  test('getWorkdaysInRange should return correct workdays within a range (excluding weekends unless makeup)', () => {
    const start = '2024-05-01'; // 周三 (节假日)
    const end = '2024-05-12'; // 周日 (周末, 但5月11日是调休工作日)
    const workdaysInRange = getWorkdaysInRange(start, end, false); // 排除正常周末

    // 根据当前代码逻辑: includeWeekends:false 表示仅返回周一至周五的工作日。
    // 因此, 2024-05-11 (周六, 调休工作日) 应被排除。
    expect(workdaysInRange).toEqual([
      // 2024-05-01 至 05-05 是劳动节假期
      '2024-05-06', // 周一
      '2024-05-07', // 周二
      '2024-05-08', // 周三
      '2024-05-09', // 周四
      '2024-05-10', // 周五
      // '2024-05-11', // 周六 (调休工作日) - 因 includeWeekends: false 而排除
    ]);
  });

  test('getWorkdaysInRange should return correct workdays including normal workdays on weekends', () => {
    const start = '2024-05-01';
    const end = '2024-05-12';
    const workdaysInRange = getWorkdaysInRange(start, end, true); // 包括所有工作日 (正常 + 调休)

    expect(workdaysInRange).toEqual([
      '2024-05-06',
      '2024-05-07',
      '2024-05-08',
      '2024-05-09',
      '2024-05-10',
      '2024-05-11', // 调休工作日
    ]);
  });

  // getWorkdaysInRange 边缘情况的更多测试
  describe('getWorkdaysInRange - Edge Cases', () => {
    test('should handle year boundaries', () => {
      const workdays = getWorkdaysInRange('2023-12-30', '2024-01-03', true);
      // 2023-12-30 (周六), 2023-12-31 (周日), 2024-01-01 (周一, 元旦节假日)
      // 2024-01-02 (周二), 2024-01-03 (周三)
      expect(workdays).toEqual(['2024-01-02', '2024-01-03']);
    });
    test('should handle leap year February', () => {
      const workdays = getWorkdaysInRange('2024-02-28', '2024-03-02', true);
      // 2月28日(周三), 2月29日(周四), 3月1日(周五), 3月2日(周六, 周末)
      expect(workdays).toEqual(['2024-02-28', '2024-02-29', '2024-03-01']);
    });
    test('should return empty array for a range with no workdays (e.g. full holiday period)', () => {
      const workdays = getWorkdaysInRange('2024-10-01', '2024-10-07', true); // 国庆节假期周
      expect(workdays).toEqual([]);
    });
  });

  test('findWorkday should return correct workday', () => {
    const date = '2024-05-01'; // 劳动节 (节假日)
    const nextWorkday = findWorkday(1, date); // 从5月1日开始的下一个工作日

    expect(nextWorkday).toBe('2024-05-06'); // 5月6日是劳动节假期后的第一个工作日
  });

  describe('findWorkday', () => {
    const testCases = [
      // 正向 delta
      {
        delta: 1,
        date: '2024-05-01',
        expected: '2024-05-06',
        desc: '节假日后的下一个工作日',
      },
      {
        delta: 1,
        date: '2024-05-06',
        expected: '2024-05-07',
        desc: '工作日的下一个工作日',
      },
      {
        delta: 1,
        date: '2024-05-10',
        expected: '2024-05-11',
        desc: '下一个工作日是调休的周六工作日',
      },
      {
        delta: 2,
        date: '2024-05-10',
        expected: '2024-05-13',
        desc: '隔一个工作日，跳过调休周六后的周末',
      },
      {
        delta: 1,
        date: '2023-12-29',
        expected: '2024-01-02',
        desc: '跨元旦假期的下一个工作日',
      }, // 周五 -> 周二 (周一元旦)
      // 负向 delta
      // 已修正预期：5月6日(周一)的前一个工作日是4月30日(周二)，因为5月1-5日是劳动节假期，4月28日(周日)是之前的调休工作日。
      // findWorkday(-1, '2024-05-06') 结果是 '2024-04-30'
      {
        delta: -1,
        date: '2024-05-06',
        expected: '2024-04-30',
        desc: '从周一开始，跳过劳动节假期到4月30日的前一个工作日',
      },
      {
        delta: -1,
        date: '2024-05-13',
        expected: '2024-05-11',
        desc: '前一个工作日是调休的周六',
      },
      {
        delta: -1,
        date: '2024-01-02',
        expected: '2023-12-29',
        desc: '跨元旦假期的前一个工作日',
      }, // 周二 -> 周五 (周一元旦)
      // delta 为 0
      {
        delta: 0,
        date: '2024-05-11',
        expected: '2024-05-11',
        desc: '当天是调休的周六工作日',
      },
      {
        delta: 0,
        date: '2024-05-12',
        expected: '2024-05-13',
        desc: '当天是周日(节假日)，查找下一个工作日',
      }, // 周日，下一个是周一
      {
        delta: 0,
        date: '2024-05-01',
        expected: '2024-05-06',
        desc: '当天是劳动节(节假日)，查找下一个工作日',
      }, // 5月1日是节假日，下一个工作日是5月6日
      {
        delta: 0,
        date: '2024-07-08',
        expected: '2024-07-08',
        desc: '当天是普通工作日(星期一)',
      },
      // 针对 line 86 (while循环内的 if (isWorkday(date))) 的特定新测试
      {
        delta: 1,
        date: '2024-05-04', // 周六 (节假日)
        expected: '2024-05-06', // 下一个工作日是周一
        desc: 'Line 86: 循环遇到节假日(周日)，然后是工作日(周一)',
        // 迭代1: date 变为 2024-05-05 (周日, 节假日)。isWorkday(date) 为 FALSE。daysToAdd = 1。
        // 迭代2: date 变为 2024-05-06 (周一, 工作日)。isWorkday(date) 为 TRUE。daysToAdd = 0。循环结束。
      },
      {
        delta: 2,
        date: '2024-05-04', // 周六 (节假日)
        expected: '2024-05-07', // 第二个工作日
        desc: 'Line 86: 循环遇到节假日, 工作日, 工作日',
        // 迭代1: date 变为 2024-05-05 (周日, 节假日)。isWorkday(date) 为 FALSE。daysToAdd = 2。
        // 迭代2: date 变为 2024-05-06 (周一, 工作日)。isWorkday(date) 为 TRUE。daysToAdd = 1。
        // 迭代3: date 变为 2024-05-07 (周二, 工作日)。isWorkday(date) 为 TRUE。daysToAdd = 0。循环结束。
      },
    ];

    test.each(testCases)(
      'findWorkday($delta, "$date") 应该为 $expected ($desc)',
      ({ delta, date, expected }) => {
        expect(findWorkday(delta, date)).toBe(expected);
      }
    );

    describe('findWorkday with default date (today)', () => {
      let originalDayjs: typeof dayjs;

      beforeEach(() => {
        originalDayjs = dayjs; // 保存原始的 dayjs
      });

      afterEach(() => {
        // @ts-ignore
        dayjs = originalDayjs; // 恢复原始的 dayjs
      });

      test('should return today if today is a workday and delta is 0', () => {
        const mockTodayWorkday = '2024-05-06'; // 周一, 已知的工作日
        // @ts-ignore
        dayjs = jest.fn((dateInput?: any) => {
          if (
            dateInput === undefined ||
            dateInput === null ||
            dateInput === ''
          ) {
            return originalDayjs(mockTodayWorkday);
          }
          return originalDayjs(dateInput);
        });
        Object.assign(dayjs, originalDayjs);
        expect(findWorkday()).toBe(mockTodayWorkday);
      });

      test('should return next workday if today is a holiday and delta is 0', () => {
        const mockTodayHoliday = '2024-05-05'; // 周日, 已知的节假日
        // @ts-ignore
        dayjs = jest.fn((dateInput?: any) => {
          if (
            dateInput === undefined ||
            dateInput === null ||
            dateInput === ''
          ) {
            return originalDayjs(mockTodayHoliday);
          }
          return originalDayjs(dateInput);
        });
        Object.assign(dayjs, originalDayjs);
        expect(findWorkday(0)).toBe('2024-05-06'); // 下一个工作日
      });

      test('should return next workday if today is a workday and delta is 1', () => {
        const mockTodayWorkday = '2024-05-06'; // 周一, 已知的工作日
        // @ts-ignore
        dayjs = jest.fn((dateInput?: any) => {
          if (
            dateInput === undefined ||
            dateInput === null ||
            dateInput === ''
          ) {
            return originalDayjs(mockTodayWorkday);
          }
          return originalDayjs(dateInput);
        });
        Object.assign(dayjs, originalDayjs);
        expect(findWorkday(1)).toBe('2024-05-07');
      });
    });
  });
});

describe('Arrangement Class', () => {
  let arrangement: Arrangement;

  beforeEach(() => {
    arrangement = new Arrangement();
  });

  test('should correctly handle 2023 holidays', () => {
    arrangement
      .y(2024)
      .ny()
      .r(1, 1)
      .s()
      .r(2, 10)
      .to(2, 17)
      .w(2, 4)
      .w(2, 18)
      .i(2, 15)
      .to(2, 16)
      .t()
      .r(4, 4)
      .to(4, 6)
      .w(4, 7)
      .i(4, 5)
      .l()
      .r(5, 1)
      .to(5, 5)
      .w(4, 28)
      .w(5, 11)
      .i(5, 2)
      .to(5, 3)
      .d()
      .r(6, 10)
      .m()
      .r(9, 15)
      .to(9, 17)
      .w(9, 14)
      .i(9, 16)
      .n()
      .r(10, 1)
      .to(10, 7)
      .w(9, 29)
      .w(10, 12)
      .i(10, 4)
      .i(10, 7);

    expect(arrangement.holidays).toHaveProperty('2024-05-01');
    expect(arrangement.holidays).toHaveProperty('2024-05-02');
    expect(arrangement.holidays).toHaveProperty('2024-05-04');
    expect(arrangement.holidays).toHaveProperty('2024-05-05');
    expect(arrangement.workdays).toHaveProperty('2024-04-28');
    expect(arrangement.workdays).toHaveProperty('2024-05-11');
  });
});
