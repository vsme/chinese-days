# Quick Start

This documentation is primarily intended for users developing in `JS` and `TS`.

::: info Note
For other programming languages, please refer to the section on [Non-JS Languages](/en/guide/what-is-chinese-days.html#non-js-languages).

Additionally, the project supports `iCal` file [holiday subscriptions](/en/guide/ical-subscription), compatible with clients such as Google Calendar, Apple Calendar, and Microsoft Outlook.
:::

## Recommended Usage

Directly include the library in the browser for the most up-to-date version:

```html
<!-- Include the script -->
<script src="https://cdn.jsdelivr.net/npm/chinese-days"></script>

<!-- Use the library -->
<script>
  chineseDays.isHoliday('2024-01-01');
  // Or use destructuring
  const { isHoliday } = chineseDays;
</script>
```

Alternatively, use `type="module"` with ESM:

```html
<script type="module">
  import chineseDays from 'https://esm.run/chinese-days';
  // Use the library after importing
  chineseDays.isHoliday('2024-01-01');
</script>
```

## Installation

```sh
npm i chinese-days
```

Using ESM import:

```ts
import chineseDays from 'chinese-days';
console.log(chineseDays);
```

Using in Node.js:

```js
const { isWorkday, isHoliday } = require('chinese-days');
console.log(isWorkday('2020-01-01'));
console.log(isHoliday('2020-01-01'));
```

## Specifying a Version

It is generally not recommended to specify a version, as holidays are updated based on announcements from the State Council. If you must specify a version, you can refer to [jsdelivr](https://www.jsdelivr.com/), for example:

```
https://cdn.jsdelivr.net/npm/chinese-days@1.4.0
```

```
https://esm.run/chinese-days@1.4.0
```