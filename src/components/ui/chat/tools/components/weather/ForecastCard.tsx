import { memo } from 'react';
import { DailyWeather } from './types';
import { CARD_STYLES, TEXT_STYLES } from './constants';
import { getWeatherIcon, getWeatherDescription, getFriendlyDate } from '../../utils';
import { cn } from '@/lib/utils/utils';

interface ForecastCardProps {
  data: DailyWeather[];
}

export const ForecastCard = memo(({ data }: ForecastCardProps) => (
  <div className={cn(CARD_STYLES.base, CARD_STYLES.air)}>
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <div className={TEXT_STYLES.title}>
            明天 {data[0].tempMax}°，{data[0].textDay}
          </div>
          <div className={TEXT_STYLES.subtitle}>
            {getWeatherDescription(data[0], true)}
          </div>
        </div>
        <div className="text-3xl">
          {getWeatherIcon(data[0].iconDay)}
        </div>
      </div>
    </div>

    <div className="h-px bg-gray-100 dark:bg-gray-800 mb-4" />

    <div className="space-y-3">
      {data.slice(1).map((day, index) => (
        <div 
          key={day.fxDate}
          className="grid grid-cols-[120px_1fr_100px] items-center"
        >
          <div className="text-base">
            {getWeatherIcon(day.iconDay)}{' '}
            {getFriendlyDate(day.fxDate, index + 1)}
          </div>
          <div className="flex items-center mx-5">
            <div className="text-base">
              {getWeatherDescription(day)}
            </div>
          </div>
          <div className="flex items-baseline justify-end gap-2 text-base tabular-nums">
            <span className="font-bold">{day.tempMax}°</span>
            <span className="text-gray-400 dark:text-gray-500">{day.tempMin}°</span>
          </div>
        </div>
      ))}
    </div>
  </div>
));

ForecastCard.displayName = 'ForecastCard'; 