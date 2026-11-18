# Gregorian to Lunar Calendar Conversion

January 1–30, 1900 corresponds to days 1–30 of the twelfth lunar month of 1899. January 31 is the first day of lunar year 1900.

::: info Tip
The lunar calendar, also known as the Chinese calendar, is referred to as the "Lunar Calendar" in this project.
:::

::: info Special Notes
1. `2057-09-28` corresponds to the Lunar Calendar date: Ding Chou (Ox) Year, Ninth Month, First Day;
2. `2097-08-07` corresponds to the Lunar Calendar date: Ding Si (Snake) Year, Seventh Month, First Day.
:::

## Convert Gregorian Date to Lunar Date

```js
// 2097-8-7
console.log(getLunarDate('2097-08-07'));

// 2057-9-28
console.log(getLunarDate('2057-09-28'));
// {
//   date: "2057-09-28",
//   lunarYear: 2057,
//   lunarMon: 9,
//   lunarDay: 1,
//   isLeap: false,
//   lunarDayCN: "初一",
//   lunarMonCN: "九月",
//   lunarYearCN: "二零五七",
//   yearCyl: "丁丑",
//   monCyl: "庚戌",
//   dayCyl: "戊子",
//   zodiac: "牛"
// }

// Examples of non-leap and leap months
console.log(getLunarDate('2001-04-27'));
console.log(getLunarDate('2001-05-27'));
```

## Batch Retrieve Lunar Dates for a Range of Gregorian Dates

```js
console.log(getLunarDatesInRange('2001-05-21', '2001-05-26'));
```