# 两份历表的全量核对

在仓库根目录安装项目依赖后运行：

```sh
npm run check:calendars
```

命令在北京时间口径下直接加载 `src` 和仓库中的参考数据，可离线运行。发现不匹配就以非零状态退出，并报告历表、日期和核对项。

| 历表 | 公历范围 | 逐日记录 | 节气起始日 |
| --- | --- | ---: | ---: |
| 紫金山天文台正文 | 1900–2025 | 46,021 | 3,024 |
| 香港天文台 | 1901–2100 | 73,049 | 4,800 |

- **公历转农历**：逐日检查农历年、月、日和闰月标记。
- **农历转公历**：从原表逐日记录独立构造反查结果，分别核对普通月和闰月候选。完整农历年还检查小月三十等无效候选；首尾跨界的农历年只比较原表覆盖范围。
- **节气**：检查全年 24 个交节日、每天所属节气和从 1 开始的日序。两份原表的前 5 天均属于上一年冬至，日序缺乏起点，只检查节气名称。

### 港表已知差异

[hko-differences.json](hko-differences.json) 单独列出 6 项，每项记录节气名、港表日期和紫金山正文日期。脚本先验证两份原表都包含清单所列的对应记录，再按紫金山日期计算期望结果。两个日期及其间受影响的每日节气结果均参与核对。当前这 6 项共影响港表的 93 个每日结果。原表一旦修订，过时的清单条目也会使核对失败。

### 从官方原表重建参考数据

`reference/` 中每行依次为公历日、农历日期和节气，空字段用 `-` 表示。农历保存每个公历年首日和每个农历初一，`L` 表示闰月。相邻记录间的农历日逐日递增。两份基准均由官方资料提取，各自保留原表日期。[紫金山天文台《1900—2025年日历》](https://www.pmo.cas.cn/xwdt2019/kpdt2019/202203/P020250414456381274062.pdf) · [香港天文台公历与农历对照表](https://www.hko.gov.hk/en/gts/time/conversion.htm)

需要刷新基准时，在仓库根目录准备 PDF 和香港天文台的 200 份英文年度文本。已有原文件可直接传给提取脚本。以下为首次下载并重建的示例：

```sh
mkdir -p cache/calendar-audit/hko
curl --fail --location --retry 2 -o cache/calendar-audit/pmo.pdf \
  'https://www.pmo.cas.cn/xwdt2019/kpdt2019/202203/P020250414456381274062.pdf'
curl --fail --location --retry 2 -o 'cache/calendar-audit/hko/#1.txt' \
  'https://www.hko.gov.hk/en/gts/time/calendar/text/files/T[1901-2100]e.txt'

python3 -m venv cache/calendar-audit/venv
cache/calendar-audit/venv/bin/python -m pip install pypdfium2==5.13.0
cache/calendar-audit/venv/bin/python scripts/calendar-audit/extract.py \
  cache/calendar-audit/pmo.pdf cache/calendar-audit/hko
git diff -- scripts/calendar-audit/reference
npm run check:calendars
```

提取脚本读取紫金山 PDF 正文的节气表，从港表中连续出现的同名月首识别闰月，并校验原表日期、星期、月界和每年 24 个节气的顺序。复核参考数据的变化后，再决定是否更新已知差异清单。
