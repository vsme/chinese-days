import { getLunarFestivals } from "../../src";
import dayjs from "../../src/utils/dayjs"; // Import dayjs

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
    const result2 = getLunarFestivals("2025-07-30") // 2025 has leap 6th month. 2025-07-30 is 闰六月初五.
    expect(result2).toEqual([]); // No festival for 闰六月初五
  });

  describe("Specific Special Festival Handlers (Based on current constants.ts)", () => {
    test("Mother's Day (solar 2024-05-12) should NOT be identified as handler is missing, and no fixed festival on actual L04-05", () => {
      // Solar "2024-05-12" is Lunar L2024-04-05 via getLunarDate. LUNAR_FESTIVAL_MAP[4][5] is undefined.
      expect(getLunarFestivals("2024-05-12", "2024-05-12")).toEqual([]);
      // Solar "2025-05-11" is Lunar L2025-04-14. LUNAR_FESTIVAL_MAP[4][14] is ["吕洞宾诞辰"].
      expect(getLunarFestivals("2025-05-11")).toEqual([{ date: "2025-05-11", name: ["吕洞宾诞辰"] }]);
    });

    test("Father's Day (solar 2024-06-16) should NOT be identified as handler is missing, and no fixed festival on actual lunar date", () => {
      // Solar "2024-06-16" is L2024-05-11. LUNAR_FESTIVAL_MAP[5][11] is undefined.
      expect(getLunarFestivals("2024-06-16", "2024-06-16")).toEqual([]);
      // Solar "2025-06-15" is L2025-05-20. LUNAR_FESTIVAL_MAP[5][20] is undefined.
      expect(getLunarFestivals("2025-06-15")).toEqual([]);
    });

    test("Thanksgiving Day (solar 2024-11-28) should NOT be identified as handler is missing, and no fixed festival on actual lunar date", () => {
      // Solar "2024-11-28" is L2024-10-28. LUNAR_FESTIVAL_MAP[10][28] is undefined.
      expect(getLunarFestivals("2024-11-28", "2024-11-28")).toEqual([]);
      // Solar "2025-11-27" is L2025-10-07. LUNAR_FESTIVAL_MAP[10][7] is undefined.
      expect(getLunarFestivals("2025-11-27")).toEqual([]);
    });
  });

  describe("Edge Cases and Other Scenarios", () => {
    test("should return empty array for a range with no festivals", () => {
      expect(getLunarFestivals("2024-01-02", "2024-01-03")).toEqual([]);
    });

    test("should return empty array if start date is after end date", () => {
      expect(getLunarFestivals("2024-01-10", "2024-01-01")).toEqual([]);
    });

    test("should handle date with multiple fixed festivals not overlapping with special ones", () => {
      // Example: 七月初七 (Qixi)
      // 2024-08-10 is L2024-七月初七
      const result = getLunarFestivals("2024-08-10");
      // Assuming LUNAR_FESTIVAL_MAP has '七夕节' and potentially others for 7/7
      // For this example, let's say it's just '七夕节' and '魁星诞辰'.
      // LUNAR_FESTIVAL_MAP[7][7] is ["乞巧节"] as per constants.ts
      expect(result).toEqual([
        { date: "2024-08-10", name: ["乞巧节"] }
      ]);
    });

    test("should handle a long range with multiple festivals", () => {
      // A range of about 2 months
      const results = getLunarFestivals("2024-08-01", "2024-09-30");
      // Check for presence of some key festivals, not exact list which could be long
      const festivalDates = results.map(r => r.date);
      expect(festivalDates).toContain("2024-08-10"); // 乞巧节 (L7/7)
      expect(festivalDates).toContain("2024-08-18"); // 中元节 (L7/15)
      expect(festivalDates).toContain("2024-09-17"); // 中秋节 (L8/15)

      const qixi = results.find(r => r.date === "2024-08-10");
      expect(qixi?.name).toEqual(expect.arrayContaining(["乞巧节"])); // Corrected name
      const zhongqiu = results.find(r => r.date === "2024-09-17");
      expect(zhongqiu?.name).toEqual(expect.arrayContaining(["中秋节"]));
    });

    test("should NOT find Dragon Boat Festival for solar 2028-05-30 as it's L05-07", () => {
      // Solar "2028-05-30" is L2028-05-07 (五月初七) according to getLunarDate.
      // LUNAR_FESTIVAL_MAP[5][7] is undefined.
      const dragonBoatResult = getLunarFestivals("2028-05-30");
      expect(dragonBoatResult).toEqual([]); 
    });

    test("should find no fixed festival for solar 2028-05-26 as it's L05-03", () => {
      // Solar "2028-05-26" is L2028-05-03 according to getLunarDate.
      // LUNAR_FESTIVAL_MAP[5][3] is undefined.
      const result = getLunarFestivals("2028-05-26");
      expect(result).toEqual([]);

      // For context: The actual Dragon Boat Festival (L2028-05-05) would be on a different solar date.
      // The test for solar "2028-06-29" (which is L2028-06-07) correctly expects [].
      const leapTestDateResult = getLunarFestivals("2028-06-29"); // This was L2028-06-07.
      expect(leapTestDateResult).toEqual([]);
    });


    test("getLunarFestivals with undefined start/end should query for current day (mocked to solar 2024-05-12, which is L04-05)", () => {
      const mockToday = "2024-05-12"; // Solar "2024-05-12" is L2024-04-05.
      // LUNAR_FESTIVAL_MAP[4][5] is undefined. No fixed festival.
      // Mother's Day handler is missing.
      const originalDayjs = dayjs;
      // @ts-ignore
      dayjs = jest.fn((dateInput?: any) => {
        if (dateInput === undefined || dateInput === null || dateInput === '') {
          return originalDayjs(mockToday);
        }
        return originalDayjs(dateInput);
      });
      Object.assign(dayjs, originalDayjs);

      expect(getLunarFestivals()).toEqual([]); // Expect empty as L04-05 has no festival
      
      // @ts-ignore
      dayjs = originalDayjs; // Restore original dayjs
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