# Working Days

## `isWorkday` Check if a given date is a workday

```js
console.log(isWorkday('2023-01-01')); // false
```

## `getWorkdaysInRange` Get a list of workdays within a specified date range

This function takes a start date, an end date, and an optional parameter to decide whether to include weekends. If weekends are included, the function returns all days within the range. Otherwise, it returns only weekdays (Monday to Friday).

```js
// Example usage
const start = '2024-04-26';
const end = '2024-05-06';

// Get all workdays from 2024-04-26 to 2024-05-06, including weekends
const workdaysIncludingWeekends = getWorkdaysInRange(start, end, true);
console.log('Workdays including weekends:', workdaysIncludingWeekends);

// Get workdays from 2024-04-26 to 2024-05-06, excluding weekends
const workdaysExcludingWeekends = getWorkdaysInRange(start, end, false);
console.log('Workdays excluding weekends:', workdaysExcludingWeekends);
```

## `findWorkday` Find a workday

Find the `{deltaDays}`-th workday starting from today.

```js
// Find the {deltaDays}-th workday from today
// If deltaDays is 0, first check if today is a workday. If yes, return today's date.
// If today is not a workday, find the next workday.
const currentWorkday = findWorkday(0);
console.log(currentWorkday);

// Find the next workday
const nextWorkday = findWorkday(1);
console.log(nextWorkday);

// Find the previous workday
const previousWorkday = findWorkday(-1);
console.log(previousWorkday);

// Specify a starting date to find workdays relative to it
// Find the second workday from 2024-05-18
const secondNextWorkday = findWorkday(2, '2024-05-18');
console.log(secondNextWorkday);
```

## `getDayDetail` Get detailed date information

This function checks if a specified date is a workday and returns a boolean indicating whether it is a workday, along with details about the date.

1. If the specified date is a workday, it returns `true` and the name of the weekday. If it is a rescheduled workday (due to holiday adjustments), it returns `true` and details about the holiday.
2. If it is a holiday, it returns `false` and holiday details.

```js
// Example usage

// A regular workday (Friday)
console.log(getDayDetail('2024-02-02')); 
// { "date": "2024-02-02", "work": true, "name": "Friday" }

// A holiday (weekend)
console.log(getDayDetail('2024-02-03')); 
// { "date": "2024-02-03", "work": false, "name": "Saturday" }

// A rescheduled workday
console.log(getDayDetail('2024-02-04')); 
// { "date": "2024-02-04", "work": true, "name": "Spring Festival, 春节, 3" }

// A Spring Festival holiday
console.log(getDayDetail('2024-02-17')); 
// { "date": "2024-02-17", "work": false, "name": "Spring Festival, 春节, 3" }
```