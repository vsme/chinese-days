# 中国节假日

![NPM Version](https://img.shields.io/npm/v/chinese-days)
![GitHub License](https://img.shields.io/github/license/vsme/chinese-days)
[![README](https://img.shields.io/badge/README-English-brightgreen.svg)](https://github.com/vsme/chinese-days/blob/main/README.en.md)

本项目提供了一系列用于查询中国节假日、调休日、工作日、24节气、以及农历阳历互转的函数，中国节假日会跟随国务院发布进行更新。

+ **节假日**：支持 2004年 至 2024年，包括 2020年 的春节延长
+ **24节气**：支持 1900年 至 2100年。
+ **农历日**：支持 1900年 至 2100年。

## 非 `JS` 语言

提供了中国节假日的 `JSON` 文件，通过链接 [chinese-days.json](https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json) 可以直接引用。

## 快速开始

推荐方式：直接浏览器引入，更新较为及时

```html
<script src="https://cdn.jsdelivr.net/npm/chinese-days/dist/index.min.js"></script>
<script>
  chineseDays.isHoliday('2024-01-01');
  // 或者解构使用
  const { isHoliday } = chineseDays;
  </script>
```

其他方式安装

```sh
npm i chinese-days
```

使用 ESM 导入

```ts
import chineseDays from 'chinese-days'
console.log(chineseDays)
```

在 Node 中使用

```js
const { isWorkday, isHoliday } = require('chinese-days');
console.log(isWorkday('2020-01-01'));
console.log(isHoliday('2020-01-01'));
```

## 节假日模块

### `isWorkday` 检查某个日期是否为工作日

```js
console.log(isWorkday('2023-01-01')); // false
```

### `isHoliday` 检查某个日期是否为节假日

```js
console.log(isHoliday('2023-01-01')); // true
```

### `isInLieu` 检查某个日期是否为调休日（in lieu day）

在中国的节假日安排中，调休日是为了连休假期或补班而调整的工作日或休息日。例如，当某个法定假日与周末相连时，可能会将某个周末调整为工作日，或者将某个工作日调整为休息日，以便连休更多天。

```js
// 检查 2024-05-02 返回 `true` 则表示是一个调休日。
console.log(isInLieu('2024-05-02')); // true

// 检查 2024-05-01 返回 `false` 则表示不是一个调休日。
console.log(isInLieu('2024-05-01')); // false
```


### `getDayDetail` 检查指定日期是否是工作日

函数用于检查指定日期是否是工作日，并返回一个是否工作日的布尔值和日期的详情。

1. 如果指定日期是工作日，则返回 true 和工作日名称，如果是被调休的工作日，返回 true 和节假日详情。
2. 如果是节假日，则返回 false 和节假日详情。

```js
// 示例用法

// 正常工作日 周五
console.log(getDayDetail('2024-02-02')); // { "date": "2024-02-02", "work":true,"name":"Friday"}
// 节假日 周末
console.log(getDayDetail('2024-02-03')); // { "date": "2024-02-03", "work":false,"name":"Saturday"}
// 调休需要上班
console.log(getDayDetail('2024-02-04')); // { "date": "2024-02-04", "work":true,"name":"Spring Festival,春节,3"}
// 节假日 春节
console.log(getDayDetail('2024-02-17')); // { "date": "2024-02-17", "work":false,"name":"Spring Festival,春节,3"}
```

### `getHolidaysInRange` 获取指定日期范围内的所有节假日

接收起始日期和结束日期，并可选地决定是否包括周末。如果包括周末，则函数会返回包括周末在内的所有节假日；否则，只返回工作日的节假日。

> tip: 即使不包括周末，周末的节假日仍然会被返回

```js
// 示例用法
const start = '2024-04-26';
const end = '2024-05-06';

// 获取从 2024-05-01 到 2024-05-10 的所有节假日，包括周末
const holidaysIncludingWeekends = getHolidaysInRange(start, end, true);
console.log('Holidays including weekends:', holidaysIncludingWeekends.map(d => getDayDetail(d)));

// 获取从 2024-05-01 到 2024-05-10 的节假日，不包括周末
const holidaysExcludingWeekends = getHolidaysInRange(start, end, false);
console.log('Holidays excluding weekends:', holidaysExcludingWeekends.map(d => getDayDetail(d)));
```


### `getWorkdaysInRange` 取指定日期范围内的工作日列表

接收起始日期和结束日期，并可选地决定是否包括周末。如果包括周末，则函数会返回包括周末在内的所有工作日；否则，只返回周一到周五的工作日。

```js
// 示例用法
const start = '2024-04-26';
const end = '2024-05-06';

// 获取从 2024-05-01 到 2024-05-10 的所有工作日，包括周末
const workdaysIncludingWeekends = getWorkdaysInRange(start, end, true);
console.log('Workdays including weekends:', workdaysIncludingWeekends);

// 获取从 2024-05-01 到 2024-05-10 的工作日，不包括周末
const workdaysExcludingWeekends = getWorkdaysInRange(start, end, false);
console.log('Workdays excluding weekends:', workdaysExcludingWeekends);
```

### `findWorkday` 查找工作日

查找从今天开始 未来的第 {deltaDays} 个工作日。

```js
// 查找从今天开始 未来的第 {deltaDays} 个工作日
// 如果 deltaDays 为 0，首先检查当前日期是否为工作日。如果是，则直接返回当前日期。
// 如果当前日期不是工作日，会查找下一个工作日。
const currentWorkday = findWorkday(0);
console.log(currentWorkday);

// 查找从今天开始未来的第一个工作日
const nextWorkday = findWorkday(1);
console.log(nextWorkday);

// 查找从今天开始之前的前一个工作日
const previousWorkday = findWorkday(-1);
console.log(previousWorkday);

// 可以传第二个参数 查找具体日期的上下工作日
// 查找从 2024-05-18 开始，未来的第二个工作日
const secondNextWorkday = findWorkday(2, '2024-05-18');
console.log(secondNextWorkday);
```

## 节气模块

### 获取 24 节气的日期

```js
import { getSolarTerms } from "chinese-days";

/** 获取范围内 节气日期数组 */
const solarTerms = getSolarTerms("2024-05-01", "2024-05-20");
solarTerms.forEach(({ date, term, name }) => {
  console.log(`${name}: ${date}, ${term}`);
});
// 立夏: 2024-05-05, the_beginning_of_summer
// 小满: 2024-05-20, lesser_fullness_of_grain

// 没有节气 返回 []
getSolarTerms("2024-05-21", "2024-05-25");
// return []

/* 不传 end 参数， 获取某天 节气 */
getSolarTerms("2024-05-20");
// return: [{date: '2024-05-20', term: 'lesser_fullness_of_grain', name: '小满'}]
```

## 阳历农历互转

特别说明，此库中：
1. `2057-09-28` 为：农历丁丑(牛)年八月三十；
2. `2097-08-07` 为：农历丁巳(蛇)年七月初一。

### 阳历转换农历

```js
// 2097-8-7
console.log(getLunarDate('2097-08-07'))

// 2057-9-28
console.log(getLunarDate('2057-09-28'))
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

// 非闰月 和 闰月例子
console.log(getLunarDate('2001-04-27'))
console.log(getLunarDate('2001-05-27'))
```

### 根据阳历日期区间，批量获取农历日期

```js
console.log(getLunarDatesInRange('2001-05-21', '2001-05-26'))
```

### 农历转换阳历

当为阴历闰月的时候，会出现一个农历日期对应两个阳历日期的情况，所以返回对象形式。

```js
console.log(getSolarDateFromLunar('2001-03-05'))
// {date: '2001-03-29', leapMonthDate: undefined}

console.log(getSolarDateFromLunar('2001-04-05'))
// {date: '2001-04-27', leapMonthDate: '2001-05-27'}
```

## 贡献代码

1. Fork + Clone 项目到本地；
2. 节假日: 修改 [节假日定义](src/holidays/generate.ts)；
3. 农历定义: 修改 [农历定义](src/solar_lunar/constants.ts)；
4. 其他修改需要自己查看源码；
5. 提交PR。

## 致谢

1. 农历数据来自于 [Bigkoo/Android-PickerView](https://github.com/Bigkoo/Android-PickerView) 项目。
2. 中国节假日数据生成参考了 `Python` 版本的 [LKI/chinese-calendar](https://github.com/LKI/chinese-calendar) 项目。
