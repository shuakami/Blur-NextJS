import { ChatList } from "@/components/ui/chat-list"
import { Message } from "@/types/stream"
import { createCategory, createVariant } from "../utils"
import { useState } from "react"
import { ChatProvider } from "@/app/[上下文]/ChatContext"
import ShowcasePro from "../showcase-pro"
import { Button } from "@/components/ui/button"

// 基础对话示例
const basicMessages: Message[] = [
    {
      id: "basic-msg-001",
      message_id: "basic-msg-001",
      type: "user",
      content: "你好，请介绍一下你自己，并展示一下你的各种能力。",
      timestamp: Date.now(),
      status: "active",
    },
    {
      id: "basic-msg-002",
      message_id: "basic-msg-002",
      type: "bot",
      content: `# 你好，我是 AI 助手 👋
  
  我可以帮助你完成多种任务，包括但不限于：
  
  ## 1. 编写代码
  比如一个简单的 React 组件：
  
  \`\`\`tsx
  const Greeting: React.FC<{ name: string }> = ({ name }) => {
    return (
      <div className="p-4 rounded-lg bg-blue-100">
        <h1 className="text-xl font-bold">Hello, {name}!</h1>
      </div>
    );
  };
  \`\`\`
  
  ## 2. 生成图片链接
  这是一个必应每日壁纸：
  ![必应每日壁纸](https://cn.bing.com/th?id=OHR.PorthcawlLighthouse_ZH-CN6655235820_1920x1080.jpg)
  
  ## 3. 格式化文本
  我可以使用多种格式来展示内容：
  - **粗体文本**
  - *斜体文本*
  - ~~删除线文本~~
  - \`代码文本\`
  
  ## 4. 创建表格
  | 功能 | 描述 |
  |------|------|
  | Markdown | 支持完整的 Markdown 语法 |
  | 代码高亮 | 支持多种编程语言 |
  | 实时响应 | 快速的交互体验 |
  
  > 💡 我会不断学习和进步，为你提供更好的服务！`,
      timestamp: Date.now() + 1000,
      status: "active",
    },
    {
      id: "basic-msg-003",
      message_id: "basic-msg-003",
      type: "user",
      content: "太棒了！能给我写一个简单的 Python 爬虫代码示例吗？",
      timestamp: Date.now() + 2000,
      status: "active",
    },
    {
      id: "basic-msg-004",
      message_id: "basic-msg-004",
      type: "bot",
      content: `好的，这是一个使用 Python requests 和 BeautifulSoup 的简单爬虫示例：
  
  \`\`\`python
  import requests
  from bs4 import BeautifulSoup
  import pandas as pd
  
  def scrape_website():
      # 发送 HTTP 请求
      url = "https://example.com"
      response = requests.get(url)
      
      # 确保请求成功
      if response.status_code == 200:
          # 解析 HTML
          soup = BeautifulSoup(response.text, 'html.parser')
          
          # 查找所有文章标题
          articles = soup.find_all('article')
          
          # 提取数据
          data = []
          for article in articles:
              title = article.find('h2').text.strip()
              summary = article.find('p').text.strip()
              data.append({
                  'title': title,
                  'summary': summary
              })
          
          # 转换为 DataFrame
          df = pd.DataFrame(data)
          return df
      
      return None
  
  # 运行爬虫
  results = scrape_website()
  print(results)
  \`\`\`
  
  这个爬虫代码包含了以下特点：
  1. 使用 requests 发送 HTTP 请求
  2. 使用 BeautifulSoup 解析 HTML
  3. 数据整理和存储
  4. 错误处理
  
  你可以根据具体需求修改选择器和数据处理逻辑。`,
      timestamp: Date.now() + 3000,
      status: "active",
    },
    {
      id: "basic-msg-005",
      message_id: "basic-msg-005",
      type: "user",
      content: "能展示一下数学公式和图表的渲染效果吗？",
      timestamp: Date.now() + 4000,
      status: "active",
    },
    {
      id: "basic-msg-006",
      message_id: "basic-msg-006",
      type: "bot",
      content: `当然可以！以下是一些数学公式和图表的示例：

## 数学公式
这是一个二次方程的求根公式：

$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

一个矩阵示例：

$$
\\begin{bmatrix} 
1 & 2 & 3 \\\\
4 & 5 & 6 \\\\
7 & 8 & 9
\\end{bmatrix}
$$

## Mermaid 图表
这是一个流程图：

\`\`\`mermaid
graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[显示登录页]
    C --> E[结束]
    D --> E
\`\`\`

这是一个时序图：

\`\`\`mermaid
sequenceDiagram
    参与者 A as 用户
    参与者 B as 系统
    A->>B: 发送请求
    B->>B: 处理请求
    B->>A: 返回响应
\`\`\``,
      timestamp: Date.now() + 5000,
      status: "active",
    },
    {
      id: "basic-msg-007",
      message_id: "basic-msg-007",
      type: "user",
      content: "能展示一下如何处理多语言内容吗？",
      timestamp: Date.now() + 6000,
      status: "active",
    },
    {
      id: "basic-msg-008",
      message_id: "basic-msg-008",
      type: "bot",
      content: `# 多语言支持演示 🌍

## 1. 不同语言的问候
- 中文：你好，世界！
- English: Hello, World!
- 日本語：こんにちは、世界！
- Español: ¡Hola, Mundo!
- Français: Bonjour, le Monde!
- Русский: Привет, мир!
- العربية: مرحبا بالعالم!

## 2. 代码中的多语言注释

\`\`\`python
def greet(name, language='en'):
    greetings = {
        'en': 'Hello',     # 英语
        'zh': '你好',      # 中文
        'ja': 'こんにちは', # 日语
        'es': '¡Hola',     # 西班牙语
    }
    return f"{greetings.get(language, 'Hello')} {name}!"
\`\`\`

## 3. Unicode 表情符号支持
- 天气：🌞 ⛅ 🌧️ ❄️
- 动物：🐼 🐉 🦁 🐘
- 食物：🍜 🍣 🥐 🥗
- 活动：🏃‍♂️ 🎮 🎨 🎭

## 4. RTL 文本支持
<div dir="rtl">
مرحبا بكم في عرض توضيحي للغة العربية
</div>`,
      timestamp: Date.now() + 7000,
      status: "active",
    },
    {
      id: "basic-msg-009",
      message_id: "basic-msg-009",
      type: "user",
      content: "能展示一下如何处理复杂的数据可视化吗？",
      timestamp: Date.now() + 8000,
      status: "active",
    },
    {
      id: "basic-msg-010",
      message_id: "basic-msg-010",
      type: "bot",
      content: `# 数据可视化示例 📊

## 1. 柱状图示例
\`\`\`mermaid
gantt
    title 项目进度表
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析    :2024-01-01, 30d
    UI设计     :2024-01-15, 45d
    section 开发阶段
    前端开发    :2024-02-01, 60d
    后端开发    :2024-02-15, 60d
    section 测试阶段
    单元测试    :2024-04-01, 30d
    集成测试    :2024-04-15, 30d
\`\`\`

## 2. JSON 数据结构
\`\`\`json
{
  "dataPoints": [
    {
      "year": 2020,
      "values": {
        "sales": 1234567,
        "growth": 23.4,
        "categories": {
          "online": 45.6,
          "retail": 54.4
        }
      }
    }
  ]
}
\`\`\`

## 3. 高级 CSS 效果
\`\`\`css
.gradient-text {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  color: transparent;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
\`\`\`

## 4. 键值对展示
| 指标 | 数值 | 变化趋势 |
|------|------|----------|
| 用户增长 | 123.4k | ↗️ +12.3% |
| 活跃度 | 89.7% | ↘️ -2.1% |
| 转化率 | 5.4% | ↗️ +0.8% |
| 留存率 | 67.2% | → 0% |

> 💡 这些只是基础示例，实际应用中可以集成更多高级的可视化库和工具！`,
      timestamp: Date.now() + 9000,
      status: "active",
    }
  ]

