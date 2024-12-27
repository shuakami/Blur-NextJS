import { Skeleton } from '../../skeleton';
import './skeleton.css';

export const CodeBlockSkeleton = () => (
  <div className="my-4 rounded-lg border border-gray-200 dark:border-gray-900 overflow-hidden skeleton-base-transition">
    <div className="bg-gray-50 dark:bg-gray-950 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-900">
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded"></div>
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
    </div>
    <div className="p-4 bg-gray-50/70 dark:bg-gray-950/70 space-y-2">
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-full rounded"></div>
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-4/5 rounded"></div>
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-3/4 rounded"></div>
    </div>
  </div>
);


export const BlockMathSkeleton = () => (
  <div className="my-4 flex justify-center skeleton-base-transition">
    <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-4 w-4/5">
      <div className="flex space-x-2 items-center justify-center">
        <div className="bg-gray-200 dark:bg-gray-600 h-6 w-12 rounded"></div>
        <div className="bg-gray-200 dark:bg-gray-600 h-6 w-16 rounded"></div>
        <div className="bg-gray-200 dark:bg-gray-600 h-6 w-8 rounded"></div>
      </div>
    </div>
  </div>
);

export const InlineMathSkeleton = () => (
  <span className="inline-flex items-center mx-1 skeleton-base-transition">
    <span className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
      <span className="inline-block bg-gray-200 dark:bg-gray-600 h-4 w-8 rounded"></span>
    </span>
  </span>
);

export const ImageSkeleton = () => (
  <div className="relative w-full h-full skeleton-base-transition">
    <div className="relative w-full pb-[56.25%] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent skeleton-shine"></div>
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <svg 
          className="w-12 h-12 text-gray-300 dark:text-gray-600" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </div>
    </div>
  </div>
);



export const UseToolSkeletons = {
    // 天气工具专用骨架屏
    weather: () => (
        <div className="space-y-4 py-4 skeleton-base-transition">
          {/* 主要天气卡片 */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 p-4 relative overflow-hidden">
            {/* 添加渐变动画效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/30 dark:via-gray-700/30 to-transparent skeleton-shine"></div>
            
            <div className="flex items-start justify-between relative">
              {/* 左侧信息区 */}
              <div className="space-y-4">
                {/* 温度和天气状况 */}
                <div className="space-y-2">
                  <Skeleton className="h-10 w-48 bg-gradient-to-r bg-gray-100/80 dark:bg-gray-800/80 rounded-lg" />
                  <div className="flex gap-6">
                    <Skeleton className="h-8 w-24 bg-gradient-to-r bg-gray-100/80 dark:bg-gray-800/80 rounded-lg" />
                    <Skeleton className="h-8 w-24 bg-gradient-to-r bg-gray-100/80 dark:bg-gray-800/80 rounded-lg" />
                  </div>
                </div>
              </div>
              {/* 右侧天气图标 */}
              <Skeleton className="h-12 w-12 rounded-xl bg-gradient-to-br bg-gray-100/80 dark:bg-gray-800/80" />
            </div>
          </div>
        </div>
      ),
    
// 通用工具骨架屏 - 折叠状态（默认）
collapsed: () => (
    <div className="my-2">
      <button className="relative inline-flex items-center py-1.5 rounded-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="absolute -right-1 -bottom-1">
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-3.5 ml-auto rounded" />
        </div>
      </button>
    </div>
),

// 调用状态骨架屏
calling: () => (
    <div className="my-2">
      <button className="relative inline-flex items-center py-1.5 rounded-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="absolute -right-1 -bottom-1">
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-3.5 ml-auto rounded" />
        </div>
      </button>
    </div>
)
  } as const;
  