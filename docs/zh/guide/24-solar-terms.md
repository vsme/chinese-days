# 节气模块

中国的二十四节气是传统的农业历法，它们标志着一年中不同的**时间段**。每个节气通常有特定的（开始）日期，但这个日期并不代表整个节气的持续时间。事实上，每个节气大约持续15天。

以“小满”为例，它的日期通常在公历5月20日左右开始，但并不止于这一天，而是持续到下一个节气开始。具体来说，小满大约持续到6月5日（芒种）前后。因此，“小满”节气的时间段是从5月20日左右到6月5日左右。

## 获取 24 节气的日期

### 获取范围内节气日期数组

```js
import { getSolarTermsInRange } from "chinese-days";

// 不传，查询当天
console.log(getSolarTermsInRange())
// [{date: '2024-05-29', term: 'lesser_fullness_of_grain', name: '小满', index: 10}]
// index: 代表处于当前节气的第几天，从 1 开始

// 不传end，查询指定日期
console.log(getSolarTermsInRange('2024-05-01'))
// [{date: '2024-05-01', term: 'grain_rain', name: '谷雨', index: 13}]

// 查询范围内的节气
console.log(getSolarTermsInRange('2024-05-01', '2024-05-06'))
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
 **/
```

### 如果你仅想获取节气**开始日期**数组

```js
import { getSolarTerms } from "chinese-days";

/** 获取范围内 节气的开始日期数组 */
const solarTerms = getSolarTerms("2024-05-01", "2024-05-20");
solarTerms.forEach(({ date, term, name }) => {
  console.log(`${name}: ${date}, ${term}`);
});
// 立夏: 2024-05-05, the_beginning_of_summer
// 小满: 2024-05-20, lesser_fullness_of_grain

// 没有节气 返回 []
getSolarTerms("2024-05-21", "2024-05-25");
// return []

/* 不传 end 参数， 获取某天 节气 */
getSolarTerms("2024-05-20");
// return: [{date: '2024-05-20', term: 'lesser_fullness_of_grain', name: '小满'}]
```