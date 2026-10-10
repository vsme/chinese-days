# 中国节假日

[![NPM Version](https://img.shields.io/npm/v/chinese-days)](https://www.npmjs.com/package/chinese-days)
[![GitHub License](https://img.shields.io/github/license/vsme/chinese-days)](https://github.com/vsme/chinese-days/blob/main/LICENSE)
[![README](https://img.shields.io/badge/README-English-brightgreen.svg)](https://github.com/vsme/chinese-days/blob/main/README.en.md)

本项目提供了一系列用于查询中国节假日、调休日、工作日、24节气、以及农历阳历互转的函数，提供 `JSON` 文件，此外还支持 `iCal` 文件订阅节假日，可供 Google Calendar、Apple Calendar、Microsoft Outlook 等客户端订阅。

## 自动化

已集成 AI 提取官方公告并判断调休日期、程序自动校验和创建 PR 的流程，无需人工填写调休规则。只新增已收录最大年份的下一年，已有年份直接跳过；校验失败会自动反馈给 AI 重试，PR 实际变化时才发送邮件。

配置格式保持 `.r()`、`.w()`、`.i()`，详细流程及自动校验规则见[贡献指南](docs/zh/guide/contributing.md#自动生成新年份)。

参考PR：[#31 自动更新 2025 年假期配置](https://github.com/vsme/chinese-days/pull/31)

## 文档

查看文档, 请访问 [chinese-days.yaavi.me](https://chinese-days.yaavi.me/).

每日会执行 `Action` 检查下一年的官方公告，生成新年份提案并发送邮件提醒审核，已有年份保持不变。

- **节假日**：支持 2004年 至 2026年，包括 2020年 的春节延长
- **24节气**：支持 1900年 至 2100年。
- **农历日**：支持 1900年 至 2100年。

## 非 `JS` 语言

如果你不使用 `JS` 或 `TS` 开发项目，本项目提供了中国节假日的 `JSON` 文件，通过链接 [chinese-days.json](https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json) 可以直接引用；如果需要按年份单独的 `JSON` 文件，也可以通过链接 [years/2025.json](https://cdn.jsdelivr.net/npm/chinese-days/dist/years/2025.json) 直接引用，支持 2004 及之后的年份。

比如在 `Java` 中使用，可以参考 [Warnier-zhang/java-chinese-days](https://github.com/Warnier-zhang/java-chinese-days)，仅用于查询中国节假日、调休日、工作日；

## 日历订阅

在 Google Calendar、Apple Calendar、Microsoft Outlook 等客户端中，可以设置订阅地址：[https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.ics](https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.ics) 来获取日历订阅。

For English: [https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.en.ics](https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.en.ics)

订阅的日历包含近三年的节假日和调休日。

如果需要按年份单独的 `ics` 文件，也可以通过链接 [https://cdn.jsdelivr.net/npm/chinese-days/dist/years/2025.ics](https://cdn.jsdelivr.net/npm/chinese-days/dist/years/2025.ics) 直接引用，英文版本为 [https://cdn.jsdelivr.net/npm/chinese-days/dist/years/2025.en.ics](https://cdn.jsdelivr.net/npm/chinese-days/dist/years/2025.en.ics)，支持 2004 及之后的年份。

## 贡献代码

1. Fork + Clone 项目到本地；
2. 节假日: 修改 [节假日定义](https://github.com/vsme/chinese-days/blob/main/src/holidays/generate.ts)；
3. 农历定义: 修改 [农历定义](https://github.com/vsme/chinese-days/blob/main/src/solar_lunar/constants.ts)；
4. 其他修改...；
5. 提交PR。

## 致谢

1. 农历数据来自于 [Bigkoo/Android-PickerView](https://github.com/Bigkoo/Android-PickerView) 项目。
2. 中国节假日数据生成参考了 `Python` 版本的 [LKI/chinese-calendar](https://github.com/LKI/chinese-calendar) 项目。
3. 感谢[阮一峰大佬的推荐](https://github.com/ruanyf/weekly/blob/master/docs/issue-372.md#%E5%B7%A5%E5%85%B7)。
