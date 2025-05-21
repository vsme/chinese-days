# CHANGELOG

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