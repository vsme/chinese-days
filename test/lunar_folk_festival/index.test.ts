import { getLunarFestivals } from "../../src";

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
    const result2 = getLunarFestivals("2025-07-30")
    expect(result2).toEqual([]);
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