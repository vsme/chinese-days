import fs from "fs";
import generate from '../src/holidays/generate';

// 保存到 ./dist/chinese-days.json 文件
fs.writeFile("./dist/chinese-days.json", JSON.stringify(generate()), (err) => {
  if (err) throw err;
  console.log("The json file has been saved!");
});
