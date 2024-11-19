import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect, memo, useCallback } from 'react'
import { Loader2 } from 'lucide-react'


// 1. 预加载策略优化
const componentMap = {
  button: () => import('@/[DEMO]/button'),
  avatar: () => import('@/[DEMO]/avatar'),
  dialog: () => import('@/[DEMO]/dialog'),
  toast: () => import('@/[DEMO]/toast'),
  'chat-list': () => import('@/[DEMO]/chat-list'),
}

// 2. 优化动态导入，使用 webpack magic comments
const ButtonShowcase = dynamic(
  () => import(/* webpackPrefetch: true */ '@/[DEMO]/button'),
  { ssr: false, loading: () => <ComponentLoader name="Button" /> }
)
const AvatarShowcase = dynamic(
  () => import(/* webpackPrefetch: true */ '@/[DEMO]/avatar'),
  { ssr: false, loading: () => <ComponentLoader name="Avatar" /> }
)
const DialogShowcase = dynamic(() => import('@/[DEMO]/dialog'), {
  loading: () => <ComponentLoader name="Dialog" />
})
const ToastShowcase = dynamic(() => import('@/[DEMO]/toast'), {
  loading: () => <ComponentLoader name="Toast" />
})
const ChatListShowcase = dynamic(() => import('@/[DEMO]/chat-list'), {
  loading: () => <ComponentLoader name="ChatList" />
})
const TooltipShowcase = dynamic(() => import('@/[DEMO]/tooltip'), {
  loading: () => <ComponentLoader name="Tooltip" />
})

// 加载占位组件
function ComponentLoader({ name }: { name: string }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">加载 {name} 组件...</span>
      </div>
    </div>
  )
}

interface DemoComponent {
  id: string
  name: string
  description: string
  component: React.ComponentType
  icon?: string
  bgColor?: string
  category?: string
}

const demoComponents: DemoComponent[] = [
  {
    id: 'button',
    name: '按钮组件',
    description: '展示各种按钮样式和变体',
    component: ButtonShowcase,
    icon: '🎨',
    bgColor: 'bg-gradient-to-br from-pink-500 to-orange-400',
    category: 'UI 基础组件'
  },
  {
    id: 'avatar',
    name: '头像组件',
    description: '展示不同类型的头像和状态',
    component: AvatarShowcase,
    icon: '😍',
    bgColor: 'bg-gradient-to-br from-blue-500 to-purple-400',
    category: 'UI 基础组件'
  },
  {
    id: 'dialog',
    name: '模态框组件',
    description: '展示不同类型的模态框',
    component: DialogShowcase,
    icon: '💬',
    bgColor: 'bg-gradient-to-br from-green-500 to-yellow-400',
    category: 'UI 基础组件'
  },
  {
    id: 'toast',
    name: '提示组件',
    description: '展示不同类型的提示',
    component: ToastShowcase,
    icon: '🔔',
    bgColor: 'bg-gradient-to-br from-red-500 to-orange-400',
    category: 'UI 基础组件'
  },
  {
    id: 'chat-list',
    name: '聊天列表组件',
    description: '展示不同类型的聊天列表',
    component: ChatListShowcase,
    icon: '🐋',
    bgColor: 'bg-gradient-to-br from-green-500 to-yellow-400',
    category: 'UI 基础组件'
  },
  {
    id: 'tooltip',
    name: '提示组件',
    description: '展示不同类型的提示',
    component: TooltipShowcase,
    icon: '👓',
    bgColor: 'bg-gradient-to-br from-blue-500 to-purple-400',
    category: 'UI 基础组件'
  }
]

// 3. 优化预加载函数
const preloadComponent = (id: string) => {
  const importFn = componentMap[id as keyof typeof componentMap]
  if (importFn) {
    // 立即开始预加载
    importFn()
  }
}

// 4. 优化 DemoCard 组件
const DemoCard = memo(({ demo, onClick }: { demo: DemoComponent; onClick: () => void }) => {
  // 使用 useCallback 优化预加载触发
  const handleMouseEnter = useCallback(() => {
    preloadComponent(demo.id)
  }, [demo.id])

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      className={`
        group relative rounded-xl p-4 sm:p-8
        bg-white/50 dark:bg-gray-900/50
        backdrop-blur-sm
        transition-all duration-300
        cursor-pointer
        border border-gray-200/60 dark:border-gray-800/60
        min-h-[200px] sm:min-h-[240px] flex flex-col
        hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50
        hover:border-gray-300 dark:hover:border-gray-700
        hover:translate-y-[-2px]
      `}
    >
      <div className="relative flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          {demo.icon && <span className="text-3xl">{demo.icon}</span>}
          {demo.category && (
            <div className="text-xs font-medium 
              text-gray-600 dark:text-gray-400
              px-3 py-1 rounded-full 
              bg-gray-100 dark:bg-gray-800">
              {demo.category}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100
            group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {demo.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {demo.description}
          </p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            点击查看详情
          </span>
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 
            group-hover:text-blue-500 dark:group-hover:text-blue-400 
            transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  )
})
DemoCard.displayName = 'DemoCard'

// 5. 优化主页面组件
export default function DemoPage() {
  const router = useRouter()
  const { demo } = router.query
  const [mounted, setMounted] = useState(false)

  // 6. 优化初始加载
  useEffect(() => {
    setMounted(true)
    
    // 预加载最常用的组件
    if (!demo) {
      preloadComponent('button')
      // 使用 requestIdleCallback 在空闲时间预加载其他组件
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          preloadComponent('avatar')
          preloadComponent('dialog')
        })
      }
    }
  }, [demo])

  // 7. 优化组件渲染
  const renderDemo = useCallback(() => {
    if (!demo) return null
    const DemoComponent = demoComponents.find(d => d.id === demo)?.component
    if (!DemoComponent) {
      router.replace('/blurdemo')
      return null
    }
    
    return (
      <Suspense fallback={<ComponentLoader name={demo as string} />}>
        <DemoComponent />
      </Suspense>
    )
  }, [demo, router])

  if (!mounted) return null

  if (demo) return renderDemo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-md md:max-w-7xl mx-auto min-h-screen flex flex-col px-3 sm:px-6 md:px-8">
        <header className="py-8 sm:py-16">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-50 dark:to-gray-300 bg-clip-text text-transparent mb-3 sm:mb-4">
            Blur Design
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
            现代、直观且高度可定制的组件库，为您的应用提供优雅的设计解决方案
          </p>
          {process.env.NODE_ENV === 'production' && (
            <p className="text-red-500">
              为了确保用户体验，生产环境中不会包含构建本页面的CSS，因此您可能会看到显示异常的情况，这属于正常现象。
            </p>
          )}
        </header>

        <main className="flex-1">
          <div className="mb-6 sm:mb-10">
            <h2 className="text-lg sm:text-2xl font-medium text-gray-900 dark:text-gray-100">
              组件列表
            </h2>
          </div>

          <div className="grid gap-3 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12 sm:mb-20">
            {demoComponents.map((demo) => (
              <DemoCard
                key={demo.id}
                demo={demo}
                onClick={() => router.push(`/blurdemo?demo=${demo.id}`)}
              />
            ))}
          </div>
        </main>

        <footer className="py-6 sm:py-10 border-t border-gray-200/60 dark:border-gray-800/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-light tracking-wide">Powered by</span>
              <span className="text-gray-900 dark:text-gray-100 tracking-tight">
                Blur <span className="text-gray-400 dark:text-gray-600 font-extralight"> / </span> Design
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                使用文档
              </a>
              <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                技术支持
              </a>
              <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                更新记录
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}