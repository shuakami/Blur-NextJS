import { useTheme } from "next-themes"
import { useState, useEffect, memo, useCallback } from "react"
import { Moon, Sun, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShowcaseProps, ShowcaseVariant } from "./utils"

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

// 记忆化变体组件
const VariantItem = memo(({ variant }: { variant: ShowcaseVariant }) => (
  <div className="mb-8 last:mb-0">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {variant.name}
        </h3>
        {variant.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {variant.description}
          </p>
        )}
      </div>
      <code className="text-xs text-gray-500 dark:text-gray-400 font-mono">
        variant="{variant.variant}"
      </code>
    </div>
    <div className="px-4">
      {variant.component}
    </div>
  </div>
))
VariantItem.displayName = 'VariantItem'

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

export default function ShowcasePro({ title, categories }: ShowcaseProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // 初始化活动分类
  const [activeCategory, setActiveCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      return categories.some(c => c.id === hash) ? hash : categories[0]?.id
    }
    return categories[0]?.id
  })

  // 优化事件处理函数
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId)
    window.location.hash = categoryId
  }, [])

  const handleThemeToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  // 处理 URL hash 变化
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (categories.some(c => c.id === hash)) {
        setActiveCategory(hash)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [categories])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen" />
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mt-12">
            <div className="flex items-center gap-4">
              <Link href="/blurdemo">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
            </div>
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
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
            <div className="p-8">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className={`${activeCategory === category.id ? 'block' : 'hidden'} space-y-12`}
                >
                  {category.variants.map((variant) => (
                    <VariantItem key={variant.variant} variant={variant} />
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