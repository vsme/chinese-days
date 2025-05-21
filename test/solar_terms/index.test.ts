import dayjs from "../../src/utils/dayjs";
import { getSolarTermDate, getSolarTerms, getSolarTermsInRange, type SolarTerm } from "../../src";
import { SOLAR_TERMS_MONTH, SOLAR_TERMS, type SolarTermKey } from "../../src/solar_terms/constants";

describe("Solar Terms", () => {
  describe("getSolarTermDate", () => {
    const testCases = [
      { year: 1998, month: 1, term: "lesser_cold" as SolarTermKey, expected: "1998-01-05", century: 20, desc: "Lesser Cold 1998 (20th century)" },
      { year: 2024, month: 1, term: "lesser_cold" as SolarTermKey, expected: "2024-01-06", century: 21, desc: "Lesser Cold 2024 (21st century)" },
      { year: 2026, month: 2, term: "rain_water" as SolarTermKey, expected: "2026-02-18", century: 21, desc: "Rain Water 2026 (with delta)" }, // SOLAR_TERMS_DELTA has 2026_rain_water: -1
      { year: 2024, month: 2, term: "the_beginning_of_spring" as SolarTermKey, expected: "2024-02-04", century: 21, desc: "Beginning of Spring 2024 (no delta)" },
      { year: 1900, month: 1, term: "greater_cold" as SolarTermKey, expected: "1900-01-21", century: 20, desc: "Greater Cold 1900 (Y-1)/4 logic for Jan term" },
      { year: 2000, month: 12, term: "the_winter_solstice" as SolarTermKey, expected: "2000-12-21", century: 20, desc: "Winter Solstice 2000 (20th cent.)" },
      { year: 2001, month: 3, term: "the_spring_equinox" as SolarTermKey, expected: "2001-03-20", century: 21, desc: "Spring Equinox 2001 (21st cent.)" },
      // Test a case where (Y-1)/4 vs Y/4 makes a difference for L value
      { year: 2001, month: 1, term: "lesser_cold" as SolarTermKey, expected: "2001-01-05", desc: "Lesser Cold 2001, Y=1, (Y-1)/4 = 0" }, // Y=1. (Y-1)/4=0. Y/4=0. No diff here.
      { year: 2004, month: 1, term: "lesser_cold" as SolarTermKey, expected: "2004-01-06", desc: "Lesser Cold 2004, Y=4, (Y-1)/4 = 0" }, // Y=4. (Y-1)/4=0. Y/4=1. L should be 0.
      { year: 2005, month: 1, term: "lesser_cold" as SolarTermKey, expected: "2005-01-05", desc: "Lesser Cold 2005, Y=5, (Y-1)/4 = 1" }, // Y=5. (Y-1)/4=1. Y/4=1. L should be 1.
    ];

    test.each(testCases)("should calculate $term for $year-$month ($desc) as $expected", ({ year, month, term, expected }) => {
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
      { start: "2024-01-06", end: undefined, expected: [{ date: "2024-01-06", term: "lesser_cold", name: "小寒", index: 1 }], desc: "Single day, end undefined" },
      { start: "2024-01-01", end: "2024-01-05", expected: [], desc: "Range before first solar term of year" },
      { start: "2024-02-20", end: "2024-03-04", expected: [], desc: "Range between two solar terms (Rain Water 19th, Waking Insect 5th)" },
      // Tests for line 84 conditions
      { start: "2024-02-19", end: "2024-03-05", expected: [ // Term on start, term on end
          { date: "2024-02-19", term: "rain_water", name: "雨水", index: 1 },
          { date: "2024-03-05", name: "惊蛰", term: "the_waking_of_insects", index: 1 },
        ], desc: "Term on start date, term on end date"
      },
      { start: "2024-01-05", end: "2024-01-06", expected: [{ date: "2024-01-06", term: "lesser_cold", name: "小寒", index: 1 }], desc: "Term on end date" },
      { start: "2024-01-06", end: "2024-01-07", expected: [{ date: "2024-01-06", term: "lesser_cold", name: "小寒", index: 1 }], desc: "Term on start date" },
      { start: "2024-12-20", end: "2025-01-07", expected: [ // Across year boundary
          { date: "2024-12-21", term: "the_winter_solstice", name: "冬至", index: 1 },
          { date: "2025-01-05", term: "lesser_cold", name: "小寒", index: 1 },
        ], desc: "Range across year boundary"
      },
       { start: "2024-01-10", end: "2024-01-15", expected: [], desc: "Range with no solar terms within it" },
       { start: "2024-02-01", end: "2024-02-03", expected: [], desc: "Short range, no terms" },
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
        start: '2024-01-04', end: '2024-01-07', desc: "Jan 4 to Jan 7 2024",
        expected: [
          { date: '2024-01-04', term: 'the_winter_solstice', name: '冬至', index: 14 },
          { date: '2024-01-05', term: 'the_winter_solstice', name: '冬至', index: 15 },
          { date: '2024-01-06', term: 'lesser_cold', name: '小寒', index: 1 },
          { date: '2024-01-07', term: 'lesser_cold', name: '小寒', index: 2 }
        ]
      },
      {
        start: '2024-01-20', end: undefined, desc: "Single day Jan 20 2024 (end undefined)",
        expected: [{ date: '2024-01-20', term: 'greater_cold', name: '大寒', index: 1 }]
      },
      {
        start: '2024-12-30', end: '2025-01-02', desc: "Across year boundary Dec 30 2024 to Jan 2 2025",
        expected: [
          { date: '2024-12-30', term: 'the_winter_solstice', name: '冬至', index: 10 },
          { date: '2024-12-31', term: 'the_winter_solstice', name: '冬至', index: 11 },
          { date: '2025-01-01', term: 'the_winter_solstice', name: '冬至', index: 12 },
          { date: '2025-01-02', term: 'the_winter_solstice', name: '冬至', index: 13 }
        ]
      },
      {
        start: '2024-01-06', end: '2024-01-06', desc: "Single day on a solar term start",
        expected: [{ date: '2024-01-06', term: 'lesser_cold', name: '小寒', index: 1 }]
      },
      {
        start: '2024-01-07', end: '2024-01-07', desc: "Single day, 2nd day of a solar term",
        expected: [{ date: '2024-01-07', term: 'lesser_cold', name: '小寒', index: 2 }]
      },
      {
        start: '2024-01-01', end: '2024-01-03', desc: "Range with no solar term start, but within a term period",
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
      // Current logic of getSolarTermsInRange (subtracting 1 month from start, adding 1 to end)
      // might still produce results if the adjusted range is valid.
      // If start = 2024-02-01, end = 2024-01-01.
      // current becomes 2024-01-01. endDate becomes 2024-02-01.
      // allTerms will be populated for Jan.
      // deltaDays will be populated.
      // filter `trem.day.isBetween(start, end, 'day')` -> `isBetween('2024-02-01', '2024-01-01')` will be false.
      expect(getSolarTermsInRange("2024-02-01", "2024-01-01")).toEqual([]);
    });

    // Test to ensure all 24 solar terms are covered by getSolarTermsInRange throughout a year
    test('getSolarTermsInRange should cover all 24 solar terms in a year', () => {
      const allTermsFor2024 = getSolarTermsInRange('2024-01-01', '2024-12-31');
      const uniqueTerms = new Set(allTermsFor2024.map(t => t.term));
      expect(uniqueTerms.size).toBe(24);
    });
  });
});
