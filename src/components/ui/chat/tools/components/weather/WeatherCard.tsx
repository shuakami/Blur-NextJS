import { memo } from 'react';
import { Wind, Droplets } from "lucide-react";
import { WeatherNow } from '../../types';
import { getWeatherIcon } from '../../utils';
import { cn } from '@/lib/utils/utils';
import { CARD_STYLES, TEXT_STYLES } from '../../constants';

interface WeatherCardProps {
  data: WeatherNow;
}

export const WeatherCard = memo(({ data }: WeatherCardProps) => (
  <div className={cn(CARD_STYLES.base, CARD_STYLES.ring)}>
    <div className="flex items-start justify-between">
      <div className="space-y-2.5">
        <div className={cn(TEXT_STYLES.title, "space-x-1")}>
          现在 {data.temp}°，{data.text}
        </div>
        <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Wind className="h-4 w-4" />
            {data.windDir} {data.windScale}级
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="h-4 w-4" />
            湿度 {data.humidity}%
          </div>
        </div>
      </div>
      <div className="text-3xl">
        {getWeatherIcon(data.icon)}
      </div>
    </div>
  </div>
));

WeatherCard.displayName = 'WeatherCard'; 