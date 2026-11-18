"""从本地官方原表重新生成核对基准，不读取项目的日期实现。"""
import argparse
import calendar
import re
from datetime import date, timedelta
from pathlib import Path

import pypdfium2

TERMS = "小寒 大寒 立春 雨水 惊蛰 春分 清明 谷雨 立夏 小满 芒种 夏至 小暑 大暑 立秋 处暑 白露 秋分 寒露 霜降 立冬 小雪 大雪 冬至".split()
ENGLISH = ("Moderate Cold|Severe Cold|Spring Commences|Spring Showers|Insects Waken|"
           "Vernal Equinox|Bright & Clear|Corn Rain|Summer Commences|Corn Forms|"
           "Corn on Ear|Summer Solstice|Moderate Heat|Great Heat|Autumn Commences|"
           "End of Heat|White Dew|Autumnal Equinox|Cold Dew|Frost|Winter Commences|"
           "Light Snow|Heavy Snow|Winter Solstice").lower().split("|")
DAYS = "初一 初二 初三 初四 初五 初六 初七 初八 初九 初十 十一 十二 十三 十四 十五 十六 十七 十八 十九 二十 廿一 廿二 廿三 廿四 廿五 廿六 廿七 廿八 廿九 三十".split()
MONTHS = "正 二 三 四 五 六 七 八 九 十 十一 十二".split()
PMO_DAY = re.compile(r"(?:(闰?)([正一二三四五六七八九十]+)月\s*)?(" + "|".join(DAYS)
                     + r")\s*[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]\s*([一二三四五六日])")
PMO_TERM = re.compile("(" + "|".join(TERMS) + r")(?:\s*\d+\))?\s+(\d+)\s+(\d+)\s+\d+\s+\d+")
HKO_DAY = re.compile(r"(\d{4})/(\d+)/(\d+)\s+(.+?)\s+"
                     r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.*)", re.I)


def require(condition, context):
    if not condition:
        raise ValueError(f"历表格式或连续性异常: {context}")


def read_pmo(path):
    lunar_year = 1899
    with pypdfium2.PdfDocument(path) as pdf:
        require(len(pdf) == 380, path)
        for page_index in range(2, len(pdf)):
            year, group = divmod(page_index - 2, 3)
            year += 1900
            first_month = group * 4 + 1
            page = pdf[page_index]
            text = page.get_textpage()
            body = text.get_text_range()
            text.close()
            page.close()
            require(str(year) in body[:12], page_index + 1)
            table, footer = re.split(r"节\s*气", body, maxsplit=1)
            terms = PMO_TERM.findall(footer)
            require([row[0] for row in terms] == TERMS[8*group:8*group+8], page_index + 1)
            events = {date(year, int(m), int(d)): name for name, m, d in terms}
            rows = PMO_DAY.findall(table)
            require(len(rows) == sum(calendar.monthrange(year, m)[1]
                    for m in range(first_month, first_month + 4)), page_index + 1)
            for offset, (prefix, month_name, day_name, weekday) in enumerate(rows):
                solar = date(year, first_month, 1) + timedelta(days=offset)
                day = DAYS.index(day_name) + 1
                require(weekday == "一二三四五六日"[solar.weekday()], solar)
                require(bool(month_name) == (day == 1 or solar.day == 1), solar)
                if month_name:
                    month = MONTHS.index(month_name) + 1
                    leap = bool(prefix)
                    if month == day == 1 and not leap:
                        lunar_year += 1
                yield solar, lunar_year, month, day, leap, events.get(solar)


def read_hko(directory):
    # 1901-01-01 为庚子年十一月十一；英文表以连续两次同月月首标示闰月。
    lunar_year, month, leap = 1900, 11, False
    for year in range(1901, 2101):
        path = directory / f"{year}.txt"
        for line in path.read_text(encoding="latin1").splitlines():
            if not re.match(r"^\s*\d{4}/", line):
                continue
            match = HKO_DAY.fullmatch(line.strip())
            require(match, line)
            y, m, d, label, weekday, term = match.groups()
            solar = date(int(y), int(m), int(d))
            require(solar.year == year and weekday[:3].lower() ==
                    ("mon", "tue", "wed", "thu", "fri", "sat", "sun")[solar.weekday()], solar)
            if label.isdigit():
                day = int(label)
            else:
                first = re.fullmatch(r"(\d+)(?:st|nd|rd|th)\s+lunar month", label, re.I)
                require(first, line)
                new_month = int(first[1])
                leap = new_month == month
                month, day = new_month, 1
                if month == 1 and not leap:
                    lunar_year += 1
            name = " ".join(term.lower().split())
            yield solar, lunar_year, month, day, leap, TERMS[ENGLISH.index(name)] if name else None


def encode(rows, start, end):
    lines = ["# Gregorian date | lunar YYYY-MM-DD (L = leap) | solar term"]
    expected = date(start, 1, 1)
    previous = None
    annual_terms = []
    for solar, year, month, day, leap, term in rows:
        require(solar == expected and 1 <= day <= 30 and 1 <= month <= 12, solar)
        identity = (year, month, leap)
        if previous:
            old_identity, old_day = previous
            if day == 1:
                old_year, old_month, old_leap = old_identity
                next_month = old_month % 12 + 1
                require(old_day in (29, 30) and (
                    (leap and not old_leap and (year, month) == (old_year, old_month)) or
                    (not leap and (year, month) == (old_year + (next_month == 1), next_month))
                ), solar)
            else:
                require(day == old_day + 1 and identity == old_identity, solar)
        previous = identity, day
        lunar = "-"
        if day == 1 or (solar.month, solar.day) == (1, 1):
            lunar = f"{year}-{'L' if leap else ''}{month:02}-{day:02}"
        if term:
            annual_terms.append(term)
        if term or lunar != "-":
            lines.append(f"{solar} {lunar} {term or '-'}")
        if (solar.month, solar.day) == (12, 31):
            require(annual_terms == TERMS, solar.year)
            annual_terms = []
        expected += timedelta(days=1)
    require(expected == date(end + 1, 1, 1), expected)
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pmo_pdf", type=Path)
    parser.add_argument("hko_directory", type=Path, help="包含 1901.txt 至 2100.txt 的目录")
    args = parser.parse_args()
    snapshots = {
        "pmo": encode(read_pmo(args.pmo_pdf), 1900, 2025),
        "hko": encode(read_hko(args.hko_directory), 1901, 2100),
    }
    for source, content in snapshots.items():
        (Path(__file__).parent / "reference" / f"{source}.txt").write_bytes(content.encode("utf-8"))
