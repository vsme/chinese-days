# Lunar to Gregorian Calendar Conversion

January 1–30, 1900 corresponds to days 1–30 of the twelfth lunar month of 1899. January 31 is the first day of lunar year 1900. For example, `getSolarDateFromLunar('1899-12-30').date` returns `1900-01-30`.

When dealing with leap months in the Lunar Calendar, a single Lunar date may correspond to two Gregorian dates. In such cases, the function returns an object to handle both dates.

Pass a date string such as `1901-02-30` to preserve the lunar month and day. Read `date` for the regular-month date when available, or the leap-month date when it is the only candidate. `isLeap` is true when `date` selects the leap month. `leapMonthDate` gives the leap-month candidate whenever it exists. With no valid candidate, both dates are `undefined` and `isLeap` is false.

```js
console.log(getSolarDateFromLunar('2001-03-05'));
// {date: '2001-03-29', isLeap: false, leapMonthDate: undefined}

console.log(getSolarDateFromLunar('2001-04-05'));
// {date: '2001-04-27', isLeap: false, leapMonthDate: '2001-05-27'}

console.log(getSolarDateFromLunar('1906-04-30'));
// {date: '1906-06-21', isLeap: true, leapMonthDate: '1906-06-21'}
```