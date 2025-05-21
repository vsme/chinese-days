# 快速开始

本文档内容主要针对 `JS` 和 `TS` 开发用户。

::: info 提示
使用其他语言开发，请参考 [非 JS/TS 语言](/guide/what-is-chinese-days#非-js-语言) 部分内容。
:::

::: info 订阅
此外还支持 `iCal` 文件 [订阅节假日](/guide/ical-subscription)，可供 Google Calendar、Apple Calendar、Microsoft Outlook 等客户端订阅。
:::

## 推荐方式

直接浏览器引入，更新较为及时：

```html
<!-- 引入 -->
<script src="https://cdn.jsdelivr.net/npm/chinese-days"></script>

<!-- 使用 -->
<script>
  chineseDays.isHoliday('2024-01-01');
  // 或者解构使用
  const { isHoliday } = chineseDays;
</script>
```

或者指定 `type="module"`，使用 ESM：

```html
<script type="module">
  import chineseDays from 'https://esm.run/chinese-days'
  // 导入后使用
  chineseDays.isHoliday('2024-01-01')
</script>
```

## 安装方式

```sh
npm i chinese-days
```

使用 ESM 导入

```ts
import chineseDays from 'chinese-days';
console.log(chineseDays);
```

在 Node 中使用

```js
const { isWorkday, isHoliday } = require('chinese-days');
console.log(isWorkday('2020-01-01'));
console.log(isHoliday('2020-01-01'));
```

## 指定版本

一般不建议指定版本使用，因为节假日会随国务院发布进行更新；如一定要指定版本，具体使用方式可以参考 [jsdelivr](https://www.jsdelivr.com/)，比如：

```
https://cdn.jsdelivr.net/npm/chinese-days@1.4.0
```

```
https://esm.run/chinese-days@1.4.0
```