import chinaDays from "../src";

const holidays = chinaDays.getHolidays("2024-01-01", "2024-12-31", false)
console.log('Holidays including weekends:', holidays.map(d => chinaDays.getDayDetail(d)));