// 插件调用中状态
const pluginCallingMessages: Message[] = [
  {
    id: "3",
    message_id: "3",
    type: "user",
    content: "北京今天的天气怎么样？",
    timestamp: Date.now(),
    status: "active",
  },
  {
    id: "4",
    message_id: "4",
    type: "bot",
    content: `让我帮你查询北京的天气信息。

<plugin-data>
{
  "status": "calling",
  "plugin_id": "weather-plugin",
  "plugin_name": "天气查询"
}
</plugin-data>`,
    timestamp: Date.now() + 1000,
    status: "active",
  }
]

// 插件响应状态 - 机器人回复
const pluginResponseBotMessages: Message[] = [
  {
    id: "7",
    message_id: "7",
    type: "bot",
    content: `ok了。

<plugin-data>
{
  "status": "response",
  "plugin_response": {
    "plugin_id": "weather-plugin",
    "plugin_name": "天气查询",
    "data": {
      "city": "北京",
      "temperature": "25",
      "weather": "晴",
      "humidity": "45"
    },
    "status": "success"
  }
}
</plugin-data>

根据查询结果，北京今天天气晴朗，气温25°C，湿度45%。`,
    timestamp: Date.now() + 1000,
    status: "active",
  }
]

// 流式响应示例
const streamingMessages: Message[] = [
  {
    id: "stream-msg-001",
    message_id: "stream-msg-001",
    type: "user",
    content: "请介绍一下 React 框架",
    timestamp: Date.now(),
    status: "active",
  },
  {
    id: "stream-msg-002",
    message_id: "stream-msg-002",
    type: "bot",
    content: "点击\"开始流式响应\"查看效果",
    timestamp: Date.now() + 1000,
    status: "active",
  }
]

