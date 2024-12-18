import { WeatherType } from './types';
import {
    WEATHER_ICONS,
    WEATHER_TYPE_MAP,
    TODAY_WEATHER_MAP,
    WEATHER_DESCRIPTIONS
} from './constants';

// 获取天气图标
export const getWeatherIcon = (code: string): string => {
  // 先尝试精确匹配
  if (code in WEATHER_ICONS) {
    return WEATHER_ICONS[code];
  }

  // 再尝试范围匹配
  const codeNum = Number(code);
  for (const [key, icon] of Object.entries(WEATHER_ICONS)) {
    if (key.includes('~')) {
      const [start, end] = key.split('~').map(Number);
      if (codeNum >= start && codeNum <= end) {
        return icon as string;
      }
    }
  }
  
  return '🌈'; // 默认图标
};

// 生成人性化的天气描述
export const getWeatherDescription = (day: any, isToday = false): string => {
  // 数据校验
  if (!day?.tempMax || !day?.textDay) {
    return '暂无天气描述';
  }

  const temp = parseInt(day.tempMax);
  const text = day.textDay;

  // 今天的天气描述
  if (isToday) {
    try {
      const tempLevel = temp > 30 ? 'hot' : temp > 25 ? 'warm' : 'cool';
      
      for (const [condition, description] of TODAY_WEATHER_MAP) {
        const [weather, level] = condition.split('-');
        if (text.includes(weather)) {
          if (!level || tempLevel === level) {
            return description;
          }
        }
      }
    } catch (error) {
      console.error('Weather description error:', error);
      return text || '暂无天气描述';
    }
    
    return text;
  }

  try {
    let weatherType: WeatherType | undefined;
    for (const [keyword, getType] of WEATHER_TYPE_MAP) {
      if (text.includes(keyword)) {
        weatherType = getType(temp);
        break;
      }
    }

    if (!weatherType) return text;

    const descriptions = WEATHER_DESCRIPTIONS[weatherType];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  } catch (error) {
    console.error('Weather description error:', error);
    return text || '暂无天气描述';
  }
};

// 获取友好的日期显示
export const getFriendlyDate = (date: string, index: number): string => {
  if (index === 0) return "明天";
  if (index === 1) return "后天";
  
  const weekDay = new Date(date).getDay();
  const weekDays = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekDays[weekDay];
};

// 数据验证
export const validateWeatherData = (data: any, type: string | null) => {
  if (!data || !type) return false;

  switch (type) {
    case 'weather':
      return data.now?.temp && data.now?.text && data.now?.icon;
    
    case 'air':
      return data.now?.aqi && data.now?.category;
    
    case 'forecast':
      return Array.isArray(data.daily) && 
             data.daily.length > 0 && 
             data.daily.every((day: any) => 
               day.tempMax && 
               day.tempMin && 
               day.textDay && 
               day.iconDay
             );
    
    case 'warning':
      return Array.isArray(data.warning);
    
    case 'minutely':
      return Array.isArray(data.minutely) && 
             data.minutely.length > 0 &&
             data.minutely.every((item: any) => 
               item.precip && 
               item.fxTime
             );
    
    default:
      return false;
  }
}; 