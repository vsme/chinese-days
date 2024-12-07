# 中国节假日

## 介绍

本项目提供了一系列用于查询中国节假日、调休日、工作日、24节气、以及农历与阳历互转的函数，此外还支持 `iCal` 文件订阅节假日，可供 Google Calendar、Apple Calendar、Microsoft Outlook 等客户端订阅。

每日会定时执行 `Github Action` 自动抓取数据，节假日变化时发送邮件提醒，信息会跟随国务院发布进行更新。

+ **节假日**：支持 2004年 至 2025年，包括 2020年 的春节延长
+ **24节气**：支持 1900年 至 2100年。
+ **农历日**：支持 1900年 至 2100年。

项目主要针对 `JS` 或 `TS` 用户，使用方法可以看后续的文档。

## 非 `JS` 语言

如果你不使用 `JS` 或 `TS` 开发项目，本项目提供了中国节假日的 [chinese-days.json](https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json) 文件，可以通过下面的 CDN 链接进行使用。

```
https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json
```

比如在 `Java` 中使用，可以参考 [Warnier-zhang/java-chinese-days](https://github.com/Warnier-zhang/java-chinese-days)，仅用于查询中国节假日、调休日、工作日。

## 许可信息

项目基于 MIT 许可发布。