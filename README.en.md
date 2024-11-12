# Chinese Days

[![NPM Version](https://img.shields.io/npm/v/chinese-days)](https://www.npmjs.com/package/chinese-days)
[![GitHub License](https://img.shields.io/github/license/vsme/chinese-days)](https://github.com/vsme/chinese-days/blob/main/LICENSE)
[![README](https://img.shields.io/badge/README-中文-brightgreen.svg)](https://github.com/vsme/chinese-days/blob/main/README.md)

> Translated by ChatGPT-4, PRs are welcome.

This project provides a series of functions for querying Chinese holidays, adjusted working days, working days, 24 solar terms, and converting between lunar and solar calendars. Additionally, it supports ics file subscription for holidays, which can be subscribed to by Google Calendar, Apple Calendar, Microsoft Outlook, and other clients. The holiday information will be updated according to the announcements from the State Council.

+ **Holidays**: Supports the years 2004 to 2025, including the extended Spring Festival of 2020.
+ **24 Solar Terms**: Supports the years 1900 to 2100.
+ **Lunar Days**: Supports the years 1900 to 2100.

## Subscribe to Calendar

The subscribed calendar includes holidays and adjusted working days for the past three years (2023-2025).

Subscription URL: [https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.ics](https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.ics) (default language is Chinese)

For English: [https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.en.ics](https://cdn.jsdelivr.net/npm/chinese-days/dist/holidays.en.ics)

## For non-JS projects, you can use the JSON file

A `JSON` file of Chinese holidays is provided and can be directly referenced through this link: [chinese-days.json](https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json).

## Quick Start

### Recommended approach

Direct browser import for more timely updates

```html
<script src="https://cdn.jsdelivr.net/npm/chinese-days/dist/index.min.js"></script>
<script>
  chineseDays.isHoliday('2024-01-01');
  // Or use destructuring
  const { isHoliday } = chineseDays;
</script>
```

OR

```html
<script type="module">
  import chineseDays from 'https://cdn.jsdelivr.net/npm/chinese-days/dist/index.es.js'
  chineseDays.isHoliday('2024-01-01');
</script>
```

### Installation:

```sh
npm i chinese-days
```

Using ESM import:

```ts
import chineseDays from 'chinese-days';
console.log(chineseDays);
```

Using in Node.js:

```js
const { isWorkday, isHoliday } = require('chinese-days');
console.log(isWorkday('2020-01-01'));
console.log(isHoliday('2020-01-01'));
```

## Holiday Module

### `isWorkday` Check if a date is a workday

```js
console.log(isWorkday('2023-01-01')); // false
```

### `isHoliday` Check if a date is a holiday

```js
console.log(isHoliday('2023-01-01')); // true
```

### `isInLieu` Check if a date is an in lieu day

On a Chinese holiday arrangement, an in lieu day is a workday or a rest day adjusted for consecutive holidays or make-up workdays. For example, if a public holiday is connected to a weekend, a weekend day might be adjusted to a workday, or a workday might be adjusted to a rest day for a longer consecutive holiday.

```js
// Check if 2024-05-02 is an in lieu day. Returns `true` if it is.
console.log(isInLieu('2024-05-02')); // true

// Check if 2024-05-01 is an in lieu day. Returns `false` if it is not.
console.log(isInLieu('2024-05-01')); // false
```

### `getDayDetail` Check if a specified date is a workday

This function checks if a specified date is a workday and returns a boolean indicating if it's a workday and details about the date.

1. If the specified date is a workday, it returns true and the name of the workday. If it's a make-up workday, it returns true and holiday details.
2. If it's a holiday, it returns false and holiday details.

```js
// Example usage

// Regular workday, Friday
console.log(getDayDetail('2024-02-02')); // { "date": "2024-02-02", "work":true,"name":"Friday"}
// Holiday, Saturday
console.log(getDayDetail('2024-02-03')); // { "date": "2024-02-03", "work":false,"name":"Saturday"}
// Make-up workday
console.log(getDayDetail('2024-02-04')); // { "date": "2024-02-04", "work":true,"name":"Spring Festival,春节,3"}
// Holiday, Spring Festival
console.log(getDayDetail('2024-02-17')); // { "date": "2024-02-17", "work":false,"name":"Spring Festival,春节,3"}
```

### `getHolidaysInRange` Get all holidays within a specified date range

Receives start and end dates and optionally includes weekends. If weekends are included, the function returns all holidays including weekends; otherwise, only holidays on weekdays are returned.

> Tip: Even if weekends are not included, holidays that fall on weekends will still be returned.

```js
// Example usage
const start = '2024-04-26';
const end = '2024-05-06';

// Get all holidays from 2024-05-01 to 2024-05-10, including weekends
const holidaysIncludingWeekends = getHolidaysInRange(start, end, true);
console.log('Holidays including weekends:', holidaysIncludingWeekends.map(d => getDayDetail(d)));

// Get holidays from 2024-05-01 to 2024-05-10, excluding weekends
const holidaysExcludingWeekends = getHolidaysInRange(start, end, false);
console.log('Holidays excluding weekends:', holidaysExcludingWeekends.map(d => getDayDetail(d)));
```

### `getWorkdaysInRange` Get a list of workdays within a specified date range

Receives start and end dates and optionally includes weekends. If weekends are included, the function returns all workdays including weekends; otherwise, only weekdays (Monday to Friday) workdays are returned.

```js
// Example usage
const start = '2024-04-26';
const end = '2024-05-06';

// Get all workdays from 2024-05-01 to 2024-05-10, including weekends
const workdaysIncludingWeekends = getWorkdaysInRange(start, end, true);
console.log('Workdays including weekends:', workdaysIncludingWeekends);

// Get workdays from 2024-05-01 to 2024-05-10, excluding weekends
const workdaysExcludingWeekends = getWorkdaysInRange(start, end, false);
console.log('Workdays excluding weekends:', workdaysExcludingWeekends);
```

### `findWorkday` Find a workday

Find the workday that is {deltaDays} workdays from today.

```js
// Find the workday that is {deltaDays} workdays from today
// If deltaDays is 0, first check if today is a workday. If it is, return today.
// If today is not a workday, find the next workday.
const currentWorkday = findWorkday(0);
console.log(currentWorkday);

// Find the next workday from today
const nextWorkday = findWorkday(1);
console.log(nextWorkday);

// Find the previous workday from today
const previousWorkday = findWorkday(-1);
console.log(previousWorkday);

// You can pass a second parameter to find a specific date's workdays
// Find the second workday from 2024-05-18
const secondNextWorkday = findWorkday(2, '2024-05-18');
console.log(secondNextWorkday);
```

## Solar Terms Module

### Get Dates for the 24 Solar Terms

The 24 solar terms in China are part of a traditional agricultural calendar, marking different **time periods** throughout the year. Each term typically has a specific start date, but this date does not represent the entire duration of the term. In fact, each solar term lasts about 15 days.

For example, the term "Lesser Fullness of Grain" (小满) typically starts around May 20th in the Gregorian calendar, but it doesn't end on that day. Instead, it lasts until the next solar term begins. Specifically, "Lesser Fullness of Grain" lasts until around June 5th, when the "Grain in Ear" (芒种) term begins. Therefore, the time period for the "Lesser Fullness of Grain" solar term is from approximately May 20th to June 5th.

#### Get an Array of Solar Terms Dates within a Range

```js
import { getSolarTermsInRange } from "chinese-days";

// No parameters, queries the current day
console.log(getSolarTermsInRange())
// [{date: '2024-05-29', term: 'lesser_fullness_of_grain', name: '小满', index: 10}]
// index: indicates the day within the current term, starting from 1

// No end parameter, queries for a specific date
console.log(getSolarTermsInRange('2024-05-01'))
// [{date: '2024-05-01', term: 'grain_rain', name: '谷雨', index: 13}]

// Query solar terms within a specified range
console.log(getSolarTermsInRange('2024-05-01', '2024-05-06'))
/**
 * =>
 * [
 *   {"date":"2024-05-01","term":"grain_rain","name":"谷雨","index":13},
 *   {"date":"2024-05-02","term":"grain_rain","name":"谷雨","index":14},
 *   {"date":"2024-05-03","term":"grain_rain","name":"谷雨","index":15},
 *   {"date":"2024-05-04","term":"grain_rain","name":"谷雨","index":16},
 *   {"date":"2024-05-05","term":"the_beginning_of_summer","name":"立夏","index":1},
 *   {"date":"2024-05-06","term":"the_beginning_of_summer","name":"立夏","index":2}
 * ]
 **/
```

#### If You Only Want to Get an Array of Solar Term Start Dates

```js
import { getSolarTerms } from "chinese-days";

/** Get an array of solar term start dates within a range */
const solarTerms = getSolarTerms("2024-05-01", "2024-05-20");
solarTerms.forEach(({ date, term, name }) => {
  console.log(`${name}: ${date}, ${term}`);
});
// 立夏: 2024-05-05, the_beginning_of_summer
// 小满: 2024-05-20, lesser_fullness_of_grain

// No solar terms found, returns []
getSolarTerms("2024-05-21", "2024-05-25");
// return []

/* No end parameter, get the solar term for a specific day */
getSolarTerms("2024-05-20");
// return: [{date: '2024-05-20', term: 'lesser_fullness_of_grain', name: '小满'}]
```

## Conversion Between Gregorian and Lunar Calendar

Special notes for this library:
1. `2057-09-28` is the lunar date: `丁丑` year, August 30th;
2. `2097-08-07` is the lunar date: `丁巳` year, July 1st.

### Convert Gregorian Date to Lunar Date

```js
// 2097-08-07
console.log(getLunarDate('2097-08-07'));

// 2057-09-28
console.log(getLunarDate('2057-09-28'));
// Output:
// {
//   date: "2057-09-28",
//   lunarYear: 2057,
//   lunarMon: 8,
//   lunarDay: 30,
//   isLeap: false,
//   lunarDayCN: "三十",
//   lunarMonCN: "八月",
//   lunarYearCN: "二零五七",
//   yearCyl: "丁丑",
//   monCyl: "己酉",
//   dayCyl: "戊子",
//   zodiac: "牛"
// }

// Examples of non-leap and leap months
console.log(getLunarDate('2001-04-27'));
console.log(getLunarDate('2001-05-27'));
```

### Get Lunar Dates in a Range of Gregorian Dates

```js
console.log(getLunarDatesInRange('2001-05-21', '2001-05-26'));
```

### Convert Lunar Date to Gregorian Date

When dealing with a leap month in the lunar calendar, one lunar date may correspond to two different Gregorian dates, hence the return is in object form.

```js
console.log(getSolarDateFromLunar('2001-03-05'));
// Output: {date: '2001-03-29', leapMonthDate: undefined}

console.log(getSolarDateFromLunar('2001-04-05'));
// Output: {date: '2001-04-27', leapMonthDate: '2001-05-27'}
```

## Contributing

1. Fork + Clone the project to your local machine;
2. Holidays: Modify the [holiday definitions](https://github.com/vsme/chinese-days/blob/main/src/holidays/generate.ts);
3. Lunar definitions: Modify the [lunar definitions](https://github.com/vsme/chinese-days/blob/main/src/solar_lunar/constants.ts);
4. For other modifications, refer to the source code yourself;
5. Submit a PR.

## Acknowledgements

1. Lunar calendar data is sourced from the [Bigkoo/Android-PickerView](https://github.com/Bigkoo/Android-PickerView) project.
2. Chinese holiday data generation references the `Python` version of the [LKI/chinese-calendar](https://github.com/LKI/chinese-calendar) project.