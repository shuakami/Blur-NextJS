import React, { useEffect, useMemo } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { UseToolProps, WeatherResponse, WeatherDataType } from './types';
import {
  WeatherCard,
  AirQualityCard,
  ForecastCard,
  WarningCard,
  MinutelyCard
} from './components/weather/index';

const Tool8Component: React.FC<UseToolProps> = React.memo(({
  status,
  response,
  onError
}) => {

  // 缓存数据解析结果
  const { data, type } = useMemo(() => {
    const weatherResponse = response as WeatherResponse;

    // 提取数据路径
    const extractedData: any | null =
      weatherResponse?.data?.data ||
      weatherResponse?.data?.response?.result ||
      null;

    // 类型检测
    let detectedType: WeatherDataType | null = null;

    if (extractedData && typeof extractedData === 'object') {
      if ('now' in extractedData && 'vis' in extractedData.now!) {
        detectedType = 'weather';
      } else if ('now' in extractedData && 'aqi' in extractedData.now!) {
        detectedType = 'air';
      } else if (Array.isArray(extractedData.daily)) {
        detectedType = 'forecast';
      } else if ('warning' in extractedData && extractedData.warning!.length > 0) {
        detectedType = 'warning';
      } else if ('minutely' in extractedData && extractedData.minutely!.length > 0) {
        detectedType = 'minutely';
      } else {
        // 尝试从其他字段推断类型
        if ('summary' in extractedData && typeof extractedData.summary === 'string') {
          detectedType = 'forecast';
        }
      }
    }

    return { data: extractedData, type: detectedType };
  }, [response]);

  // 只在响应完成但数据无效时回退
  useEffect(() => {
    if (status === 'response' && (!data || !type)) {
      console.error('[Tool8Component] Invalid weather data:', { type, data });
      onError?.();
    }
  }, [status, data, type, onError]);

  // 显示骨架屏
  const showSkeleton = useMemo(() => status !== 'response' || !data || !type, [status, data, type]);

  // 渲染相应的卡片组件
  const renderCard = useMemo(() => {
    if (!data || !type) return null;

    switch (type) {
      case 'weather':
        return data.now ? <WeatherCard data={data.now} /> : null;
      case 'air':
        return data.now ? <AirQualityCard data={data.now} /> : null;
      case 'forecast':
        return Array.isArray(data.daily) ? <ForecastCard data={data.daily} /> : null;
      case 'warning':
        return data.warning && data.warning.length > 0 ? <WarningCard data={data.warning[0]} /> : null;
      case 'minutely':
        return data.minutely && data.minutely.length > 0 ? <MinutelyCard 
                                                          data={data.minutely} 
                                                          summary={data.summary || ''} 
                                                        /> : null;
      default:
        return null;
    }
  }, [type, data]);

  return (
    <div className="space-y-4 py-4 px-1">
      {showSkeleton ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <>
          {renderCard}

          {!['weather', 'air', 'forecast', 'warning', 'minutely'].includes(type || '') && (
            <>
              {type && (
                <div className="text-red-500">
                  无法识别的天气数据类型：<strong>{type}</strong>
                </div>
              )}
              {!type && (
                <div className="text-yellow-500">
                  未处理的数据类型或结构。请检查数据源。
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
});

Tool8Component.displayName = 'Tool8Component';

export default Tool8Component;
