import fs from "fs";
import path from "path";
import axios from "axios";
import { ArgumentParser } from "argparse";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// 大模型 API 配置
const AI_API_URL = process.env.AI_API_URL || "https://api.openai.com/v1";
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gpt-5";

interface HolidayConfig {
  year: number;
  code: string;
  comment: string;
}

/**
 * 调用大模型处理假期内容
 */
const processHolidayWithAI = async (
  holidayContent: string,
  year: number,
  url?: string
): Promise<HolidayConfig | null> => {
  if (!AI_API_KEY) {
    console.error("AI_API_KEY environment variable is not set");
    return null;
  }

  console.log(year, url);

  const prompt = `请根据以下中国政府发布的${year}年假期安排通知，生成对应的假期配置代码。

假期内容：
${holidayContent}${
    url
      ? `

政府通知原始链接：
${url}`
      : ""
  }

请参考以下格式生成代码，注释中需要包含实际的政府通知信息：

/**
 * ${year}${
    url
      ? `
 * ${url}`
      : ""
  }
 * 根据通知内容总结的假期安排详细说明
 */
arrangement.y(${year})
  .ny().r(1, 1)
  .s().r(1, 28).to(2, 4).w(1, 26).w(2, 8).i(2, 3).i(2, 4)
  .t().r(4, 4).to(4, 6)
  .l().r(5, 1).to(5, 5).w(4, 27).i(5, 5)
  .d().r(5, 31).to(6, 2)
  .n().r(10, 1).to(10, 8).w(9, 28).w(10, 11).i(10, 7).i(10, 8)
  .m().r(10, 6)

方法说明：
- .y(year): 设置年份
- .ny(): 元旦, .s(): 春节, .t(): 清明节, .l(): 劳动节, .d(): 端午节, .n(): 国庆节, .m(): 中秋节
- .r(month, day): 设置休假日期
- .to(month, day): 设置休假结束日期
- .w(month, day): 设置工作日（调休）
- .i(month, day): 设置节假日（补充说明）

请只返回注释和代码部分，不要包含其他解释文字。

格式要求：
1. 先返回完整的注释块，注释块必须严格按照以下格式：
   - 第一行：年份（如：${year}）${
    url
      ? `
   - 第二行：URL链接（${url}）`
      : ""
  }
   - 后续行：根据通知内容总结的假期安排详细说明
2. 然后返回完整的 arrangement 配置代码
3. 确保代码格式正确，缩进一致`;

  try {
    const response = await axios.post(
      AI_API_URL + "/chat/completions",
      {
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "你是一个专业的代码生成助手，专门处理中国假期配置。请严格按照要求的格式生成代码。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      const aiResponse = response.data.choices[0].message.content.trim();

      // 解析 AI 返回的内容
      const lines = aiResponse.split("\n");
      let commentLines: string[] = [];
      let codeLines: string[] = [];
      let inComment = false;
      let inCode = false;

      for (const line of lines) {
        const trimmedLine = line.trim();

        // 检测注释开始
        if (trimmedLine.startsWith("/**")) {
          inComment = true;
          commentLines.push(line);
          continue;
        }

        // 检测注释结束
        if (inComment && trimmedLine.endsWith("*/")) {
          commentLines.push(line);
          inComment = false;
          continue;
        }

        // 在注释中
        if (inComment) {
          commentLines.push(line);
          continue;
        }

        // 检测代码开始
        if (trimmedLine.startsWith(`arrangement.y(${year})`)) {
          inCode = true;
          codeLines.push(line);
          continue;
        }

        // 在代码中
        if (inCode) {
          // 如果遇到空行或下一个注释，结束代码收集
          if (trimmedLine === "" || trimmedLine.startsWith("/**")) {
            break;
          }
          codeLines.push(line);
        }
      }

      if (commentLines.length > 0 && codeLines.length > 0) {
        return {
          year,
          comment: commentLines.join("\n"),
          code: codeLines.join("\n"),
        };
      }
    }

    return null;
  } catch (error: any) {
    console.error("Error calling AI API:");
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      console.error("Request error:", error.message);
    } else {
      console.error("Error:", error.message);
    }
    return null;
  }
};

/**
 * 更新 generate.ts 文件
 */
