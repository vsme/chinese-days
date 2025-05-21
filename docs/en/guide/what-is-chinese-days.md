# What is Chinese Days

## Introduction

This project provides a collection of functions for querying Chinese holidays, in lieu days, working days, the 24 solar terms, and converting between the lunar and solar calendars. Additionally, it supports subscribing to holiday calendars in `iCal` format, which can be integrated with clients such as Google Calendar, Apple Calendar, and Microsoft Outlook.

Data is automatically fetched daily through `GitHub Actions`. Notifications are sent via email when there are changes to holiday schedules, and information is updated based on announcements from the State Council.

+ **Holidays**: Covers the years from 2004 to 2025, including the extended Spring Festival in 2020.
+ **24 Solar Terms**: Supports dates from 1900 to 2100.
+ **Lunar Calendar**: Supports dates from 1900 to 2100.

The project primarily targets `JS` and `TS` users. Refer to the documentation for usage instructions.

## Non-`JS` Languages

If you are not developing projects in `JS` or `TS`, this project provides a [chinese-days.json](https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json) file for Chinese holidays. You can use the following CDN link:

```
https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json
```

For example, in `Java`, you can refer to [Warnier-zhang/java-chinese-days](https://github.com/Warnier-zhang/java-chinese-days), which is designed solely for querying Chinese holidays, adjusted working days, and regular workdays.

## License Information

Released under the MIT License.