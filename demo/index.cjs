const chinaDays = require('../dist/index.js')

const onlyHolidays = chinaDays.getHolidays("2024-01-01", "2024-12-31", false)
console.log('Holidays do not include weekends:', onlyHolidays.map(d => chinaDays.getDayDetail(d)));
