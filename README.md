# 中国节假日

![GitHub License](https://img.shields.io/github/license/vsme/china-days)


本项目提供了一系列用于管理和查询中国节假日、调休日、工作日及二十四节气的函数。通过使用这些函数，用户可以方便地检查指定日期的状态，获取日期范围内的节假日或工作日，并查找特定的工作日。此外，项目还支持查询二十四节气的日期，帮助用户了解中国传统节气的时间安排。

支持 2004年 至 2024年，包括 2020年 的春节延长。

## 快速开始

直接浏览器引入

```html
<script src="https://cdn.jsdelivr.net/npm/china-days/dist/index.min.js"></script>
```

安装

```sh
npm i china-days
```

使用 ESM 导入

```ts
import chinaDays from 'china-days'
console.log(chinaDays)
```

在 Node 中使用

```js
const { isWorkday, isHoliday } = require('china-days');
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

### `getHolidays` 获取指定日期范围内的所有节假日

接收起始日期和结束日期，并可选地决定是否包括周末。如果包括周末，则函数会返回包括周末在内的所有节假日；否则，只返回工作日的节假日。

> tip: 即使不包括周末，周末的节假日仍然会被返回

```js
// 示例用法
const start = '2024-04-26';
const end = '2024-05-06';

// 获取从 2024-05-01 到 2024-05-10 的所有节假日，包括周末
const holidaysIncludingWeekends = getHolidays(start, end, true);
console.log('Holidays including weekends:', holidaysIncludingWeekends.map(d => getDayDetail(d)));

// 获取从 2024-05-01 到 2024-05-10 的节假日，不包括周末
const holidaysExcludingWeekends = getHolidays(start, end, false);
console.log('Holidays excluding weekends:', holidaysExcludingWeekends.map(d => getDayDetail(d)));
```


### `getWorkdays` 取指定日期范围内的工作日列表

接收起始日期和结束日期，并可选地决定是否包括周末。如果包括周末，则函数会返回包括周末在内的所有工作日；否则，只返回周一到周五的工作日。

```js
// 示例用法
const start = '2024-04-26';
const end = '2024-05-06';

// 获取从 2024-05-01 到 2024-05-10 的所有工作日，包括周末
const workdaysIncludingWeekends = getWorkdays(start, end, true);
console.log('Workdays including weekends:', workdaysIncludingWeekends.map(d => d.format('YYYY-MM-DD')));

// 获取从 2024-05-01 到 2024-05-10 的工作日，不包括周末
const workdaysExcludingWeekends = getWorkdays(start, end, false);
console.log('Workdays excluding weekends:', workdaysExcludingWeekends.map(d => d.format('YYYY-MM-DD')));
```

### `findWorkday` 查找工作日

查找从今天开始 未来的第 {deltaDays} 个工作日。

```js
// 查找从今天开始 未来的第 {deltaDays} 个工作日
// 如果 deltaDays 为 0，首先检查当前日期是否为工作日。如果是，则直接返回当前日期。
// 如果当前日期不是工作日，会查找下一个工作日。
const currentWorkday = findWorkday(0);
console.log(currentWorkday.format('YYYY-MM-DD'));

// 查找从今天开始未来的第一个工作日
const nextWorkday = findWorkday(1);
console.log(nextWorkday.format('YYYY-MM-DD'));

// 查找从今天开始之前的前一个工作日
const previousWorkday = findWorkday(-1);
console.log(previousWorkday.format('YYYY-MM-DD'));

// 可以传第二个参数 查找具体日期的上下工作日
// 查找从 2024-05-18 开始，未来的第二个工作日
const secondNextWorkday = findWorkday(2, '2024-05-18');
console.log(secondNextWorkday.format('YYYY-MM-DD'));
```

## 节气模块

### 获取 24 节气的日期

```js
import { getSolarTerms } from "china-days";

/** 获取范围内 节气日期数组 */
const solarTerms = getSolarTerms("2024-05-01", "2024-05-20");
solarTerms.forEach(({ date, term, name }) => {
  console.log(`${name}: ${dayjs(date).format("YYYY-MM-DD")}, ${term}`);
});

/* 获取当天 节气 */
const solarTerms = getSolarTerms("2024-05-20");
console.log(solarTerms[0]);
```

## 贡献代码

1. Fork + Clone 项目到本地
2. 修改 [节假日定义][scripts/generate.ts]
3. 执行命令 `npm run generate` 自动生成 [常量文件][src/holidays/constants.ts]
4. 提交PR

## 致谢

本项目参考了 `Python` 版本的 [LKI/chinese-calendar](https://github.com/LKI/chinese-calendar) 开源项目。
