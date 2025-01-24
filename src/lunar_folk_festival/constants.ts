import { getLunarDate, monthDays } from "../solar_lunar";
import { getSolarTermsInRange } from "../solar_terms";
import { type Dayjs } from "../utils/dayjs";

// 特殊节日处理器类型
export interface LunarFestival {
  date: string;     // 节日日期（公历）
  name: string;     // 节日名称
  type: 'lunar' | 'solar_term' | 'special';
}

// 固定农历节日配置
export const LUNAR_FESTIVAL_MAP: Record<number, Record<number, string[]>> = {
  1: { // 正月
    1: ['春节', '鸡日', '元始天尊诞辰'],
    2: ['犬日'],
    3: ['猪日', '小年朝'],
    4: ['羊日', '孙天医诞辰'],
    5: ['牛日', '破五日', '开市', '路神诞辰'],
    6: ['马日'],
    7: ['人日', '送火神'],
    8: ['谷日', '阎王诞辰'],
    9: ['天日', '玉皇诞辰'],
    10: ['地日', '石头生日'],
    13: ['上(试)灯日', '关公升天日'],
    15: ['元宵节', '上元节', '正灯日', '天官诞辰'],
    18: ['落灯日'],
    25: ['天仓(填仓)节'],
  },
  2: { // 二月
    1: ['太阳生日'],
    2: ['春龙节', '土地公生日', '济公活佛生日'],
    3: ['文昌帝君诞辰'],
    12: ['百花生日(花朝节)'],
    15: ['九天玄女诞辰', '太上老君诞辰', '精忠岳王诞辰'],
    19: ['观音菩萨诞辰'],
    21: ['普贤菩萨诞辰'],
  },
  3: {
    3: ['上巳节'],
    15: ['赵公元帅诞辰', '泰山老母诞辰'],
  },
  4: {
    1: ['祭雹神'],
    4: ['文殊菩萨诞辰'],
    8: ['浴佛节(龙华会)'],
    12: ['蛇王诞辰'],
    14: ['吕洞宾诞辰'],
    18: ['华佗诞辰'],
    28: ['药王(神农)诞辰'],
  },
  5: {
    5: ['端午节'],
    13: ['雨节', '黄帝诞辰'],
  },
  6: {
    1: ['半年节'],
    6: ['晒衣节'],
    19: ['观音菩萨得道'],
    24: ['雷神诞辰', '荷花生日', '关公诞辰'],
  },
  7: {
    1: ['祭海神'],
    7: ['乞巧节'],
    15: ['中元(鬼)节', '地官诞辰(孟兰盆会)'],
    18: ['西王母诞辰'],
    20: ['棉花生日'],
    23: ['诸葛亮诞辰'],
    30: ['地藏菩萨诞辰'],
  },
  8: {
    1: ['天医节'],
    3: ['灶君生日'],
    8: ['瑶池大会'],
    15: ['中秋节'],
    20: ['水稻生日'],
    28: ['孔子诞辰'],
  },
  9: {
    9: ['重阳节'],
    19: ['观音菩萨出家'],
  },
  10: {
    1: ['十月朝', '寒衣节'],
    15: ['下元节', '水官诞辰'],
  },
  12: {
    8: ['腊八节'],
    23: ['官家送灶'],
    24: ['民间送灶'],
    25: ['接玉皇'],
  }
};

// 特殊节日处理器
export const SPECIAL_FESTIVAL_HANDLERS: ((date: Dayjs, result: LunarFestival[]) => void)[] = [
  // 处理寒食节（清明前一日）
  (current, result) => {
    const pureBrightnessDay = current.add(1, 'day')
    const pureBrightness = getSolarTermsInRange(pureBrightnessDay).find(t => t.term === 'pure_brightness');
    if (pureBrightness) {
      result.push({
        date: current.format('YYYY-MM-DD'),
        name: '寒食节',
        type: 'solar_term'
      });
    }
  },

  // 处理除夕（农历腊月最后一日）
  (current, result) => {
    const lunar = getLunarDate(current);
    if (lunar.lunarMon === 12 && lunar.lunarDay === monthDays(lunar.lunarYear, 12)) {
      const date = current.format('YYYY-MM-DD');
      ['除夕', '封井', '祭井神', '贴春联', '迎财神'].forEach(name => {
        result.push({
          date,
          name,
          type: 'lunar'
        });
      })
    }
  }
];
