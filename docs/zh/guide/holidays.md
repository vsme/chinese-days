# 节假日

## `isHoliday` 检查某个日期是否为节假日

```js
console.log(isHoliday('2023-01-01')); // true
```

## `getHolidaysInRange` 获取指定日期范围内的所有节假日

接收起始日期和结束日期，并可选地决定是否包括周末。如果包括周末，则函数会返回包括周末在内的所有节假日；否则，只返回工作日的节假日。

::: info 提示
即使不包括周末，周末的节假日仍然会被返回
:::

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
