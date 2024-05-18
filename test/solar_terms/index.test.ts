import dayjs from "dayjs";
import {
  getSolarTermDate,
  getSolarTerms,
  type SolarTerm,
} from "../../src/solar_terms";

import type { SolarTermKey } from "../../src/solar_terms/constants";

describe("Solar Terms", () => {
  describe("getSolarTermDate", () => {
    it("should correctly calculate the solar term date for 'lesser_cold' in 2024", () => {
      const term: SolarTermKey = "lesser_cold";
      const date = getSolarTermDate(2024, 1, term);
      expect(date.format("YYYY-MM-DD")).toBe("2024-01-06");
    });

    it("should correctly calculate the solar term date for 'rain_water' in 2026 with delta adjustment", () => {
      const term: SolarTermKey = "rain_water";
      const date = getSolarTermDate(2026, 2, term);
      expect(date.format("YYYY-MM-DD")).toBe("2026-02-18");
    });

    it("should handle the case where there is no delta adjustment", () => {
      const term: SolarTermKey = "the_beginning_of_spring";
      const date = getSolarTermDate(2024, 2, term);
      expect(date.format("YYYY-MM-DD")).toBe("2024-02-04");
    });
  });

  describe("getSolarTerms", () => {
    it("should return the solar terms within the date range in 2024", () => {
      const start = dayjs("2024-01-01");
      const end = dayjs("2024-02-29");
      const terms = getSolarTerms(start, end);
      const expected: SolarTerm[] = [
        { date: "2024-01-06", term: "lesser_cold", name: "小寒" },
        { date: "2024-01-20", term: "greater_cold", name: "大寒" },
        { date: "2024-02-04", term: "the_beginning_of_spring", name: "立春" },
        { date: "2024-02-19", term: "rain_water", name: "雨水" },
      ];
      expect(terms).toEqual(expected);
    });

    it("should return an empty array if no solar terms fall within the date range", () => {
      const start = dayjs("2024-03-01");
      const end = dayjs("2024-03-31");
      const terms = getSolarTerms(start, end);
      expect(terms).toEqual([
        {
          date: "2024-03-05",
          name: "惊蛰",
          term: "the_waking_of_insects",
        },
        {
          date: "2024-03-20",
          name: "春分",
          term: "the_spring_equinox",
        },
      ]);
    });

    it("should handle a single day range", () => {
      const date = dayjs("2024-01-06");
      const terms = getSolarTerms(date, date);
      const expected: SolarTerm[] = [
        { date: "2024-01-06", term: "lesser_cold", name: "小寒" },
      ];
      expect(terms).toEqual(expected);
    });
  });
});
