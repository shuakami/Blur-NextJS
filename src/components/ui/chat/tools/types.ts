// types.ts

import { UseToolProps as BaseUseToolProps } from '../UseTool';

// 天气类型定义
export type WeatherType = '晴热' | '晴暖' | '晴适' | '多云' | '阴天' | '小雨' | '中雨' | '大雨';

// 当前天气数据
export interface WeatherNow {
  vis: string;
  temp: string;
  text: string;
  windDir: string;
  windScale: string;
  humidity: string;
  icon: string;
  aqi?: string;
  category?: string;
  pm2p5?: string;
  pm10?: string;
  no2?: string;
}

// 每日天气预报
export interface DailyWeather {
  fxDate: string;
  tempMax: string;
  tempMin: string;
  textDay: string;
  iconDay: string;
}

// 天气警告
export interface WeatherWarning {
  id: string;
  sender: string;
  pubTime: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  severity: string;
  severityColor: string;
  typeName: string;
  text: string;
}

// 分钟级降水
export interface MinutelyWeather {
  fxTime: string;
  precip: string;
  type: string;
}

// 天气响应数据
export interface WeatherData {
  now?: WeatherNow;
  daily?: DailyWeather[];
  warning?: WeatherWarning[];
  minutely?: MinutelyWeather[];
  summary?: string;
}


export interface WeatherResponse {
  data: {
    data?: WeatherData; // 主要数据路径
    response?: {
      result: WeatherData; // 备用数据路径
      message: string;
      status: string;
    };
    message: string;
    status: string;
  };
  plugin_name: string;
}


export interface UseToolProps extends BaseUseToolProps {
  onError?: () => void;
}

// 天气数据类型
export type WeatherDataType = 'weather' | 'air' | 'forecast' | 'warning' | 'minutely';
