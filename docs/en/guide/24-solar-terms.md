# Solar Terms Module

China's 24 solar terms are a part of the traditional agricultural calendar, marking distinct **periods** within a year. Each solar term typically begins on a specific (start) date but represents a period lasting about 15 days until the next solar term starts.

For example, the solar term **"Lesser Fullness of Grain" (小满)** begins around **May 20th** in the Gregorian calendar. However, it doesn't end on that day; instead, it lasts until the next solar term, **"Grain in Ear" (芒种)**, which starts around **June 5th**. Therefore, the "Lesser Fullness of Grain" period is roughly from May 20th to June 5th.

---

## Retrieve Dates of the 24 Solar Terms

### Get Solar Term Dates Within a Range

```js
import { getSolarTermsInRange } from "chinese-days";

// If no arguments are passed, it returns the solar term for the current day
console.log(getSolarTermsInRange());
// [{date: '2024-05-29', term: 'lesser_fullness_of_grain', name: '小满', index: 10}]
// index: Represents the day count within the current solar term, starting from 1

// Query a specific date if only the start date is provided
console.log(getSolarTermsInRange('2024-05-01'));
// [{date: '2024-05-01', term: 'grain_rain', name: '谷雨', index: 13}]

// Query solar terms within a date range
console.log(getSolarTermsInRange('2024-05-01', '2024-05-06'));
/**
 * =>
 * [
 *   {"date":"2024-05-01","term":"grain_rain","name":"谷雨","index":13},
 *   {"date":"2024-05-02","term":"grain_rain","name":"谷雨","index":14},
 *   {"date":"2024-05-03","term":"grain_rain","name":"谷雨","index":15},
 *   {"date":"2024-05-04","term":"grain_rain","name":"谷雨","index":16},
 *   {"date":"2024-05-05","term":"the_beginning_of_summer","name":"立夏","index":1},
 *   {"date":"2024-05-06","term":"the_beginning_of_summer","name":"立夏","index":2}
 * ]
 */
```

---

### Retrieve Only the Start Dates of Solar Terms

```js
import { getSolarTerms } from "chinese-days";

/** Get the array of solar term start dates within a specified range */
const solarTerms = getSolarTerms("2024-05-01", "2024-05-20");
solarTerms.forEach(({ date, term, name }) => {
  console.log(`${name}: ${date}, ${term}`);
});
// Output:
// 立夏: 2024-05-05, the_beginning_of_summer
// 小满: 2024-05-20, lesser_fullness_of_grain

// If there are no solar terms within the range, return []
console.log(getSolarTerms("2024-05-21", "2024-05-25"));
// Output: []

// Query the solar term for a specific day if no end date is provided
console.log(getSolarTerms("2024-05-20"));
// Output: [{date: '2024-05-20', term: 'lesser_fullness_of_grain', name: '小满'}]
```