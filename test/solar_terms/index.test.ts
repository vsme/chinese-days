import dayjs from "../../src/utils/dayjs";
import { getSolarTermDate, getSolarTerms, getSolarTermsInRange, type SolarTerm } from "../../src";
import { SOLAR_TERMS_MONTH, SOLAR_TERMS, type SolarTermKey } from "../../src/solar_terms/constants";

describe("Solar Terms", () => {
  describe("getSolarTermDate", () => {
    const testCases = [
      { year: 1998, month: 1, term: "lesser_cold" as SolarTermKey, expected: "1998-01-05", century: 20, desc: "小寒 1998 (20世纪)" },
      { year: 2024, month: 1, term: "lesser_cold" as SolarTermKey, expected: "2024-01-06", century: 21, desc: "小寒 2024 (21世纪)" },
      { year: 2026, month: 2, term: "rain_water" as SolarTermKey, expected: "2026-02-18", century: 21, desc: "雨水 2026 (有delta调整)" }, // SOLAR_TERMS_DELTA 中包含 2026_rain_water: -1
      { year: 2024, month: 2, term: "the_beginning_of_spring" as SolarTermKey, expected: "2024-02-04", century: 21, desc: "立春 2024 (无delta调整)" },
      { year: 1900, month: 1, term: "greater_cold" as SolarTermKey, expected: "1900-01-21", century: 20, desc: "大寒 1900 (1月节气使用(Y-1)/4逻辑)" },
      { year: 2000, month: 12, term: "the_winter_solstice" as SolarTermKey, expected: "2000-12-21", century: 20, desc: "冬至 2000 (20世纪)" },
      { year: 2001, month: 3, term: "the_spring_equinox" as SolarTermKey, expected: "2001-03-20", century: 21, desc: "春分 2001 (21世纪)" },
      // 测试 (Y-1)/4 与 Y/4 对L值计算产生差异的情况
      { year: 2001, month: 1, term: "lesser_cold" as SolarTermKey, expected: "2001-01-05", desc: "小寒 2001, Y=1, (Y-1)/4 = 0" }, // Y=1 时, (Y-1)/4=0, Y/4=0。此处 L 值无差异。
      { year: 2004, month: 1, term: "lesser_cold" as SolarTermKey, expected: "2004-01-06", desc: "小寒 2004, Y=4, (Y-1)/4 = 0" }, // Y=4 时, (Y-1)/4=0, Y/4=1。L 值应为 0。
      { year: 2005, month: 1, term: "lesser_cold" as SolarTermKey, expected: "2005-01-05", desc: "小寒 2005, Y=5, (Y-1)/4 = 1" }, // Y=5 时, (Y-1)/4=1, Y/4=1。L 值应为 1。
    ];

    test.each(testCases)("应计算 $year-$month 的 $term ($desc) 为 $expected", ({ year, month, term, expected }) => {
      expect(getSolarTermDate(year, month, term)).toBe(expected);
    });
  });

  describe("getSolarTerms", () => {
    const baseExpected2024JanFeb: SolarTerm[] = [
      { date: "2024-01-06", term: "lesser_cold", name: "小寒", index: 1 },
      { date: "2024-01-20", term: "greater_cold", name: "大寒", index: 1 },
      { date: "2024-02-04", term: "the_beginning_of_spring", name: "立春", index: 1 },
      { date: "2024-02-19", term: "rain_water", name: "雨水", index: 1 },
    ];

    const testCases = [
      { start: "2024-01-01", end: "2024-02-29", expected: baseExpected2024JanFeb, desc: "Range covering Jan-Feb 2024" },
      {
        start: "2024-03-01", end: "2024-03-31", expected: [
          { date: "2024-03-05", name: "惊蛰", term: "the_waking_of_insects", index: 1 },
          { date: "2024-03-20", name: "春分", term: "the_spring_equinox", index: 1 },
        ], desc: "Range covering Mar 2024"
      },
      { start: "2024-01-06", end: "2024-01-06", expected: [{ date: "2024-01-06", term: "lesser_cold", name: "小寒", index: 1 }], desc: "Single day range on a solar term" },
      { start: "2024-01-06", end: undefined, expected: [{ date: "2024-01-06", term: "lesser_cold", name: "小寒", index: 1 }], desc: "单日查询，结束日期未定义" },
      { start: "2024-01-01", end: "2024-01-05", expected: [], desc: "年初第一个节气之前的范围" },
      { start: "2024-02-20", end: "2024-03-04", expected: [], desc: "两个节气之间的范围 (雨水19日, 惊蛰5日)" },
      { start: "2024-02-19", end: "2024-03-05", expected: [ // 测试节气恰好在开始日期和结束日期的情况
          { date: "2024-02-19", term: "rain_water", name: "雨水", index: 1 },
          { date: "2024-03-05", name: "惊蛰", term: "the_waking_of_insects", index: 1 },
        ], desc: "节气在开始日期，节气在结束日期"
      },
      { start: "2024-01-05", end: "2024-01-06", expected: [{ date: "2024-01-06", term: "lesser_cold", name: "小寒", index: 1 }], desc: "节气在结束日期" },
      { start: "2024-01-06", end: "2024-01-07", expected: [{ date: "2024-01-06", term: "lesser_cold", name: "小寒", index: 1 }], desc: "节气在开始日期" },
      { start: "2024-12-20", end: "2025-01-07", expected: [ // 跨年范围测试
          { date: "2024-12-21", term: "the_winter_solstice", name: "冬至", index: 1 },
          { date: "2025-01-05", term: "lesser_cold", name: "小寒", index: 1 },
        ], desc: "跨年范围"
      },
       { start: "2024-01-10", end: "2024-01-15", expected: [], desc: "范围内无节气" },
       { start: "2024-02-01", end: "2024-02-03", expected: [], desc: "短范围，无节气" },
    ];

    test.each(testCases)("getSolarTerms($start, $end) ($desc)", ({ start, end, expected }) => {
      const terms = getSolarTerms(start, end);
      expect(terms).toEqual(expected);
    });

    test("should return empty array if start is after end", () => {
      expect(getSolarTerms("2024-02-01", "2024-01-01")).toEqual([]);
    });
  });

  describe('getSolarTermsInRange', () => {
    const defaultRangeTestCases = [
      {
        start: '2024-01-04', end: '2024-01-07', desc: "2024年1月4日至1月7日",
        expected: [
          { date: '2024-01-04', term: 'the_winter_solstice', name: '冬至', index: 14 },
          { date: '2024-01-05', term: 'the_winter_solstice', name: '冬至', index: 15 },
          { date: '2024-01-06', term: 'lesser_cold', name: '小寒', index: 1 },
          { date: '2024-01-07', term: 'lesser_cold', name: '小寒', index: 2 }
        ]
      },
      {
        start: '2024-01-20', end: undefined, desc: "单日查询 2024年1月20日 (结束日期未定义)",
        expected: [{ date: '2024-01-20', term: 'greater_cold', name: '大寒', index: 1 }]
      },
      {
        start: '2024-12-30', end: '2025-01-02', desc: "跨年范围 2024年12月30日至2025年1月2日",
        expected: [
          { date: '2024-12-30', term: 'the_winter_solstice', name: '冬至', index: 10 },
          { date: '2024-12-31', term: 'the_winter_solstice', name: '冬至', index: 11 },
          { date: '2025-01-01', term: 'the_winter_solstice', name: '冬至', index: 12 },
          { date: '2025-01-02', term: 'the_winter_solstice', name: '冬至', index: 13 }
        ]
      },
      {
        start: '2024-01-06', end: '2024-01-06', desc: "单日查询，恰好是节气开始日",
        expected: [{ date: '2024-01-06', term: 'lesser_cold', name: '小寒', index: 1 }]
      },
      {
        start: '2024-01-07', end: '2024-01-07', desc: "单日查询，节气的第二天",
        expected: [{ date: '2024-01-07', term: 'lesser_cold', name: '小寒', index: 2 }]
      },
      {
        start: '2024-01-01', end: '2024-01-03', desc: "范围内无节气开始日，但处于某个节气期间",
        expected: [
          { date: '2024-01-01', term: 'the_winter_solstice', name: '冬至', index: 11 },
          { date: '2024-01-02', term: 'the_winter_solstice', name: '冬至', index: 12 },
          { date: '2024-01-03', term: 'the_winter_solstice', name: '冬至', index: 13 },
        ]
      }
    ];

    test.each(defaultRangeTestCases)("getSolarTermsInRange($start, $end) ($desc)", ({ start, end, expected }) => {
      const result = getSolarTermsInRange(start, end);
      expect(result).toEqual(expected);
    });

    test("should return empty array if start is after end for getSolarTermsInRange", () => {
      // getSolarTermsInRange 的当前逻辑（开始日期减一个月，结束日期加一个月）
      // 即使调整后的范围有效，后续的 isBetween(start, end) 过滤仍会因原始 start > end 而返回 false。
      expect(getSolarTermsInRange("2024-02-01", "2024-01-01")).toEqual([]);
    });

    // 测试确保 getSolarTermsInRange 在一年内能覆盖全部24个节气
    test('getSolarTermsInRange should cover all 24 solar terms in a year', () => {
      const allTermsFor2024 = getSolarTermsInRange('2024-01-01', '2024-12-31');
      const uniqueTerms = new Set(allTermsFor2024.map(t => t.term));
      expect(uniqueTerms.size).toBe(24);
    });
  });
});
