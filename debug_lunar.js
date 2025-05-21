const chineseDays = require("./dist/index.min.js");
const { getLunarDate } = chineseDays;

console.log("Lunar for 2028-05-26:", JSON.stringify(getLunarDate("2028-05-26")));
