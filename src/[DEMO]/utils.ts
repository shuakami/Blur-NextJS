import React from 'react'

export interface ShowcaseVariant {
  name: string
  variant: string
  description?: string
  component: React.ReactNode
}

export interface ShowcaseCategory {
  id: string
  name: string
  description: string
  variants: ShowcaseVariant[]
}

export interface ShowcaseProps {
  title: string
  categories: ShowcaseCategory[]
}

// 创建变体的辅助函数
export const createVariant = (
  name: string,
  variant: string,
  description: string,
  component: React.ReactNode
): ShowcaseVariant => ({
  name,
  variant,
  description,
  component
})

// 创建分类的辅助函数
export const createCategory = (
  id: string,
  name: string,
  description: string,
  variants: ShowcaseVariant[]
): ShowcaseCategory => ({
  id,
  name,
  description,
  variants
})

// 新增：用于生成代码预览的函数
export const generateCode = (component: React.ReactNode): string => {
  if (!React.isValidElement(component)) {
    return '// Invalid component'
  }

  const { type, props } = component
  // 获取组件名称
  const componentName = typeof type === 'string' ? type : (type as any).displayName || 'Component'

  // 处理 props
  const propsString = Object.entries(props)
    .filter(([key]) => key !== 'children' && key !== 'key' && key !== 'ref')
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`
      }
      if (typeof value === 'boolean' && value) {
        return key
      }
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(' ')

  // 处理子元素
  const children = props.children
  if (!children) {
    return `<${componentName} ${propsString} />`
  }

  if (typeof children === 'string') {
    return `<${componentName} ${propsString}>${children}</${componentName}>`
  }

  const childrenString = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return generateCode(child)
    }
    return String(child)
  })?.join('\n  ')

  return `<${componentName} ${propsString}>\n  ${childrenString}\n</${componentName}>`
}