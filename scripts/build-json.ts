import fs from 'fs';
import generate from '../src/holidays/generate';

// 确保 dist 和 dist/years 目录存在
fs.mkdirSync('./dist', { recursive: true });
fs.mkdirSync('./dist/years', { recursive: true });

// 生成总数据
const all = generate();

// 保存到 ./dist/chinese-days.json 文件（总文件）
fs.writeFileSync('./dist/chinese-days.json', JSON.stringify(all));
console.log('The JSON file has been saved to ./dist/chinese-days.json!');

// 提取包含的年份（按降序）
const getYearsFromData = (...maps: Array<Record<string, string>>): number[] => {
  const years = new Set<number>();
  for (const map of maps) {
    Object.keys(map).forEach(date => {
      const y = Number(date.slice(0, 4));
      if (!Number.isNaN(y)) years.add(y);
    });
  }
  return Array.from(years).sort((a, b) => b - a);
};

const years = getYearsFromData(all.holidays, all.workdays, all.inLieuDays);

// 按年份分别生成文件
for (const year of years) {
  const filterByYear = (obj: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(obj).filter(([date]) => date.startsWith(`${year}-`))
    );

  const yearData = {
    holidays: filterByYear(all.holidays),
    workdays: filterByYear(all.workdays),
    inLieuDays: filterByYear(all.inLieuDays),
  };

  const file = `./dist/years/${year}.json`;
  fs.writeFileSync(file, JSON.stringify(yearData));
  console.log(`The JSON file for ${year} has been saved!`);
}
