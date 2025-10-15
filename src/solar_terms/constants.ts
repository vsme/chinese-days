// 定义所有节气的类型
export type SolarTermKey =
  | 'the_beginning_of_spring'
  | 'rain_water'
  | 'the_waking_of_insects'
  | 'the_spring_equinox'
  | 'pure_brightness'
  | 'grain_rain'
  | 'the_beginning_of_summer'
  | 'lesser_fullness_of_grain'
  | 'grain_in_beard'
  | 'the_summer_solstice'
  | 'lesser_heat'
  | 'greater_heat'
  | 'the_beginning_of_autumn'
  | 'the_end_of_heat'
  | 'white_dew'
  | 'the_autumn_equinox'
  | 'code_dew'
  | 'frost_descent'
  | 'the_beginning_of_winter'
  | 'lesser_snow'
  | 'greater_snow'
  | 'the_winter_solstice'
  | 'lesser_cold'
  | 'greater_cold';

/**
 * 计算节气用的 C 值
 * 2000年的小寒、大寒、立春、雨水按照20世纪的C值来算
 * 节气: [20世纪值， 21世纪值]
 * */
export const SOLAR_TERMS_C_NUMS = {
  the_beginning_of_spring: [4.6295, 3.87],
  rain_water: [19.4599, 18.73],
  the_waking_of_insects: [6.3926, 5.63],
  the_spring_equinox: [21.4155, 20.646],
  pure_brightness: [5.59, 4.81],
  grain_rain: [20.888, 20.1],
  the_beginning_of_summer: [6.318, 5.52],
  lesser_fullness_of_grain: [21.86, 21.04],
  grain_in_beard: [6.5, 5.678],
  the_summer_solstice: [22.2, 21.37],
  lesser_heat: [7.928, 7.108],
  greater_heat: [23.65, 22.83],
  the_beginning_of_autumn: [28.35, 7.5],
  the_end_of_heat: [23.95, 23.13],
  white_dew: [8.44, 7.646],
  the_autumn_equinox: [23.822, 23.042],
  code_dew: [9.098, 8.318],
  frost_descent: [24.218, 23.438],
  the_beginning_of_winter: [8.218, 7.438],
  lesser_snow: [23.08, 22.36],
  greater_snow: [7.9, 7.18],
  the_winter_solstice: [22.6, 21.94],
  lesser_cold: [6.11, 5.4055],
  greater_cold: [20.84, 20.12],
};

/** 月份和节气对应关系 */
export const SOLAR_TERMS_MONTH: { [key: number]: SolarTermKey[] } = {
  1: ['lesser_cold', 'greater_cold'],
  2: ['the_beginning_of_spring', 'rain_water'],
  3: ['the_waking_of_insects', 'the_spring_equinox'],
  4: ['pure_brightness', 'grain_rain'],
  5: ['the_beginning_of_summer', 'lesser_fullness_of_grain'],
  6: ['grain_in_beard', 'the_summer_solstice'],
  7: ['lesser_heat', 'greater_heat'],
  8: ['the_beginning_of_autumn', 'the_end_of_heat'],
  9: ['white_dew', 'the_autumn_equinox'],
  10: ['code_dew', 'frost_descent'],
  11: ['the_beginning_of_winter', 'lesser_snow'],
  12: ['greater_snow', 'the_winter_solstice'],
};

export const SOLAR_TERMS_DELTA = {
  '2026_rain_water': -1,
  '2084_the_spring_equinox': 1,
  '1911_the_beginning_of_summer': 1,
  '2008_lesser_fullness_of_grain': 1,
  '1902_grain_in_beard': 1,
  '1928_the_summer_solstice': 1,
  '1925_lesser_heat': 1,
  '2016_lesser_heat': 1,
  '1922_greater_heat': 1,
  '2002_the_beginning_of_autumn': 1,
  '1927_white_dew': 1,
  '1942_the_autumn_equinox': 1,
  '2089_frost_descent': 1,
  '2089_the_beginning_of_winter': 1,
  '1978_lesser_snow': 1,
  '1954_greater_snow': 1,
  '1918_the_winter_solstice': -1,
  '2021_the_winter_solstice': -1,
  '1982_lesser_cold': 1,
  '2019_lesser_cold': -1,
  '2000_greater_cold': 1,
  '2082_greater_cold': 1,
};

export const SOLAR_TERMS = {
  lesser_cold: '小寒',
  greater_cold: '大寒',
  the_beginning_of_spring: '立春',
  rain_water: '雨水',
  the_waking_of_insects: '惊蛰',
  the_spring_equinox: '春分',
  pure_brightness: '清明',
  grain_rain: '谷雨',
  the_beginning_of_summer: '立夏',
  lesser_fullness_of_grain: '小满',
  grain_in_beard: '芒种',
  the_summer_solstice: '夏至',
  lesser_heat: '小暑',
  greater_heat: '大暑',
  the_beginning_of_autumn: '立秋',
  the_end_of_heat: '处暑',
  white_dew: '白露',
  the_autumn_equinox: '秋分',
  code_dew: '寒露',
  frost_descent: '霜降',
  the_beginning_of_winter: '立冬',
  lesser_snow: '小雪',
  greater_snow: '大雪',
  the_winter_solstice: '冬至',
};
