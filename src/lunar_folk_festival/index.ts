import { type ConfigType } from "../utils/dayjs";
import dayjs from '../utils/dayjs';
import { getLunarDate } from "../solar_lunar";
import { LUNAR_FESTIVAL_MAP, SPECIAL_FESTIVAL_HANDLERS, type LunarFestival } from './constants'

/**
 * 获取农历节日（包含固定节日和特殊计算节日）
 * @param start 开始日期
 * @param end 结束日期
 */
export const getLunarFestivals = (
  start?: ConfigType,
  end?: ConfigType
): { date: string, name: string[] }[] => {
  const results: LunarFestival[] = [];
  let current = dayjs(start);
  const endDate = dayjs(end || start);

  // 遍历日期范围
  while (current.isBefore(endDate) || current.isSame(endDate)) {
    // 处理固定农历节日
    const lunar = getLunarDate(current);
    if (!lunar.isLeap) {
      const festivals = LUNAR_FESTIVAL_MAP[lunar.lunarMon]?.[lunar.lunarDay] || [];
      festivals.forEach(name => {
        results.push({
          date: current.format('YYYY-MM-DD'),
          name,
          type: 'lunar'
        });
      });
    }

    // 运行特殊节日处理器
    SPECIAL_FESTIVAL_HANDLERS.forEach(handler => handler(current, results));

    current = current.add(1, 'day');
  }

  // 去重并排序
  return results.reduce((acc: { date: string; name: string[] }[], curr) => {
    const existing = acc.find(item => item.date === curr.date)
    if (existing) {
      existing.name.push(curr.name)
    } else {
      acc.push({ date: curr.date, name: [curr.name] })
    }
    return acc
  }, [])
};

export default {
  getLunarFestivals
}