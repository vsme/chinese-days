# CHANGELOG

## [2.0.0](https://github.com/vsme/chinese-days/releases/tag/v2.0.0) (2026-11-18)

- **不兼容变更**：`getSolarDateFromLunar()` 的 `date` 类型从 `string` 变为 `string | undefined`。普通月有效时优先返回普通月日期，仅闰月有效时返回闰月日期，均无效时返回 `undefined`。新增的 `isLeap` 表示 `date` 是否取自闰月；`leapMonthDate` 继续提供有效的闰月候选。[2.0 返回值与迁移示例](docs/zh/guide/from-lunar.md)
- 修正 1900–1999 年立秋及部分年份的节气起始日和每日节气序号。历史交节日期以紫金山天文台正文为准，并列明与香港天文台历表的 6 处差异。[节气日期依据](docs/zh/guide/24-solar-terms.md#节气日期依据)
- 修正 1933、1996、2057、2060 年涉及的五个农历月界；1996 年中秋节现为 9 月 27 日。补齐 1900 年 1 月 1–30 日的农历双向转换，修复农历二月末反查进位及大小月无效候选问题。[Issue #51](https://github.com/vsme/chinese-days/issues/51)
- 新增 `npm run check:calendars` 及 PR 自动核对，逐日对照紫金山天文台 1900–2025 年和香港天文台 1901–2100 年历表。[核对说明](scripts/calendar-audit/README.md)

## [1.5.10](https://github.com/vsme/chinese-days/releases/tag/v1.5.10) (2026-11-05)

- 新增 2027 年节假日安排（[#50](https://github.com/vsme/chinese-days/pull/50)）。

## [1.5.9](https://github.com/vsme/chinese-days) (2026-06-02)

- fix: 修复 [#40](https://github.com/vsme/chinese-days/issues/40) 中1989年4月16/17日的农历日错误

## [1.5.5](https://github.com/vsme/chinese-days) (2026-03-05)

- fix: 时区问题导致用户农历误差。

## [1.5.4](https://github.com/vsme/chinese-days) (2025-11-05)

- 新增 2026 年节假日

## [1.5.3](https://github.com/vsme/chinese-days) (2025-10-15)

- 新增 `json` 和 `ics` 按年份生成单独文件

## [1.5.2](https://github.com/vsme/chinese-days) (2025-10-15)

- 日常维护，优化代码。

## [1.5.1](https://github.com/vsme/chinese-days) (2025-05-21)

- 优化了部分代码，完善了测试用例，测试覆盖率 100%。

## [1.5.0](https://github.com/vsme/chinese-days) (2025-01-24)

- 增加中国农历民俗节日与纪念日

## [1.4.0](https://github.com/vsme/chinese-days) (2024-11-21)

- 完善法定节假日的放假天数，比如 `2007-05-01` 法定节假日为 `Labour Day,劳动节,3`，`2024-05-01` 法定节假日为 `Labour Day,劳动节,1`，而 `2025-05-01` 为 `Labour Day,劳动节,2`，最后一个数字 `3`、`1`、`2` 对应每年法定节假日的精准放假天数。

## [1.3.4](https://github.com/vsme/chinese-days) (2024-11-13)

- 修正中秋节展示问题

## [1.3.3](https://github.com/vsme/chinese-days) (2024-11-12)

- 增加 2025 年节假日

## [1.3.2](https://github.com/vsme/chinese-days) (2024-11-05)

- 修复 `getLunarDate` 阴历闰月的第一天月份错误

## [1.3.1](https://github.com/vsme/chinese-days) (2024-06-15)

- 增加 `iCal` 英文版本订阅

## [1.3.0](https://github.com/vsme/chinese-days) (2024-06-15)

- 支持 `iCal` 文件订阅节假日，可供 Google Calendar、Apple Calendar、Microsoft Outlook 等客户端订阅

## [1.2.4](https://github.com/vsme/chinese-days) (2024-06-03)

- 兼容 Safari 日期格式

## [1.2.3](https://github.com/vsme/chinese-days) (2024-05-30)

- 不在节假日范围内的日期不再抛出异常

## [1.2.2](https://github.com/vsme/chinese-days) (2024-05-29)

- 增加 `getSolarTermsInRange` 获取日期范围内节气

## [1.2.1](https://github.com/vsme/chinese-days) (2024-05-23)

- 优化代码
- 将导出内容作为命名导出

## [1.2.0](https://github.com/vsme/chinese-days) (2024-05-23)

### 特性

- 项目目录重构，代码逻辑更加清晰；
- 打包大小有所增加，为: 19.84 kB，gzip 压缩减小: 6.60 kB。

## [1.1.0](https://github.com/vsme/chinese-days) (2024-05-23)

### 特性

- 导出 `JSON` 文件，提供给非 `JS` 项目使用。

## [1.0.0](https://github.com/vsme/chinese-days) (2024-05-23)

- 1.0.0 版本正式发布。