# 阳历农历互转

公历 1900 年 1 月 1 日至 30 日对应农历 1899 年腊月初一至三十，1 月 31 日是农历 1900 年正月初一。

::: info 小提示
农历又称阴历，本项目中统一称为农历。
:::

::: info 特别说明
1. `2057-09-28` 为：农历丁丑(牛)年九月初一；
2. `2097-08-07` 为：农历丁巳(蛇)年七月初一。
:::

## 阳历转换农历

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

// 非闰月 和 闰月例子
console.log(getLunarDate('2001-04-27'));
console.log(getLunarDate('2001-05-27'));
```

## 根据阳历日期区间，批量获取农历日期

```js
console.log(getLunarDatesInRange('2001-05-21', '2001-05-26'));
```