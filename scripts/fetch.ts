import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ArgumentParser } from 'argparse';

const getPaperUrls = async (year: number): Promise<string[]> => {
  let hasNextPage = true;
  let pageIndex = 0;
  const ret: string[] = [];

  while (hasNextPage) {
    const response = await axios.get(
      'https://sousuo.www.gov.cn/search-gov/data',
      {
        params: {
          // 不区分发布机构  `?t=zhengcelibrary_gw_bm_gb`
          // 分发布机构国务  `?t=zhengcelibrary_gw`   即 gw - 国务
          // 国务院部门文件  `?t=zhengcelibrary_bm`   即 bm - 部门
          // 国务院公报文件  `?t=zhengcelibrary_gb`   即 gb - 公报
          t: 'zhengcelibrary_gw',
          p: pageIndex,
          n: 5,
          q: `假期 ${year}`,
          pcodeJiguan: '国办发明电',
          puborg: '国务院办公厅',
          filetype: '通知',
          sort: 'pubtime',
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    const data = response.data;
    if (data.code === 1001) {
      return [];
    }

    if (data.code !== 200) {
      throw new Error(`Error: ${data.code}: ${data.msg}`);
    }

    for (const item of data.searchVO.listVO) {
      if (item.title.includes(year.toString())) {
        ret.unshift(item.url);
      }
    }

    pageIndex += 1;
    hasNextPage = pageIndex < data.searchVO.totalpage;
  }

  return ret;
};

const getPaper = async (url: string): Promise<string> => {
  const response = await axios.get(url);
  if (response.status !== 200) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  const $ = cheerio.load(response.data);
  const container = $('#UCAP-CONTENT');
  if (!container.length) {
    throw new Error(`Cannot get paper container from url: ${url}`);
  }

  const paragraphs = container.html()?.replace(/<br\/>/g, '</p><p>');
  const p = cheerio.load(paragraphs || '')('p');
  const ret = p
    .map((_, el) => $(el).text().trim())
    .get()
    .join('\n');

  if (!ret) {
    throw new Error(`Cannot get paper content from url: ${url}`);
  }

  return ret;
};

const fetchHoliday = async (
  year: number
): Promise<{ content: string; url?: string }> => {
  const paperUrls = await getPaperUrls(year);
  const papers: string[] = [];

  for (const url of paperUrls) {
    const paper = await getPaper(url);
    papers.push(paper);
  }

  return {
    content: papers.join('\n'),
    url: paperUrls.length > 0 ? paperUrls[0] : undefined,
  };
};

const main = async () => {
  const parser = new ArgumentParser();
  parser.addArgument('year', { type: 'int' });
  const args = parser.parseArgs();
  const year = args.year;
  console.log(`Fetching holiday for ${year}...`);

  const result = await fetchHoliday(year);

  if (result.content && result.content.length > 0) {
    console.log(result.content);
    const htmlContent = result.content
      .split('\n')
      .map(line => `<p>${line}</p>`)
      .join('');
    const outputPath = process.env.GITHUB_OUTPUT;
    const holidaysFile = path.join(process.cwd(), 'holidays.html');
    fs.writeFileSync(holidaysFile, htmlContent);
    if (outputPath) {
      fs.appendFileSync(outputPath, `holidays=${holidaysFile}\n`);
      if (result.url) {
        fs.appendFileSync(outputPath, `holiday_url=${result.url}\n`);
      }
    }
  } else {
    console.log('No holidays found.');
  }
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
