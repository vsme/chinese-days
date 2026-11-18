# 农历转换阳历

公历 1900 年 1 月 1 日至 30 日对应农历 1899 年腊月初一至三十，1 月 31 日是农历 1900 年正月初一。 例如，`getSolarDateFromLunar('1899-12-30').date` 返回 `1900-01-30`。

当为阴历闰月的时候，会出现一个农历日期对应两个阳历日期的情况，所以返回对象形式。

建议用 `1901-02-30` 这样的字符串传入农历年月日。直接读取 `date` 即可获得公历日期。普通月和闰月都有效时优先返回普通月；只有闰月有效时，`date` 返回闰月日期，`isLeap` 为 `true`。`leapMonthDate` 始终单独提供有效的闰月候选。两者都无效时，两个日期字段均为 `undefined`，`isLeap` 为 `false`。

```js
console.log(getSolarDateFromLunar('2001-03-05'));
// {date: '2001-03-29', isLeap: false, leapMonthDate: undefined}

console.log(getSolarDateFromLunar('2001-04-05'));
// {date: '2001-04-27', isLeap: false, leapMonthDate: '2001-05-27'}

console.log(getSolarDateFromLunar('1906-04-30'));
// {date: '1906-06-21', isLeap: true, leapMonthDate: '1906-06-21'}
```