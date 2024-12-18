import { UseToolProps as BaseUseToolProps } from '../UseTool';

// 天气类型定义
export type WeatherType = '晴热' | '晴暖' | '晴适' | '多云' | '阴天' | '小雨' | '中雨' | '大雨';

// 接口定义
export interface WeatherNow {
  vis: string;
  temp: string;
  text: string;
  windDir: string;
  windScale: string;
  humidity: string;
  icon: string;
  aqi: string;
  category: string;
  pm2p5: string;
  pm10: string;
  no2: string;
}

export interface DailyWeather {
  fxDate: string;
  tempMax: string;
  tempMin: string;
  textDay: string;
  iconDay: string;
}

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

export interface MinutelyWeather {
  fxTime: string;
  precip: string;
  type: string;
}

export interface WeatherResponse {
  data: {
    data: {
      now?: WeatherNow;
      daily?: DailyWeather[];
      warning?: WeatherWarning[];
      minutely?: MinutelyWeather[];
      summary?: string;
    };
    message: string;
    status: string;
  };
  plugin_name: string;
}

export interface UseToolProps extends BaseUseToolProps {
  onError?: () => void;
}

export type WeatherDataType = 'weather' | 'air' | 'forecast' | 'warning' | 'minutely'; 