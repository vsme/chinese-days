import axios from 'axios';
import { fetchHoliday } from '../../scripts/fetch';

jest.mock('axios');
const get = axios.get as jest.Mock;
const url = 'https://www.gov.cn/zhengce/notice.htm';
const search = (list: unknown[], totalpage = 1) => ({
  data: { code: 200, searchVO: { listVO: list, totalpage } },
});

beforeEach(() => {
  jest.clearAllMocks();
});

it('keeps all official sources, deduplicates URLs and extracts paragraphs', async () => {
  get.mockResolvedValueOnce(
    search(
      [
        { title: '2026年部分节假日安排', url },
        { title: '2026年假期通知', url },
      ],
      2
    )
  );
  get.mockResolvedValueOnce(
    search(
      [
        { title: '2025年假期通知', url },
        { title: '2026年假期调整', url: `${url}?amendment=1` },
      ],
      2
    )
  );
  get.mockResolvedValue({
    data: '<div id="UCAP-CONTENT"><p>2026年假期通知</p><p>1月1日至3日放假。</p><script>untrusted()</script></div>',
  });
  const sources = await fetchHoliday(2026);
  expect(sources).toHaveLength(2);
  expect(sources[0].text).toContain('1月1日至3日放假。');
  expect(sources[0].text).not.toContain('untrusted');
  expect(get).toHaveBeenCalledTimes(4);
});

it('treats the verified 1001 no-result response as an empty result', async () => {
  get.mockResolvedValueOnce({
    data: { code: 1001, msg: '抱歉，没有找到相关结果', searchVO: null },
  });
  await expect(fetchHoliday(2027)).resolves.toEqual([]);
});

it('does not hide API errors as no-announcement results', async () => {
  get.mockResolvedValueOnce({
    data: { code: 1001, msg: '访问受限', searchVO: null },
  });
  await expect(fetchHoliday(2027)).rejects.toThrow(
    'Unexpected government search response'
  );
  get.mockResolvedValueOnce(search([], 100000));
  await expect(fetchHoliday(2027)).rejects.toThrow('page count');
});

it('fails on a missing later page instead of using a partial annual notice set', async () => {
  get.mockResolvedValueOnce(search([{ title: '2026年假期通知', url }], 2));
  get.mockResolvedValueOnce({
    data: { code: 1001, msg: '抱歉，没有找到相关结果', searchVO: null },
  });
  await expect(fetchHoliday(2026)).rejects.toThrow(
    'Unexpected government search response'
  );
});

it('rejects non-official search URLs and missing/empty article bodies', async () => {
  get.mockResolvedValueOnce(
    search([{ title: '2026年假期通知', url: 'https://example.com/notice' }])
  );
  await expect(fetchHoliday(2026)).rejects.toThrow('gov.cn');
  get.mockResolvedValueOnce(search([{ title: '2026年假期通知', url }]));
  get.mockResolvedValueOnce({ data: '<html>error</html>' });
  await expect(fetchHoliday(2026)).rejects.toThrow('Cannot find notice body');
  get.mockResolvedValueOnce(search([{ title: '2026年假期通知', url }]));
  get.mockResolvedValueOnce({ data: '<div id="UCAP-CONTENT"></div>' });
  await expect(fetchHoliday(2026)).rejects.toThrow('Empty notice');
});
