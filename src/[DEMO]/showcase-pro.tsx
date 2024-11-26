import { useTheme } from "next-themes"
import { useState, useEffect, memo, useCallback } from "react"
import { Moon, Sun, ArrowLeft, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShowcaseProps, ShowcaseVariant } from "./utils"
import dynamic from 'next/dynamic'

// 动态导入 VariantItem 组件
const DynamicVariantItem = dynamic(() => 
  import('./VariantItem').then(mod => mod.VariantItem), {
  loading: () => <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-900 rounded-xl" />
})

// 记忆化侧边栏按钮组件
const SidebarButton = memo(({ 
  id, 
  name, 
  description, 
  isActive, 
  onClick 
}: { 
  id: string
  name: string
  description?: string
  isActive: boolean
  onClick: (id: string) => void
}) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full text-left group flex flex-col px-4 py-3 rounded-lg
      transition-colors duration-200
      ${isActive 
        ? 'bg-gray-100 dark:bg-gray-900' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
      }`}
  >
    <span className="text-gray-900 dark:text-gray-100 font-medium">
      {name}
    </span>
    {description && (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {description}
      </span>
    )}
  </button>
))
SidebarButton.displayName = 'SidebarButton'

// 记忆化主题切换按钮
const ThemeToggle = memo(({ theme, onToggle }: { 
  theme: string | undefined
  onToggle: () => void 
}) => (
  <Button
    variant="outline"
    size="icon"
    onClick={onToggle}
    className="h-10 w-10 rounded-full"
  >
    {theme === "dark" ? (
      <Sun className="h-[1.2rem] w-[1.2rem]" />
    ) : (
      <Moon className="h-[1.2rem] w-[1.2rem]" />
    )}
  </Button>
))
ThemeToggle.displayName = 'ThemeToggle'

// 添加移动端侧边栏组件
const MobileSidebar = memo(({ 
  isOpen, 
  onClose, 
  categories, 
  activeCategory, 
  onCategoryChange 
}: { 
  isOpen: boolean
  onClose: () => void
  categories: ShowcaseProps['categories']
  activeCategory: string
  onCategoryChange: (id: string) => void
}) => (
  <div className={`
    md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-950
    transform transition-transform duration-300
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `}>
    <div className="p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="mb-4"
      >
        <X className="h-5 w-5" />
      </Button>
      <nav className="space-y-1">
        {categories.map((category) => (
          <SidebarButton
            key={category.id}
            id={category.id}
            name={category.name}
            description={category.description}
            isActive={activeCategory === category.id}
            onClick={(id) => {
              onCategoryChange(id)
              onClose()
            }}
          />
        ))}
      </nav>
    </div>
  </div>
))
MobileSidebar.displayName = 'MobileSidebar'

export default function ShowcasePro({ title, categories }: ShowcaseProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  
  // 修改 handleCategoryChange 函数
  const handleCategoryChange = useCallback((categoryId: string) => {
    const currentScroll = window.scrollY
    setActiveCategory(categoryId)
    window.location.hash = `${categoryId}:${currentScroll}`
  }, [])

  // 修改初始化活动分类和滚动位置的逻辑
  const [activeCategory, setActiveCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      const [categoryId, scrollPosition] = hash.split(':')
      
      // 如果有保存的滚动位置，延迟执行滚动
      if (scrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(scrollPosition))
        }, 0)
      }
      
      return categories.some(c => c.id === categoryId) ? categoryId : categories[0]?.id
    }
    return categories[0]?.id
  })

  // 修改 hash 变化处理函数
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      const [categoryId, scrollPosition] = hash.split(':')
      
      if (categories.some(c => c.id === categoryId)) {
        setActiveCategory(categoryId)
        if (scrollPosition) {
          window.scrollTo(0, parseInt(scrollPosition))
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [categories])

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen" />
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-md md:max-w-7xl px-4 sm:px-6 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mt-6 sm:mt-12">
            <div className="flex items-center gap-4">
              <Link href={{ pathname: '/blurdemo' }}>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* 添加移动端菜单按钮 */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsNavOpen(true)}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full md:hidden"
              >
                <Menu className="h-[1.2rem] w-[1.2rem]" />
              </Button>
              <ThemeToggle 
                theme={theme} 
                onToggle={handleThemeToggle} 
              />
            </div>
          </div>
        </header>

        {/* 移动端侧边栏 */}
        <MobileSidebar
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Main Content */}
        <div className="flex gap-8">
          {/* 桌面端侧边栏 */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <nav className="fixed w-64 space-y-1">
              {categories.map((category) => (
                <SidebarButton
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  description={category.description}
                  isActive={activeCategory === category.id}
                  onClick={handleCategoryChange}
                />
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="p-4 sm:p-8 max-w-4xl mx-auto">
              {/* 只渲染当前激活的分类 */}
              {categories
                .filter(category => category.id === activeCategory)
                .map((category) => (
                  <div 
                    key={category.id}
                    className="space-y-8 sm:space-y-12"
                  >
                    {category.variants.map((variant) => (
                      <DynamicVariantItem key={variant.variant} variant={variant} />
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}