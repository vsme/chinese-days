import * as HolidayUtils from "./holidays";
import * as SolarTerm from "./solar_terms";
import * as SolarLunar from "./solar_lunar";

// 单独导出这些方法和类型
export * from "./holidays";
export * from "./solar_terms";
export * from "./solar_lunar";

// 默认导出所有
export default {
  ...HolidayUtils,
  ...SolarTerm,
  ...SolarLunar,
}
