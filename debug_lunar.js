const chineseDays = require("./dist/index.min.js");
const { getLunarDate, getYearLeapMonth } = chineseDays;

console.log("Lunar for 2028-05-26:", JSON.stringify(getLunarDate("2028-05-26")));

const START = 1900;
const END   = 2100;

const yearsWith30DayLeap = [];

for (let year = START; year <= END; year++) {
  const { leapMonth, days } = getYearLeapMonth(year);
  if (leapMonth && days === 30) {
    yearsWith30DayLeap.push(year);
  }
}

console.log('闰月为30天的年份：', yearsWith30DayLeap);