// 思考过程示例
const thoughtMessages: Message[] = [
  {
    id: "9",
    message_id: "9",
    type: "user",
    content: "解释一下量子计算的基本原理",
    timestamp: Date.now(),
    status: "active",
  },
  {
    id: "10",
    message_id: "10",
    type: "bot",
    content: "量子计算是一种利用量子力学原理进行计算的技术。与传统计算机使用比特（0或1）不同，量子计算机使用量子比特，可以同时处于多个状态。这种特性使得量子计算机在某些特定问题上具有巨大的优势。",
    timestamp: Date.now() + 1000,
    status: "active",
    thought: {
      content: "1. 分析问题复杂度\n2. 准备通俗易懂的类比\n3. 组织专业术语解释",
      isAnimating: true,
      duration: 3000
    }
  }
]

// 加载状态示例
const loadingMessages: Message[] = [
  {
    id: "11",
    message_id: "11",
    type: "user",
    content: "请生成一篇关于人工智能的文章",
    timestamp: Date.now(),
    status: "active",
  },
  {
    id: "12",
    message_id: "12",
    type: "bot",
    content: "正在生成文章，请稍候...",
    timestamp: Date.now() + 1000,
  }
]

// 错误状态示例
const errorMessages: Message[] = [
  {
    id: "13",
    message_id: "13",
    type: "user",
    content: "这是一个会触发错误的请求",
    timestamp: Date.now(),
    status: "active",
  },
  {
    id: "14",
    message_id: "14",
    type: "bot",
    content: "抱歉，处理您的请求时出现错误。",
    timestamp: Date.now() + 1000,
    status: "active",
    error: {
      code: 500,
      message: "API 调用失败，请稍后重试"
    }
  }
]

