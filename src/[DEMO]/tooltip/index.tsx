import { Button } from "@/components/ui/button"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import Showcase from "../showcase"
import { createCategory, createVariant } from "../utils"

export default function TooltipShowcase() {
  const categories = [
    createCategory("basic", "基础提示", "基础的 Tooltip 提示示例", [
      createVariant("Default", "default", "默认提示",
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">默认提示</Button>
            </TooltipTrigger>
            <TooltipContent>
              这是一个简单的提示信息
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      
      createVariant("Long Content", "long-content", "长文本提示",
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">长文本提示</Button>
            </TooltipTrigger>
            <TooltipContent>
              这是一段较长的提示文本，用于测试 Tooltip 组件对长文本的展示效果。
              当文本内容较多时，Tooltip 会自动换行并限制最大宽度。
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    ]),

    createCategory("positions", "提示位置", "不同位置的 Tooltip 提示", [
      createVariant("Top", "top", "顶部提示",
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">顶部提示</Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              我会显示在上方
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),

      createVariant("Bottom", "bottom", "底部提示",
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">底部提示</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              我会显示在下方
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),

      createVariant("Left", "left", "左侧提示",
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">左侧提示</Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              我会显示在左边
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),

      createVariant("Right", "right", "右侧提示",
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">右侧提示</Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              我会显示在右边
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    ]),

    createCategory("delays", "延迟设置", "不同延迟效果的 Tooltip", [
      createVariant("Quick", "quick", "快速显示",
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">立即显示</Button>
            </TooltipTrigger>
            <TooltipContent>
              我会立即显示，没有延迟
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),

      createVariant("Delayed", "delayed", "延迟显示",
        <TooltipProvider delayDuration={1000}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">延迟显示</Button>
            </TooltipTrigger>
            <TooltipContent>
              我会在1秒后显示
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    ]),

    createCategory("custom", "自定义样式", "自定义样式的 Tooltip", [
      createVariant("Custom Style", "custom", "自定义样式",
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">自定义样式</Button>
            </TooltipTrigger>
            <TooltipContent 
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-none"
            >
              这是一个自定义样式的提示
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),

      createVariant("With HTML", "with-html", "带HTML内容",
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">富文本提示</Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-2">
                <strong>重要提示</strong>
                <p>这是一个包含<span className="text-blue-500">格式化文本</span>的提示</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    ]),

    createCategory("advanced", "高级示例", "复杂交互的 Tooltip 示例", [
        createVariant("Music Player", "music-player", "音乐播放器提示",
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    正在播放
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-[320px] p-0">
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-md">
                    <div className="flex gap-4">
                      {/* 专辑封面 - 固定尺寸 */}
                      <div className="w-[68px] h-[68px] rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src="https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/43/5d/ac/435dacc4-4dba-c413-57f9-82a9b83617a6/196922930041_Cover.jpg/208x208bb.webp"
                          alt="If I Ain&apos;t Got You - Album Cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
          
                      {/* 右侧内容区 - 弹性布局 */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        {/* 标题区域 */}
                        <div>
                          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate leading-none mb-1.5">
                             If I Ain&apos;t Got You
                          </h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate leading-none">
                            Alicia Keys
                          </p>
                        </div>
          
                        {/* 控制区域 */}
                        <div className="space-y-2">
                          {/* 进度条 */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                              <div className="w-1/3 h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"/>
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0 tabular-nums">
                              1:23
                            </span>
                          </div>
          
                          {/* 控制按钮 */}
                          <div className="flex items-center justify-center gap-6">
                            <button className="w-5 h-5 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                              <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 6c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1s-1-.45-1-1V7c0-.55.45-1 1-1zm3.66 6.82l5.77 4.07c.66.47 1.58-.01 1.58-.82V7.93c0-.81-.91-1.28-1.58-.82l-5.77 4.07a1 1 0 000 1.64z"/>
                              </svg>
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                              <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </button>
                            <button className="w-5 h-5 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                              <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.58 16.89l5.77-4.07c.56-.4.56-1.24 0-1.63L7.58 7.11C6.91 6.65 6 7.12 6 7.93v8.14c0 .81.91 1.28 1.58.82zM16 7v10c0 .55.45 1 1 1s1-.45 1-1V7c0-.55-.45-1-1-1s-1 .45-1 1z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),

          
          createVariant("Profile Card", "profile", "个人资料卡片",
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    个人资料
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-[280px] p-0">
                  <div className="overflow-hidden bg-white dark:bg-zinc-900 rounded-md">
                    <div className="h-20">
                      <img 
                        src="https://raw.githubusercontent.com/shuakami/shuakami/main/pal_background.png" 
                        alt="顶部背景" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    {/* 内容区域 */}
                    <div className="px-4 pb-4">
                      {/* 头像区域 */}
                      <div className="-mt-10 mb-2 flex justify-between items-end">
                        <div className="w-16 h-16 rounded-full ring-[3px] ring-white dark:ring-zinc-900 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                          <img 
                            src="https://github.com/shuakami.png"
                            alt="头像"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                          编辑资料
                        </Button>
                      </div>
          
                      {/* 用户信息 */}
                      <div className="space-y-1.5">
                        <h3 className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
                          Shuakami
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>Luoxiaohei</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Hong Kong, China</span>
                        </div>
                      </div>
          
                      {/* 统计数据 */}
                      <div className="mt-3 flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">6</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">关注者</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">0</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">正在关注</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">9</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">项目</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),

      createVariant("Twitter Post", "twitter", "推特风格卡片",
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                推特动态
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-[380px] p-0">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src="https://github.com/shuakami.png" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Luoxiaohei</span>
                      <span className="text-blue-500">@2333_emmm</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500 text-sm">2小时</span>
                    </div>
                    <p className="mt-1">🎉 新版本发布！我们的UI组件库现在支持更多精美的 Tooltip 样式。哼哼。
                      #前端开发 #React #UI设计</p>
                    <div className="mt-3 flex gap-6 text-gray-500">
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>89</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>234</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-red-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>1.2k</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    ]),
  ]

  return <Showcase title="Tooltip 提示" categories={categories} />
}