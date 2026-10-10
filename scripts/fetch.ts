import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  check,
  officialUrl,
  validateSources,
  validateYear,
  type Source,
} from './holidays/update';

async function get(url: string, params?: Record<string, string | number>) {
  officialUrl(url);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await axios.get(url, {
        params,
        timeout: 30_000,
        maxContentLength: 2_000_000,
        maxRedirects: 5,
        beforeRedirect: options => {
          officialUrl(
            `${options.protocol}//${options.hostname}${options.path}`
          );
        },
      });
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      if (
        attempt === 2 ||
        !axios.isAxiosError(error) ||
        (status !== undefined && status !== 429 && status < 500)
      ) {
        throw new Error(
          `Notice request failed: ${url} (${status ?? 'network/redirect error'})`
        );
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }
  throw new Error('Notice request failed');
}

export async function fetchHoliday(year: number): Promise<Source[]> {
  validateYear(year);
  const urls = new Set<string>();
  let pageCount = 1;
  for (let page = 0; page < pageCount; page++) {
    const response = await get('https://sousuo.www.gov.cn/search-gov/data', {
      t: 'zhengcelibrary_gw',
      p: page,
      n: 5,
      q: `假期 ${year}`,
      pcodeJiguan: '国办发明电',
      puborg: '国务院办公厅',
      filetype: '通知',
      sort: 'pubtime',
    });
    const data = response.data;
    // Verified no-result response from the official endpoint. Do not conflate
    // other 1001/error responses, or disappearing later pages, with no notices.
    if (
      page === 0 &&
      data?.code === 1001 &&
      data.searchVO === null &&
      data.msg === '抱歉，没有找到相关结果'
    )
      return [];
    // Unknown response codes are failures, never silently treated as "no announcement".
    check(
      data?.code === 200 && Array.isArray(data.searchVO?.listVO),
      'Unexpected government search response'
    );
    pageCount = Number(data.searchVO.totalpage);
    check(
      Number.isInteger(pageCount) && pageCount >= 0 && pageCount <= 20,
      'Unexpected search page count'
    );
    for (const item of data.searchVO.listVO) {
      check(typeof item.title === 'string', 'Missing search title');
      if (
        item.title.includes(String(year)) &&
        /节假日|放假|假期/.test(item.title)
      )
        urls.add(officialUrl(item.url));
    }
  }
  const sources: Source[] = [];
  for (const url of urls) {
    const response = await get(url);
    const $ = cheerio.load(response.data);
    const container = $('#UCAP-CONTENT');
    check(container.length > 0, `Cannot find notice body: ${url}`);
    container.find('script, style').remove();
    const text = container.text().trim();
    check(text, `Empty notice: ${url}`);
    sources.push({ url, text });
  }
  return sources.length ? validateSources(sources) : [];
}

async function main() {
  const args = parseArgs({ allowPositionals: true });
  check(args.positionals.length === 1, 'Usage: npm run fetch -- YEAR');
  const year = Number(args.positionals[0]);
  const sources = await fetchHoliday(year);
  const file = path.join(process.cwd(), `cache/holiday-notices-${year}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ year, sources }, null, 2) + '\n');
  console.log(
    sources.length
      ? `Fetched ${sources.length} official notices for ${year}.`
      : `No notices found for ${year}.`
  );
  if (process.env.GITHUB_OUTPUT)
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `found=${sources.length > 0}\nsources=${file}\n`
    );
}
if (require.main === module)
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
