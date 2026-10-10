# 贡献代码

1. Fork + Clone 项目到本地；
2. 节假日: 修改 [节假日定义](https://github.com/vsme/chinese-days/blob/main/src/holidays/generate.ts)；
3. 农历定义: 修改 [农历定义](https://github.com/vsme/chinese-days/blob/main/src/solar_lunar/constants.ts)；
4. 其他修改...；
5. 提交PR。

## 自动生成新年份

年份配置继续使用 `arrangement.y(...)` 和 `.r()`、`.w()`、`.i()`，每个节日一行。

自动化只追加已收录最大年份的下一年；已有年份直接跳过，不抓取公告、不调用 AI、不修改日期或记录。底层生成器也禁止覆盖历史年份。

### AI 判断调休，程序校验

AI 根据官方公告提取放假区间、补班日、原文证据，并生成 `inLieu` 日期和判断理由 `basis`。程序校验通过后直接生成新年份配置和普通 PR，**不需要人工填写规则或逐项确认调休日期**。

标准天数统一复用 `src/holidays/arrangement.ts` 中已有的 `holidayDays`，由 `Arrangement.getHolidayDays(year, holiday)` 按年份读取，自动化不再维护另一份天数表。`scripts/holidays/policy.ts` 只负责将节日对应到具体法定日期：春节、端午、中秋使用项目的农历转换，清明使用节气计算，并区分春节从初一还是除夕开始。法定日期区间长度同样使用上述天数定义。

历史回归测试也支持 2024 年，按当时的[旧版办法](https://xzfg.moj.gov.cn/mobile/law/detail?LawID=6)使用春节 3 天（初一至初三）、劳动节 1 天；测试在临时副本中进行，正式流程仍然只追加新年份。

`.i()` 不包含正常周末、法定假日，以及法定假日遇周末或节日重叠产生的补假。合并假期的放假日期去重，但各节日的法定天数分别累加，避免中秋与国庆重叠时少计算一天假期权益。

**项目分类约定：** 公告没有逐日说明补假与调休的归属时，将假期内按日期排序的非周末、非法定假日日期优先用于补假，剩余日期记为 `.i()`。这是保证结果稳定的项目约定，不代表官方逐日认定。该规则与现有 2025、2026 年数据做了回归核对。

自动校验包含：

- 日期真实、属于目标年份，全年节日完整，原文摘录存在于来源公告。
- 法定假日包含在放假区间，放假与补班不冲突。
- `.i()` 位于放假区间，且不是周末、法定假日或补班日。
- 调休数量及具体日期符合标准天数、周末补假与合并假期的计算规则。
- 插入新年份后，所有已有年份的注释及代码保持不变。

校验不通过会将错误反馈给 AI，最多生成 3 轮。仍失败则退出报错且不写入新年份，不生成等待人工填写的半成品。网络错误、限流及服务端错误另有最多 3 次请求尝试。规则文件是公共政策配置，不是每年需要填写的人工清单；以后法规变化时需相应更新代码中的政策定义。

### 本地运行

```sh
npm ci
npm run auto-update -- --check-year
# 以下以 2027 年为例，在公告发布后运行：
npm run fetch -- 2027
npm run auto-update -- 2027 --source-file cache/holiday-notices-2027.json
```

调用 AI 需要 `AI_API_KEY`，可通过 `AI_API_URL`、`AI_MODEL` 覆盖服务与模型。服务需支持 Chat Completions 的严格 JSON Schema 输出及 `max_completion_tokens`。拒绝或截断的结果不会写入。

新年份尚未入库、公告与政策均未变时，会复用并重新校验已有提案的 AI 结果。也可用 `--input extraction.json` 离线验证包含 `inLieu` 和 `basis` 的 JSON，此模式不调用 AI 修复输入。完整格式见 `scripts/auto-update-holidays.ts` 的 `extractionSchema`。旧版不含调休判断的缓存会失效并重新提取。

生成记录保存在 `data/holiday-reviews/年份.json`，PR 正文展示来源、AI 判断理由及逐日表，仅用于追溯，没有额外的调休人工确认步骤。自动化仅处理新增年份内的日期，跨年公告不回写历史年份。

```sh
npm run check:scripts
npm run lint:check
npm test -- --runInBand
npm run build
```

### GitHub Actions

默认处理已收录最大年份加一（当前为 2027）；`workflow_dispatch` 的 `year` 优先于仓库变量 `HOLIDAYS_YEAR`。指定已有年份则跳过，跳过中间年份则报错。推荐清空 `HOLIDAYS_YEAR` 以自动跟随最新收录年份。

工作流串行执行，在类型检查、lint、测试和构建通过后创建或更新普通 PR；邮件仅在 PR 实际变化时发送并包含链接。保留仓库原有的 PR 合并流程，没有开启自动合并。创建 PR 的令牌需要相应权限；使用默认 `GITHUB_TOKEN` 时，仓库设置也需允许 Actions 创建 PR。

### 在 CI 回归测试已有年份

`AI Holiday Regression` 工作流会抓取指定年份的公告，在临时副本中调用真实 AI 重新生成，再与已收录的放假、补班、调休日期逐项比较。出现任何差异都会失败，并上传报告；不会修改仓库数据、创建 PR 或发送邮件。

在 Actions 中手动运行该工作流，可选择 2026、2025 或 2024。向 `main` 推送自动化相关修改时，也可在最后一条提交消息中加入 `[ai-regression]`，显式触发一次 2026 年真实 API 回归；普通推送只运行离线测试。需要仓库已有的 `AI_API_KEY`、`AI_API_URL`、`AI_MODEL` Secrets。

本地可通过环境变量运行 `npm run test:ai -- 2026`。使用根目录 `.env` 时，Node.js 22 可直接加载：

```sh
node --env-file=.env -r ts-node/register scripts/test-ai-holidays.ts 2026
```

### 测试真实 PR 和邮件通知

`Send Email on Holidays Update` 提供显式的 `test_mode` 输入。手动启用时，`year` 指定已有年份（默认 2026）：先抓取公告并执行真实 AI 回归，再使用与正式流程相同的令牌、创建 PR Action 和 SMTP 配置，创建带 `[TEST]` 标记的草稿 PR 并发送测试邮件。

测试仅在 `data/holiday-e2e/运行编号.json` 中新增测试记录，不修改正式日历。测试 PR 请勿合并，验证完成后关闭。定时运行不会启用测试模式；推送相关测试脚本或本工作流时，可在最后一条提交消息加入 `[holiday-e2e]` 显式触发一次端到端测试。
