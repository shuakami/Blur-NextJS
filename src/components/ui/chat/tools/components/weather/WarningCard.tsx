import { memo } from 'react';
import { Clock, AlertCircle, Building2 } from "lucide-react";
import { WeatherWarning } from '../../types';
import { CARD_STYLES, TEXT_STYLES } from '../../constants';
import { cn } from '@/lib/utils/utils';

interface WarningCardProps {
  data: WeatherWarning[];
}

export const WarningCard = memo(({ data }: WarningCardProps) => (
  <div className={cn(CARD_STYLES.base, CARD_STYLES.ring)}>
    {data.length > 0 ? (
      <div className="space-y-4">
        {data.map((warning) => (
          <div key={warning.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    warning.severityColor === 'Blue' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    warning.severityColor === 'Yellow' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                    warning.severityColor === 'Orange' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                    warning.severityColor === 'Red' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {warning.typeName}预警
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {warning.severity}级
                  </span>
                </div>
                <h3 className="text-base font-medium">
                  {warning.title}
                </h3>
              </div>
              <div className="text-2xl">
                ⚠️
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {warning.text}
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                发布时间：{new Date(warning.pubTime).toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                预警时段：{new Date(warning.startTime).toLocaleString()} 至 {new Date(warning.endTime).toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                发布单位：{warning.sender}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-between">
        <div className="space-y-2.5">
          <div className={TEXT_STYLES.title}>
            目前无预警信息
          </div>
          <div className={TEXT_STYLES.subtitle}>
            天气状况良好，暂无灾害性天气预警
          </div>
        </div>
        <div className="text-3xl">
          🌈
        </div>
      </div>
    )}
  </div>
));

WarningCard.displayName = 'WarningCard'; 