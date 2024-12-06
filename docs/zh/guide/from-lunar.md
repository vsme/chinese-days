# 农历转换阳历

当为阴历闰月的时候，会出现一个农历日期对应两个阳历日期的情况，所以返回对象形式。

```js
console.log(getSolarDateFromLunar('2001-03-05'));
// {date: '2001-03-29', leapMonthDate: undefined}

console.log(getSolarDateFromLunar('2001-04-05'));
// {date: '2001-04-27', leapMonthDate: '2001-05-27'}
```