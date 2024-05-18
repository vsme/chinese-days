import * as Utils from "./utils";
import * as HolidayUtils from "./holidays";
import * as SolarTermUtils from "./solar_terms";

// 单独导出这些方法和类型
export * from "./utils";
export * from "./holidays";
export * from "./solar_terms";

// 默认导出所有
const chinaDays = {
  ...Utils,
  ...HolidayUtils,
  ...SolarTermUtils,
};

export default chinaDays;
