# Chinese Days

[![NPM Version](https://img.shields.io/npm/v/chinese-days)](https://www.npmjs.com/package/chinese-days)
[![GitHub License](https://img.shields.io/github/license/vsme/chinese-days)](https://github.com/vsme/chinese-days/blob/main/LICENSE)
[![README](https://img.shields.io/badge/README-中文-brightgreen.svg)](https://github.com/vsme/chinese-days/blob/main/README.md)

This project provides a series of functions for querying Chinese holidays, adjusted working days, working days, 24 solar terms, and converting between lunar and solar calendars. Additionally, it supports ics file subscription for holidays, which can be subscribed to by Google Calendar, Apple Calendar, Microsoft Outlook, and other clients. 

## Documentation

To check out docs, visit [chinese-days.yaavi.me](https://chinese-days.yaavi.me/en/).

The holiday information will be updated according to the announcements from the State Council.

+ **Holidays**: Supports the years 2004 to 2025, including the extended Spring Festival of 2020.
+ **24 Solar Terms**: Supports the years 1900 to 2100.
+ **Lunar Days**: Supports the years 1900 to 2100.

## Subscribe to Calendar

The subscribed calendar includes holidays and adjusted working days for the past three years (2023-2025).

Subscription URL: [https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.ics](https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.ics) (default language is Chinese)

For English: [https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.en.ics](https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.en.ics)

## For non-JS projects, you can use the JSON file

A `JSON` file of Chinese holidays is provided and can be directly referenced through this link: [chinese-days.json](https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json).

For example, in `Java`, you can refer to [Warnier-zhang/java-chinese-days](https://github.com/Warnier-zhang/java-chinese-days), which is only for querying Chinese holidays, in-lieu days, and regular workdays.

## Contributing

1. Fork + Clone the project to your local machine;
2. Holidays: Modify the [holiday definitions](https://github.com/vsme/chinese-days/blob/main/src/holidays/generate.ts);
3. Lunar definitions: Modify the [lunar definitions](https://github.com/vsme/chinese-days/blob/main/src/solar_lunar/constants.ts);
4. For other modifications, refer to the source code yourself;
5. Submit a PR.

## Acknowledgements

1. Lunar calendar data is sourced from the [Bigkoo/Android-PickerView](https://github.com/Bigkoo/Android-PickerView) project.
2. Chinese holiday data generation references the `Python` version of the [LKI/chinese-calendar](https://github.com/LKI/chinese-calendar) project.
