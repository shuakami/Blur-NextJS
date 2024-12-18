import { WeatherType } from "./types";

// 样式常量
export const CARD_STYLES = {
  base: "rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-blue-900/20 dark:to-blue-800/20 p-6",
  ring: "ring-1 ring-black/[0.03] dark:ring-white/[0.05]",
  warning: "from-red-50/80 to-red-100/80 dark:from-red-900/20 dark:to-red-800/20",
  air: "from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
} as const;

export const TEXT_STYLES = {
  title: "text-2xl font-bold tracking-tight",
  subtitle: "text-sm text-gray-600 dark:text-gray-300",
  label: "text-sm font-bold text-gray-500 dark:text-gray-400",
} as const;

// 天气图标映射
export const WEATHER_ICONS: Record<string, string> = {
  '100': '☀️',      // 晴
  '101~102': '🌤️',  // 多云到晴
  '103~104': '☁️',  // 晴间多云到阴
  '150': '🌙',      // 夜间晴
  '151~153': '🌑',  // 夜间多云
  '300~301': '🌦️',  // 阵雨
  '302~304': '⛈️',  // 雷雨
  '305~399': '🌧️',  // 小雨到大雨
  '400~499': '🌨️',  // 各类雪
  '500~502': '🌫️',  // 雾和霾
  '503~508': '🌪️',  // 浮尘和沙尘
  '509~515': '🌫️',  // 强浓雾等
  '999': '❓'        // 未知
} as const;

export const WEATHER_DESCRIPTIONS = {
    "晴热": [
      "炎热高温，尽量待在室内",
      "太阳很毒，出门做好防晒",
      "气温爆表，避免长时间暴晒",
      "闷热天，冰饮和空调是好搭档"
    ],
    "晴暖": [
      "天气暖洋洋，适合出门走走",
      "阳光正好，午后可以晒衣服",
      "温暖的晴天，安排点户外活动吧",
      "风和日丽，空气清新很舒服"
    ],
    "晴适": [
      "凉爽的晴天，外出刚刚好",
      "阳光柔和，带点风很舒适",
      "不冷不热，适合运动或散步",
      "舒适的天气，适合在阳台晒太阳"
    ],
    "多云": [
      "天有点阴，阳光被遮住了",
      "多云天，偶尔有微风吹过",
      "天空多云，温度比较稳定",
      "云层较厚，阳光没那么刺眼"
    ],
    "阴天": [
      "有点灰，看起来很安静",
      "阴天没太阳，光线稍暗",
      "气温偏凉，穿厚一点更舒服",
      "阴沉的天，空气里有点潮湿感"
    ],
    "小雨": [
      "小雨飘飘，出门记得带伞",
      "雨不大，路上稍微有点湿滑",
      "小雨连绵，湿气有点重",
      "细雨微微，适合待在家里看书"
    ],
    "中雨": [
      "中雨天，伞是出门的标配",
      "雨势加大，路面有些积水",
      "持续中雨，出门小心打滑",
      "外面雨很密，适合在家办公"
    ],
    "大雨": [
      "暴雨倾盆，减少外出为好",
      "大雨滂沱，路上行车要注意安全",
      "大雨不断，穿雨靴更方便",
      "雨特别大，待在家里是明智的选择"
    ]
  } as const;

// 天气状况映射
type WeatherMapFunction = (temp: number) => WeatherType;
type WeatherMapEntry = [string, WeatherMapFunction];

export const WEATHER_TYPE_MAP = new Map<string, WeatherMapFunction>([
  ['晴', (temp: number) => 
    temp > 30 ? '晴热' : temp > 25 ? '晴暖' : '晴适'],
  ['多云', () => '多云'],
  ['阴', () => '阴天'],
  ['小雨', () => '小雨'],
  ['中雨', () => '中雨'],
  ['大雨', () => '大雨']
] as WeatherMapEntry[]);

// 今日天气描述映射
export const TODAY_WEATHER_MAP = new Map([
  ['晴-hot', '外出记得防晒，多补充水分'],
  ['晴-warm', '阳光正好，适合晒被子'],
  ['晴-cool', '天气舒适，很适合出门'],
  ['多云-warm', '天气有点闷热，多补充水分'],
  ['多云-cool', '云朵飘飘，温度刚刚好'],
  ['阴', '天色有点暗，记得开灯工作'],
  ['雨', '出门记得带伞，小心路滑'],
  ['雾', '能见度低，出行注意安全']
]);