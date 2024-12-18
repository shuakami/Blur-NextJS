import { memo } from 'react';
import { MinutelyWeather } from '../../types';
import { CARD_STYLES, TEXT_STYLES } from '../../constants';
import { cn } from '@/lib/utils/utils';

interface MinutelyCardProps {
  data: MinutelyWeather[];
  summary?: string;
}

export const MinutelyCard = memo(({ data, summary }: MinutelyCardProps) => {
  const maxPrecip = Math.max(...data.map(item => parseFloat(item.precip)));
  
  return (
    <div className={cn(CARD_STYLES.base, CARD_STYLES.ring)}>
      <div className="space-y-4">
        {/* 标题区域 */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className={TEXT_STYLES.title}>
              {summary || '未来两小时降水预报'}
            </div>
            <div className={TEXT_STYLES.subtitle}>
              {new Date(data[0].fxTime).toLocaleTimeString().slice(0, -3)} - 
              {new Date(data[data.length-1].fxTime).toLocaleTimeString().slice(0, -3)}
            </div>
          </div>
          <div className="text-2xl opacity-80">
            {parseFloat(data[0].precip) > 0 ? '🌧️' : '☂️'}
          </div>
        </div>

        {/* 图表区域 */}
        <div className="h-44 relative">
          {/* 背景网格 */}
          <div className="absolute inset-0 grid grid-rows-4 gap-0">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="border-b border-gray-100/30 dark:border-gray-800/30"
              />
            ))}
          </div>

          {/* Y轴刻度 */}
          <div className="absolute top-0 right-0 bottom-8 flex flex-col justify-between text-[10px] text-gray-400/60 pr-2">
            <span>{maxPrecip}mm</span>
            <span>{(maxPrecip/2).toFixed(1)}mm</span>
            <span>0mm</span>
          </div>

          {/* 降水量柱状图 */}
          <div className="absolute inset-x-8 bottom-8 flex items-end space-x-1.5">
            {data.map((item, index) => {
              const precipValue = parseFloat(item.precip);
              
              const heightPx = precipValue === 0 
                ? 2 
                : Math.min(
                    Math.max(
                      20 + (Math.log(precipValue + 1) / Math.log(maxPrecip + 1)) * 80,
                      20
                    ),
                    100
                  );
              
              const time = new Date(item.fxTime).toLocaleTimeString().slice(0, -3);
              
              return (
                <div
                  key={item.fxTime}
                  className="relative flex-1 min-w-[4px] [--hover:0] hover:[--hover:1]"
                  title={`${time}: ${item.precip}mm`}
                >
                  {/* 柱状图 */}
                  <div
                    className={cn(
                      "w-full rounded-sm transition-all duration-300",
                      precipValue > 0
                        ? "bg-gradient-to-b from-blue-400/[calc(0.6+var(--hover)*0.2)] to-blue-500/[calc(0.6+var(--hover)*0.2)]" 
                        : "bg-gray-200/30 dark:bg-gray-700/30"
                    )}
                    style={{ height: `${heightPx}px` }}
                  />
                  
                  {/* 时间标签 */}
                  {index % 6 === 0 && (
                    <div className="absolute top-full pt-1.5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400/60 dark:text-gray-500/60 whitespace-nowrap">
                      {time}
                    </div>
                  )}

                  {/* 降水量提示 */}
                  {precipValue > 0 && (
                    <div className="absolute opacity-[var(--hover)] transition-opacity duration-200
                                  bottom-full mb-1.5 left-1/2 -translate-x-1/2 
                                  min-w-20 px-3 py-2 rounded-lg text-[10px] whitespace-nowrap
                                  bg-white/90 dark:bg-gray-800/90
                                  text-gray-700 dark:text-gray-200
                                  shadow-lg ring-1 ring-black/5 dark:ring-white/5
                                  pointer-events-none backdrop-blur-sm">
                      <div className="font-medium whitespace-nowrap text-gray-500/80 dark:text-gray-400/80">
                       {time}
                      </div>
                      <div className="font-semibold mt-0.5">
                      降水: {precipValue}mm
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

MinutelyCard.displayName = 'MinutelyCard'; 