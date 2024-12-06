# 工作日

## `isWorkday` 检查某个日期是否为工作日

```js
console.log(isWorkday('2023-01-01')); // false
```

## `getWorkdaysInRange` 取指定日期范围内的工作日列表

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

## `findWorkday` 查找工作日

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

## `getDayDetail` 获取日期信息

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