# Lunar to Gregorian Calendar Conversion

When dealing with leap months in the Lunar Calendar, a single Lunar date may correspond to two Gregorian dates. In such cases, the function returns an object to handle both dates.

```js
console.log(getSolarDateFromLunar('2001-03-05'));
// {date: '2001-03-29', leapMonthDate: undefined}

console.log(getSolarDateFromLunar('2001-04-05'));
// {date: '2001-04-27', leapMonthDate: '2001-05-27'}
```