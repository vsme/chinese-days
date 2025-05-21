# Holidays

## `isHoliday` Check if a given date is a holiday

```js
console.log(isHoliday('2023-01-01')); // true
```

## `getHolidaysInRange` Retrieve all holidays within a specified date range

This function accepts a start date, an end date, and an optional parameter to decide whether to include weekends. If weekends are included, the function returns all holidays, including those that fall on weekends. If weekends are excluded, it only returns holidays on workdays.

::: info Note
Even if weekends are excluded, holidays that fall on weekends will still be included in the result.
:::

```js
// Example usage
const start = '2024-04-26';
const end = '2024-05-06';

// Get all holidays from 2024-04-26 to 2024-05-06, including weekends
const holidaysIncludingWeekends = getHolidaysInRange(start, end, true);
console.log(
  'Holidays including weekends:',
  holidaysIncludingWeekends.map((d) => getDayDetail(d))
);

// Get holidays from 2024-04-26 to 2024-05-06, excluding weekends
const holidaysExcludingWeekends = getHolidaysInRange(start, end, false);
console.log(
  'Holidays excluding weekends:',
  holidaysExcludingWeekends.map((d) => getDayDetail(d))
);
```