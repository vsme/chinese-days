# 中国节假日

[![NPM Version](https://img.shields.io/npm/v/chinese-days)](https://www.npmjs.com/package/chinese-days)
[![GitHub License](https://img.shields.io/github/license/vsme/chinese-days)](https://github.com/vsme/chinese-days/blob/main/LICENSE)
[![README](https://img.shields.io/badge/README-English-brightgreen.svg)](https://github.com/vsme/chinese-days/blob/main/README.en.md)

本项目提供了一系列用于查询中国节假日、调休日、工作日、24节气、以及农历阳历互转的函数，此外还支持 `iCal` 文件订阅节假日，可供 Google Calendar、Apple Calendar、Microsoft Outlook 等客户端订阅。

## 文档

查看文档, 请访问 [chinese-days.yaavi.me](https://chinese-days.yaavi.me/).

每日会执行 `Action` 自动抓取数据，节假日变化时发送邮件提醒，信息会跟随国务院发布进行更新。

+ **节假日**：支持 2004年 至 2025年，包括 2020年 的春节延长
+ **24节气**：支持 1900年 至 2100年。
+ **农历日**：支持 1900年 至 2100年。

## 非 `JS` 语言

如果你不使用 `JS` 或 `TS` 开发项目，本项目提供了中国节假日的 `JSON` 文件，通过链接 [chinese-days.json](https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json) 可以直接引用。

比如在 `Java` 中使用，可以参考 [Warnier-zhang/java-chinese-days](https://github.com/Warnier-zhang/java-chinese-days)，仅用于查询中国节假日、调休日、工作日；

## 日历订阅

在 Google Calendar、Apple Calendar、Microsoft Outlook 等客户端中，可以设置订阅地址：[https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.ics](https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.ics) 来获取日历订阅。

For English: [https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.en.ics](https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.en.ics)

订阅的日历包含近三年（2023-2025年）的节假日和调休日。

## 贡献代码

1. Fork + Clone 项目到本地；
2. 节假日: 修改 [节假日定义](https://github.com/vsme/chinese-days/blob/main/src/holidays/generate.ts)；
3. 农历定义: 修改 [农历定义](https://github.com/vsme/chinese-days/blob/main/src/solar_lunar/constants.ts)；
4. 其他修改...；
5. 提交PR。

## 致谢

1. 农历数据来自于 [Bigkoo/Android-PickerView](https://github.com/Bigkoo/Android-PickerView) 项目。
2. 中国节假日数据生成参考了 `Python` 版本的 [LKI/chinese-calendar](https://github.com/LKI/chinese-calendar) 项目。
