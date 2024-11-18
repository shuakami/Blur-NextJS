import { Button } from "@/components/ui/button"
import Showcase from "./showcase"
import { createCategory, createVariant } from "./utils"

export default function ButtonShowcase() {
  const buttonCategories = [
    createCategory("basic", "基础按钮", "常用的基础按钮样式", [
      createVariant("Default", "default", "默认按钮样式",
        <Button variant="default">Default</Button>
      ),
      createVariant("Secondary", "secondary", "次要按钮",
        <Button variant="secondary">Secondary</Button>
      ),
      createVariant("Outline", "outline", "轮廓按钮",
        <Button variant="outline">Outline</Button>
      ),
      createVariant("Ghost", "ghost", "幽灵按钮",
        <Button variant="ghost">Ghost</Button>
      )
    ]),
    
    createCategory("special", "特殊效果", "具有特殊视觉效果的按钮", [
      createVariant("Gradient", "gradient", "渐变效果",
        <Button variant="gradient">Gradient</Button>
      ),
      createVariant("Glass", "glass", "毛玻璃效果",
        <Button variant="glass">Glass</Button>
      ),
      createVariant("Neon", "neon", "霓虹效果",
        <Button variant="neon">Neon</Button>
      ),
      createVariant("Shine", "shine", "光效按钮",
        <Button variant="shine">Shine</Button>
      ),
      createVariant("Gooey", "gooey", "流体效果",
        <Button variant="gooey">Gooey</Button>
      ),
      createVariant("Wheat", "wheat", "暖色渐变",
        <Button variant="wheat">Wheat</Button>
      ),
      createVariant("Retro", "retro", "复古风格",
        <Button variant="retro">Retro</Button>
      )
    ]),
    
    createCategory("state", "状态按钮", "不同状态的按钮样式", [
      createVariant("Destructive", "destructive", "危险操作",
        <Button variant="destructive">Destructive</Button>
      ),
      createVariant("Link", "link", "链接样式",
        <Button variant="link">Link</Button>
      ),
      createVariant("Soft", "soft", "柔和样式",
        <Button variant="soft">Soft</Button>
      )
    ]),

    createCategory("sizes", "尺寸变体", "不同尺寸的按钮", [
      createVariant("Small", "sm", "小型按钮",
        <Button size="sm">Small</Button>
      ),
      createVariant("Default", "default", "默认尺寸",
        <Button size="default">Default</Button>
      ),
      createVariant("Large", "lg", "大型按钮",
        <Button size="lg">Large</Button>
      ),
      createVariant("Icon", "icon", "图标按钮",
        <Button size="icon">
          <span className="i-lucide-plus h-4 w-4" />
        </Button>
      )
    ])
  ]

  return (
    <Showcase 
      title="Button Variants" 
      categories={buttonCategories} 
    />
  )
}