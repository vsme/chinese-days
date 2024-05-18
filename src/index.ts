import * as HolidayUtils from "./holidays";
import * as SolarTermUtils from "./solar_terms";

// 单独导出这些方法和类型
export * from "./holidays";
export * from "./solar_terms";

// 默认导出所有
const chinaDays = {
  ...HolidayUtils,
  ...SolarTermUtils,
};

export default chinaDays;
