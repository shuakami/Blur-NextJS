import { memo } from 'react';
import { WeatherNow } from './types';
import { cn } from '@/lib/utils/utils';
import { CARD_STYLES, TEXT_STYLES } from './constants';

interface AirQualityCardProps {
  data: WeatherNow;
}

export const AirQualityCard = memo(({ data }: AirQualityCardProps) => (
  <div className={cn(CARD_STYLES.base, CARD_STYLES.air)}>
    <div className="flex items-center gap-8">
      <div className="w-[120px]">
        <div className={TEXT_STYLES.label}>
          空气质量指数 (AQI)
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-4xl font-bold tracking-tight">
            {data.aqi}
          </div>
          <div className={cn(
            "rounded-full px-2 py-0.5 text-xs font-bold",
            data.category === "优" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
            data.category === "良" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {data.category}
          </div>
        </div>
      </div>
      
      <div className="flex-1 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className={TEXT_STYLES.label}>PM2.5</span>
          <span className="font-bold">{data.pm2p5}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className={TEXT_STYLES.label}>PM10</span>
          <span className="font-bold">{data.pm10}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className={TEXT_STYLES.label}>NO₂</span>
          <span className="font-bold">{data.no2}</span>
        </div>
      </div>
    </div>
  </div>
));

AirQualityCard.displayName = 'AirQualityCard'; 