const updateGenerateFile = async (config: HolidayConfig): Promise<boolean> => {
  const generateFilePath = path.join(
    process.cwd(),
    "src",
    "holidays",
    "generate.ts"
  );

  try {
    const content = fs.readFileSync(generateFilePath, "utf-8");
    const lines = content.split("\n");

    // 查找插入位置：在 "const arrangement = new Arrangement()" 之后
    let insertLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === "const arrangement = new Arrangement()") {
        insertLineIndex = i + 1;
        break;
      }
    }

    if (insertLineIndex === -1) {
      console.error("Could not find insertion point in generate.ts");
      return false;
    }

    // 检查是否已经存在该年份的配置
    const yearPattern = new RegExp(`\\\* ${config.year}`);
    const existingYearIndex = lines.findIndex((line) => yearPattern.test(line));

    if (existingYearIndex !== -1) {
      console.log(
        `Configuration for year ${config.year} already exists. Updating existing configuration.`
      );

      // 找到现有配置的结束位置
      let endIndex = existingYearIndex;
      let inComment = false;
      let inCode = false;

      for (let i = existingYearIndex; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith("/**")) {
          inComment = true;
        } else if (line.endsWith("*/")) {
          inComment = false;
        } else if (
          !inComment &&
          line.startsWith(`arrangement.y(${config.year})`)
        ) {
          inCode = true;
        } else if (
          inCode &&
          (line === "" ||
            line.startsWith("/**") ||
            line.startsWith("arrangement.y("))
        ) {
          endIndex = i;
          break;
        }

        if (i === lines.length - 1) {
          endIndex = i + 1;
        }
      }

      // 删除现有配置
      const commentStartIndex = lines.findIndex(
        (line, index) =>
          index >= existingYearIndex - 5 &&
          index <= existingYearIndex &&
          line.trim().startsWith("/**")
      );

      const removeStartIndex =
        commentStartIndex !== -1 ? commentStartIndex : existingYearIndex;
      lines.splice(removeStartIndex, endIndex - removeStartIndex);
      insertLineIndex = removeStartIndex;
    }

    // 准备要插入的内容
    const commentLines = config.comment
      .split("\n")
      .map((line) => (line ? `  ${line}` : line));
    const codeLines = config.code
      .split("\n")
      .map((line) => (line ? `  ${line}` : line));
    const newLines = [...commentLines, ...codeLines, ""];

    // 插入新内容
    lines.splice(insertLineIndex, 0, ...newLines);

    // 写回文件
    const updatedContent = lines.join("\n");
    fs.writeFileSync(generateFilePath, updatedContent, "utf-8");
    console.log(
      `Successfully updated generate.ts with ${config.year} holiday configuration`
    );

    return true;
  } catch (error) {
    console.error("Error updating generate.ts:", error);
    return false;
  }
};

/**
 * 主函数
 */
const main = async () => {
  const parser = new ArgumentParser();
  parser.addArgument("year", {
    type: "int",
    help: "Year to process holidays for",
  });
  parser.addArgument("--content", {
    help: "Holiday content to process (if not provided, will read from holidays.html)",
  });
  parser.addArgument("--url", { help: "Original government notice URL" });

  const args = parser.parseArgs();
  const year = args.year;
  const url = args.url;

  console.log(`Processing holidays for ${year}...`);

  // 获取假期内容
  let holidayContent = args.content;
  if (!holidayContent) {
    const holidaysFile = path.join(process.cwd(), "holidays.html");
    if (fs.existsSync(holidaysFile)) {
      holidayContent = fs.readFileSync(holidaysFile, "utf-8");
      // 移除 HTML 标签
      holidayContent = holidayContent
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
    } else {
      console.error("No holiday content provided and holidays.html not found");
      process.exit(1);
    }
  }

  if (!holidayContent || holidayContent.length === 0) {
    console.log("No holiday content to process");
    return;
  }

  // 使用 AI 处理假期内容
  const config = await processHolidayWithAI(holidayContent, year, url);

  if (!config) {
    console.error("Failed to process holiday content with AI");
    process.exit(1);
  }

  console.log("Generated holiday configuration:");
  console.log(config.comment);
  console.log(config.code);

  // 更新 generate.ts 文件
  const success = await updateGenerateFile(config);

  if (success) {
    console.log("Holiday configuration updated successfully!");

    // 设置 GitHub Actions 输出
    const outputPath = process.env.GITHUB_OUTPUT;
    if (outputPath) {
      fs.appendFileSync(outputPath, `updated=true\n`);
      fs.appendFileSync(outputPath, `year=${year}\n`);
    }
  } else {
    console.error("Failed to update holiday configuration");
    process.exit(1);
  }
};

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
