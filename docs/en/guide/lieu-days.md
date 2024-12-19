# In Lieu Days

## `isInLieu` Check if a given date is an in lieu day

In the context of China's holiday arrangements, **in lieu days** (调休日) are adjustments to regular workdays or weekends to create longer continuous holidays or make up for days off. For example, a weekend may be shifted to a workday, or a workday may become a rest day, to facilitate an extended holiday period.

### Example Usage

```js
// Check if May 2, 2024, is an in lieu day. 
// If `true`, it indicates the date is an in lieu day.
console.log(isInLieu('2024-05-02')); // true

// Check if May 1, 2024, is an in lieu day.
// If `false`, it indicates the date is not an in lieu day.
console.log(isInLieu('2024-05-01')); // false
```