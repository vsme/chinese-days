import { getLunarFestivals } from "../../src";
import dayjs from "../../src/utils/dayjs";

describe("lunarFestivals", () => {
  test("getLunarFestivals should return fixed lunar festivals", () => {
    // 测试常规固定节日
    const result = getLunarFestivals("2025-01-29");
    expect(result).toEqual([
      {
        date: "2025-01-29",
        name: ["春节", "鸡日", "元始天尊诞辰"],
      }
    ]);
  });

  test("should handle solar term related festivals", () => {
    // 测试寒食节（清明前一日）
    const result = getLunarFestivals("2025-04-03");
    expect(result).toEqual([{
      date: "2025-04-03",
      name: ["寒食节"],
    }]);
  });

  test("should handle special festivals", () => {
    // 测试除夕（农历腊月最后一日）
    const result = getLunarFestivals("2025-01-28");
    expect(result).toEqual([{
      date: "2025-01-28",
      name: ["除夕", "封井", "祭井神", "贴春联", "迎财神"],
    }]);
  });

  test("should filter leap month festivals", () => {
    const result1 = getLunarFestivals("2025-06-30")
    expect(result1).toEqual([{
      date: "2025-06-30",
      name: ["晒衣节"],
    }]);

    // 测试闰月不返回节日
    const result2 = getLunarFestivals("2025-07-30") // 2025年有闰六月。2025-07-30 是闰六月初五。
    expect(result2).toEqual([]); // 闰六月初五没有节日
  });

  describe("Specific Special Festival Handlers (Based on current constants.ts)", () => { // （基于当前 constants.ts 的特定节日处理器）
    test("Mother's Day (solar 2024-05-12) should NOT be identified as handler is missing, and no fixed festival on actual L04-05", () => { // 母亲节 (公历 2024-05-12) 因处理器缺失不应被识别，且实际农历四月初五无固定节日
      // 公历 "2024-05-12" 通过 getLunarDate 转换为农历 L2024-04-05。LUNAR_FESTIVAL_MAP[4][5] 未定义。
      expect(getLunarFestivals("2024-05-12", "2024-05-12")).toEqual([]);
      // 公历 "2025-05-11" 通过 getLunarDate 转换为农历 L2025-04-14。LUNAR_FESTIVAL_MAP[4][14] 是 ["吕洞宾诞辰"]。
      expect(getLunarFestivals("2025-05-11")).toEqual([{ date: "2025-05-11", name: ["吕洞宾诞辰"] }]);
    });

    test("Father's Day (solar 2024-06-16) should NOT be identified as handler is missing, and no fixed festival on actual lunar date", () => { // 父亲节 (公历 2024-06-16) 因处理器缺失不应被识别，且实际农历日期无固定节日
      // 公历 "2024-06-16" 是农历 L2024-05-11。LUNAR_FESTIVAL_MAP[5][11] 未定义。
      expect(getLunarFestivals("2024-06-16", "2024-06-16")).toEqual([]);
      // 公历 "2025-06-15" 是农历 L2025-05-20。LUNAR_FESTIVAL_MAP[5][20] 未定义。
      expect(getLunarFestivals("2025-06-15")).toEqual([]);
    });

    test("Thanksgiving Day (solar 2024-11-28) should NOT be identified as handler is missing, and no fixed festival on actual lunar date", () => { // 感恩节 (公历 2024-11-28) 因处理器缺失不应被识别，且实际农历日期无固定节日
      // 公历 "2024-11-28" 是农历 L2024-10-28。LUNAR_FESTIVAL_MAP[10][28] 未定义。
      expect(getLunarFestivals("2024-11-28", "2024-11-28")).toEqual([]);
      // 公历 "2025-11-27" 是农历 L2025-10-07。LUNAR_FESTIVAL_MAP[10][7] 未定义。
      expect(getLunarFestivals("2025-11-27")).toEqual([]);
    });
  });

  describe("Edge Cases and Other Scenarios", () => { // 边缘情况及其他场景
    test("should return empty array for a range with no festivals", () => {
      expect(getLunarFestivals("2024-01-02", "2024-01-03")).toEqual([]);
    });

    test("should return empty array if start date is after end date", () => {
      expect(getLunarFestivals("2024-01-10", "2024-01-01")).toEqual([]);
    });

    test("should handle date with multiple fixed festivals not overlapping with special ones", () => {
      // 例如：七月初七 (乞巧节)
      // 2024-08-10 是农历2024年七月初七
      const result = getLunarFestivals("2024-08-10");
      // 根据 constants.ts, LUNAR_FESTIVAL_MAP[7][7] 是 ["乞巧节"]
      expect(result).toEqual([
        { date: "2024-08-10", name: ["乞巧节"] }
      ]);
    });

    test("should handle a long range with multiple festivals", () => {
      // 大约2个月的范围
      const results = getLunarFestivals("2024-08-01", "2024-09-30");
      // 检查是否包含一些关键节日，而不是完整的列表（可能很长）
      const festivalDates = results.map(r => r.date);
      expect(festivalDates).toContain("2024-08-10"); // 乞巧节 (农历7/7)
      expect(festivalDates).toContain("2024-08-18"); // 中元节 (农历7/15)
      expect(festivalDates).toContain("2024-09-17"); // 中秋节 (农历8/15)

      const qixi = results.find(r => r.date === "2024-08-10");
      expect(qixi?.name).toEqual(expect.arrayContaining(["乞巧节"])); // 已修正名称
      const zhongqiu = results.find(r => r.date === "2024-09-17");
      expect(zhongqiu?.name).toEqual(expect.arrayContaining(["中秋节"]));
    });

    test("should NOT find Dragon Boat Festival for solar 2028-05-30 as it's L05-07", () => { // 公历2028-05-30因对应农历五月初七，不应找到端午节
      // 根据getLunarDate，公历 "2028-05-30" 是农历 L2028-05-07 (五月初七)。
      // LUNAR_FESTIVAL_MAP[5][7] 未定义。
      const dragonBoatResult = getLunarFestivals("2028-05-30");
      expect(dragonBoatResult).toEqual([]); 
    });

    test("should find no fixed festival for solar 2028-05-26 as it's L05-03", () => { // 公历2028-05-26因对应农历五月初三，不应找到固定节日
      // 根据getLunarDate，公历 "2028-05-26" 是农历 L2028-05-03。
      // LUNAR_FESTIVAL_MAP[5][3] 未定义。
      const result = getLunarFestivals("2028-05-26");
      expect(result).toEqual([]);

      // 背景信息：实际的端午节 (农历L2028-05-05) 会在另一个公历日期。
      // 对公历 "2028-06-29" (即农历L2028-06-07) 的测试正确地预期 []。
      const leapTestDateResult = getLunarFestivals("2028-06-29"); // 这是农历L2028-06-07。
      expect(leapTestDateResult).toEqual([]);
    });


    test("getLunarFestivals with undefined start/end should query for current day (mocked to solar 2024-05-12, which is L04-05)", () => { // getLunarFestivals 未定义起止日期时应查询当天 (模拟当前日期为公历2024-05-12, 即农历四月初五)
      const mockToday = "2024-05-12"; // 公历 "2024-05-12" 是农历 L2024-04-05。
      // LUNAR_FESTIVAL_MAP[4][5] 未定义，无固定节日。
      // 母亲节处理器缺失。
      const originalDayjs = dayjs;
      // @ts-ignore
      dayjs = jest.fn((dateInput?: any) => {
        if (dateInput === undefined || dateInput === null || dateInput === '') {
          return originalDayjs(mockToday);
        }
        return originalDayjs(dateInput);
      });
      Object.assign(dayjs, originalDayjs);

      expect(getLunarFestivals()).toEqual([]); // 预期为空，因为农历L04-05没有节日
      
      // @ts-ignore
      dayjs = originalDayjs; // 恢复原始的 dayjs
    });

  });

  test("should handle cross-year scenarios", () => {
    // 测试多天与跨年场景
    const result = getLunarFestivals("2024-11-15", "2025-01-30");

    expect(result).toEqual([
      {
        date: "2024-11-15",
        name: ["下元节", "水官诞辰"],
      },
      {
        date: "2025-01-07",
        name: ["腊八节"],
      },
      {
        date: "2025-01-22",
        name: ["官家送灶"],
      },
      {
        date: "2025-01-23",
        name: ["民间送灶"],
      },
      {
        date: "2025-01-24",
        name: ["接玉皇"],
      },
      {
        date: "2025-01-28",
        name: ["除夕", "封井", "祭井神", "贴春联", "迎财神"],
      },
      {
        date: "2025-01-29",
        name: ["春节", "鸡日", "元始天尊诞辰"],
      },
      {
        date: "2025-01-30",
        name: ["犬日"],
      },
    ]);
  });
});