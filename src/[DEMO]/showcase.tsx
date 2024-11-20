import { useTheme } from "next-themes"
import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { Check, Copy, Moon, Sun, ArrowLeft, Code, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { ShowcaseProps, ShowcaseVariant, generateCode } from "./utils"
import CodeBlock from "@/components/ui/markdown/code"

// 记忆化导航项组件
const NavItem = memo(({ 
  id, 
  name, 
  description,
  onClick 
}: { 
  id: string
  name: string
  description?: string
  onClick?: () => void
}) => (
  <a
    href={`#${id}`}
    className="group flex flex-col px-4 py-3 rounded-lg
      hover:bg-gray-100 dark:hover:bg-gray-900
      transition-colors duration-200"
    onClick={(e) => {
      // 防止默认的锚点跳转行为
      e.preventDefault()
      // 平滑滚动到目标位置
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      // 触发关闭导航栏回调
      onClick?.()
    }}
  >
    <span className="text-gray-900 dark:text-gray-100 font-medium">
      {name}
    </span>
    {description && (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {description}
      </span>
    )}
  </a>
))
NavItem.displayName = 'NavItem'

// 记忆化变体卡片组件
const VariantCard = memo(({ 
  variant, 
  onShowCode 
}: { 
  variant: ShowcaseVariant; 
  onShowCode: (variant: ShowcaseVariant) => void 
}) => (
  <div className="group flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 
    bg-white dark:bg-gray-950 p-5
    hover:border-gray-300 dark:hover:border-gray-700
    transition-all duration-200"
  >
    <div className="relative w-full flex items-center justify-center min-h-[80px] mb-4">
      <div className="relative z-10">
        {variant.component}
      </div>
    </div>

    <div className="mt-auto">
      {variant.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {variant.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">
          variant=&quot;{variant.variant}&quot;
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onShowCode(variant)}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
))
VariantCard.displayName = 'VariantCard'

// 代码预览对话框组件
const CodePreviewDialog = memo(({ 
  variant, 
  onClose 
}: { 
  variant: ShowcaseVariant | null; 
  onClose: () => void 
}) => {
  const [copied, setCopied] = useState(false)

  const code = useMemo(() => {
    if (!variant) return ''
    try {
      return generateCode(variant.component)
    } catch (error) {
      return '// Error generating code preview'
    }
  }, [variant])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  if (!variant) return null

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Code className="h-5 w-5" />
            {variant.name}
          </DialogTitle>
        </DialogHeader>

        <div className="relative rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="sticky top-0 z-50">
            <div className="absolute right-3 top-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <div className="w-full max-h-[340px] p-4">
              <CodeBlock 
                language="tsx"
                forceRenderBlock={true}
                code={code}
              />
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-gray-100">变体：</span>
          <code className="ml-1 font-mono">variant=&quot;{variant.variant}&quot;</code>
        </div>
      </DialogContent>
    </Dialog>
  )
})
CodePreviewDialog.displayName = 'CodePreviewDialog'

export default function Showcase({ title, categories }: ShowcaseProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<ShowcaseVariant | null>(null)
  const [isNavOpen, setIsNavOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen" />
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-md md:max-w-6xl px-4 sm:px-6 py-6">
        <header className="mb-8 sm:mb-16">
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full md:hidden"
              >
                <Menu className="h-[1.2rem] w-[1.2rem]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className={`
            md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-950
            transform transition-transform duration-300
            ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNavOpen(false)}
                className="mb-4"
              >
                <X className="h-5 w-5" />
              </Button>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <NavItem
                    key={category.id}
                    id={category.id}
                    name={category.name}
                    description={category.description}
                    onClick={() => setIsNavOpen(false)}
                  />
                ))}
              </nav>
            </div>
          </div>

          <div className="hidden md:block w-64 flex-shrink-0">
            <nav className="fixed w-64 space-y-1">
              {categories.map((category) => (
                <NavItem
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  description={category.description}
                />
              ))}
            </nav>
          </div>

          <div className="flex-1 space-y-12 md:space-y-16">
            {categories.map((category) => (
              <section key={category.id} id={category.id}>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8">
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.variants.map((variant) => (
                    <VariantCard
                      key={variant.variant}
                      variant={variant}
                      onShowCode={setSelectedVariant}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <CodePreviewDialog
        variant={selectedVariant}
        onClose={() => setSelectedVariant(null)}
      />
    </div>
  )
}