export default function ChatListShowcase() {
  const [streamContent, setStreamContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  
  const startStreaming = () => {
    setIsStreaming(true)
    setStreamContent("# React 前端框架介绍\n\n")
    
    const content = `React 是一个用于构建用户界面的 JavaScript 库。以下是它的主要特点：

## 核心特性

1. **组件化开发**
   - 可重用的 UI 组件
   - 更好的代码组织

2. **虚拟 DOM**
   - 高效的 DOM 操作
   - 优秀的性能表现

## 代码示例

\`\`\`jsx
function Welcome() {
  return <h1>Hello React!</h1>;
}
\`\`\`

## 为什么选择 React？

- 📦 **生态系统丰富**
- 🚀 **性能出色**
- 🛠️ **开发效率高**
- 📚 **学习曲线平缓**

> React 让构建交互式 UI 变得轻而易举。`;

    const chars = Array.from(content);
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < chars.length) {
        setStreamContent(prev => prev + chars[index]);
        index++;
      } else {
        clearInterval(timer);
        setIsStreaming(false);
      }
    }, 50);

    return () => {
      clearInterval(timer);
      setStreamContent("# React 前端框架介绍\n\n" + content);
      setIsStreaming(false);
    };
  }

  const handleEditMessage = async (id: string, newContent: string) => {
    console.log('编辑消息:', id, newContent)
  }

  const categories = [
    createCategory("basic", "基础对话", "展示基本的对话流程", [
      createVariant("Basic Chat", "basic", "基础的问答对话",
        <div className="w-full">
          <ChatList 
            messages={basicMessages} 
            onEditMessage={handleEditMessage}
          />
        </div>
      )
    ]),

    createCategory("plugins_calling", "插件功能（调用中）", "展示插件的调用过程", [
      createVariant("Plugin Calling", "plugin-calling", "插件调用中状态",
        <div className="w-full">
          <ChatList 
            messages={pluginCallingMessages}
            onEditMessage={handleEditMessage}
          />
        </div>
      )
    ]),
    
    createCategory("plugins_response", "插件功能（响应）", "展示插件的响应过程", [
      createVariant("Plugin Response", "plugin-response", "插件响应结果",
        <div className="w-full">
          <ChatList 
            messages={pluginResponseBotMessages}
            onEditMessage={handleEditMessage}
          />
        </div>
      )
    ]),

    createCategory("streaming", "流式响应", "展示实时生成的文本", [
      createVariant("Streaming Text", "streaming", "文本流式生成",
        <div className="w-full">
          <div className="mb-4">
            <Button
              variant="link"
              onClick={startStreaming}
              disabled={isStreaming}
            >
              {isStreaming ? "生成中..." : "开始流式响应"}
            </Button>
          </div>
          <ChatList 
            messages={[
              streamingMessages[0],
              {
                ...streamingMessages[1],
                content: streamContent
              }
            ]} 
            onEditMessage={handleEditMessage}
          />
        </div>
      )
    ]),

    createCategory("thoughts", "思考过程", "展示AI的思考过程", [
      createVariant("Thought Process", "thought", "展示思考过程动画",
        <div className="w-full">
          <ChatList 
            messages={thoughtMessages}
            onEditMessage={handleEditMessage}
          />
        </div>
      )
    ]),

    createCategory("loading_state", "加载状态展示", "展示加载状态", [
      createVariant("Loading State", "loading", "加载状态示例",
        <div className="w-full">
          <ChatList 
            messages={loadingMessages}
            isLoading={true}
            onEditMessage={handleEditMessage}
          />
        </div>
      )
    ]),

    createCategory("error_state", "错误状态展示", "展示错误状态", [
      createVariant("Error State", "error", "错误状态示例",
        <div className="w-full">
          <ChatList 
            messages={errorMessages}
            onEditMessage={handleEditMessage}
          />
        </div>
      )
    ])
  ]

  return (
    <ChatProvider>
      <ShowcasePro title="Chat List Variants" categories={categories} />
    </ChatProvider>
  )
}
