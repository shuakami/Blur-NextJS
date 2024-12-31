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
    "晴热": "炎热高温，请尽量待在室内，注意防暑降温",
    "晴暖": "天气暖洋洋，适合出门走走，注意防晒",
    "晴适": "凉爽的晴天，适合外出活动",
    "多云": "天空多云，温度比较稳定，适合户外活动",
    "阴天": "阴天无雨，气温偏凉，建议适当添衣",
    "小雨": "小雨飘飘，出门记得带伞，路面可能湿滑",
    "中雨": "中雨持续，外出请带伞，注意交通安全",
    "大雨": "大雨倾盆，尽量减少外出，注意防涝"
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