import { useEffect, useMemo } from 'react';
import { Skeleton } from "../../skeleton";
import { UseToolProps, WeatherResponse } from './types';
import {
  WeatherCard,
  AirQualityCard,
  ForecastCard,
  WarningCard,
  MinutelyCard
} from './components/weather/index';

const Tool8Component: React.FC<UseToolProps> = ({
  status,
  response,
  onError
}) => {


  // 缓存数据解析结果
  const { data, type } = useMemo(() => {
    const weatherResponse = response as WeatherResponse;
    const data = weatherResponse?.data?.data;
    const type = data?.now?.vis ? 'weather' : 
                 data?.now?.aqi ? 'air' : 
                 data?.daily ? 'forecast' : 
                 data?.warning ? 'warning' :
                 data?.minutely ? 'minutely' : null;
    return { data, type };
  }, [response]);

  // 只在响应完成但数据无效时回退
  useEffect(() => {
    if (status === 'response' && (!data || !type)) {
      console.error('Invalid weather data:', { type, data });
      onError?.();
    }
  }, [status, data, type, onError]);

  // 不是response状态时，显示骨架屏
  if (status !== 'response') {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // 数据未就绪时继续渲染
  if (!data || !type) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    // 抛出错误
    <div className="space-y-4 p-4">
      {type === 'weather' && data.now && (
        <WeatherCard data={data.now} />
      )}

      {type === 'air' && data.now && (
        <AirQualityCard data={data.now} />
      )}

      {type === 'forecast' && data.daily && (
        <ForecastCard data={data.daily} />
      )}

      {type === 'warning' && data.warning && (
        <WarningCard data={data.warning} />
      )}

      {type === 'minutely' && data.minutely && (
        <MinutelyCard 
          data={data.minutely}
          summary={data.summary}
        />
      )}
    </div>
  );
};

export default Tool8Component;