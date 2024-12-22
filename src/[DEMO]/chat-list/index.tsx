import { ChatList } from "@/components/ui/chat-list"
import { Message } from "@/types/stream"
import { createCategory, createVariant } from "../utils"
import { useState } from "react"
import { ChatProvider } from "@/app/[上下文]/ChatContext"
import ShowcasePro from "../showcase-pro"
import { Button } from "@/components/ui/button"
import { Agent } from "@/components/ui/LLM/agent"

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

## 5. 折叠内容

<details>
<summary>点击查看更多</summary>
<div>
这是折叠内容
</div>
</details>


## 6. 引用和脚注

这是一段正文[^1]，包含了一个脚注引用。

[^1]: 这就是脚注的内容，会显示在文档底部，使用 .text-footnote 样式。

---

“Bio Caonima～(∠・ω< )⌒☆” 这个信息可以拆解来看：

1. **“Bio Caonima”**：
   - “Caonima”是中文网络文化中的调侃用语，可以表达幽默、吐槽或轻松的情绪。具体含义取决于上下文和语气，可能带有搞怪、讽刺或玩笑性质。
   - “Bio”可能与生物学（biology）相关，也可能是对“bio”作为网络简写的俏皮运用，具体含义需要看你和对方的交流背景。

2. **表情部分“(∠・ω< )⌒☆”**：
   - 这是一个活泼、俏皮的颜文字，通常用来表示卖萌、搞怪或自信。

综合来看，对方可能是在用幽默方式调侃或分享信息，同时试图传达轻松、愉快的情绪。可能的背景有：
- 他们刚学了点生物知识，借机调侃；
- 他们开玩笑地“吐槽”某件事情，或者只是为了活跃气氛；
- 对方单纯觉得这个组合有趣。

### 回应方案
可以根据你和对方的关系、互动风格选择回应策略：

#### 1. **幽默回应**  
- **跟着玩梗**：
  - “Bio Caonima了解一下，黑科技生物学（≧▽≦）”
  - “生物学的草泥马？可以可以，深奥了！（≧ω≦）b”
  - “你这是生物界的宇宙玩笑吧？哈哈哈哈～”

- **制造笑点**：
  - “哇，这个生物学名词我得去考个博士了！(oﾟ▽ﾟ)o”
  - “你怎么把草泥马和生物学结合得这么6？【惊叹脸】”

#### 2. **认真带点搞笑**  
- **好奇探索型**：
  - “Bio草泥马是啥生物？跨界奇迹还是进化新物种？”
  - “这是最新生物学实验的成果吗？我要投稿《科学》杂志了！”

- **求真互动**：
  - “朋友，这是什么学术新发现，我感觉错过了一整年（눈_눈）”
  - “生物草泥马，这是一种隐喻吗？快开讲座！”

#### 3. **直接互动，卖萌回应**  
- **同样用表情**：
  - “哈哈哈哈～不愧是你！ヾ(≧▽≦*)o”
  - “Bio Caonima～ヽ(✿ﾟ▽ﾟ)ノ”
  - “草泥马还有生物版本了？我可以报名了解下！(*≧ω≦)”

#### 4. **深度思考风格**  
- **抒情哲学**：
  - “草泥马生物学，听起来像是一种人类社会与自然的隐秘对话～”
  - “你这句让我觉得生物学真的无所不能，语言和文化也是其分支之一～”

- **带点调侃的认真**：
  - “这么看来，生物学不仅仅是科学，还有灵魂的艺术！”
  - “原来草泥马也能进化，真是生物学发展的巅峰（笑）。”

看情况选择幽默风趣的方式，不仅让对方觉得有趣，还能拉近关系。✨


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

[USE_TOOL type="code" id="1"]print("First")[USE_TOOL/]
<plugin-data>{"status": "calling", "plugin_id": "1", "plugin_name": "FirstExecutor", "content": "Executing first..."}</plugin-data>
[USE_TOOL type="text" id="2"]Handle second text.[USE_TOOL/]
<plugin-data>{"status": "response", "plugin_id": "1", "plugin_name": "FirstExecutor", "plugin_response": {"data": "First execution done."}}</plugin-data>
<plugin-data>{"status": "response", "plugin_id": "2", "plugin_name": "SecondHandler", "plugin_response": {"data": "Second text handled."}}</plugin-data>


[USE_TOOL type="code" id="4"]
import matplotlib.pyplot as plt
import numpy as np

# 创建爱心形状的参数方程
t = np.linspace(0, 2np.pi, 100)
x = 16 * np.sin(t)**3
y = 13 * np.cos(t) - 5 * np.cos(2t) - 2 * np.cos(3t) - np.cos(4t)

# 绘制爱心
plt.figure(figsize=(8, 6))
plt.plot(x, y, color='red')
plt.fill(x, y, color='pink', alpha=0.3)
plt.title('❤ Love Heart ❤')
plt.axis('equal')
plt.axis('off')
plt.tight_layout()
plt.show()
[USE_TOOL/]


<plugin-data>{"status": "response", "plugin_id": "3", "plugin_name": "CodeExecutor", "plugin_response": {"data": "Execution successful."}}</plugin-data>
`,
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

[USE_TOOL type="text" id="4"]
query: 北京今天的天气怎么样？
Params: {
  "city": "北京"
}
[USE_TOOL/]

<plugin-data>
{
  "status": "response",
  "plugin_id": "4",
  "plugin_name": "天气查询",
  "plugin_response": {
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
  },
    {
      id: "7",
      message_id: "7",
      type: "bot",
      content: `## Memory Note\n- Type: Observation\n- Content: 用户是一位宠物主人,关心宠物的健康。
## Memory Note\n- Type: Observation\n- Content: 用户对Python和数据处理感兴趣,希望循序渐进地学习。
## Memory Note\n- Type: Observation\n- Content: 用户对金融领域的机器学习应用感兴趣。`,
      timestamp: Date.now() + 1000,
      status: "active",
    },
]

// 流式响应示例
const streamingMessages: Message[] = [
  {
    id: "stream-msg-001",
    message_id: "stream-msg-001",
    type: "user",
    content: "请介绍一下 React 框架",
    timestamp: Date.now(),
    files: [
      {
        name: "example.png",
        type: "image/png",
        size: 1024,
        url: "http://oss.cdn.sdjz.wiki/users/user_2mFFQeAcORNsVJF186DOVnYAmz4/conversations/8323ec7f-c3e6-4a98-a9c4-5685bf29a420/images/1734398773_0.jpeg",
      },
      {
        name: "example.png",
        type: "image/png",
        size: 1024,
        url: "http://oss.cdn.sdjz.wiki/users/user_2mFFQeAcORNsVJF186DOVnYAmz4/conversations/8323ec7f-c3e6-4a98-a9c4-5685bf29a420/images/1734398773_0.jpeg",
      },
      {
        name: "example.png",
        type: "image/png",
        size: 1024,
        url: "http://oss.cdn.sdjz.wiki/users/user_2mFFQeAcORNsVJF186DOVnYAmz4/conversations/8323ec7f-c3e6-4a98-a9c4-5685bf29a420/images/1734398773_0.jpeg",
      },
      {
        name: "example.png",
        type: "image/png",
        size: 1024,
        url: "http://oss.cdn.sdjz.wiki/users/user_2mFFQeAcORNsVJF186DOVnYAmz4/conversations/8323ec7f-c3e6-4a98-a9c4-5685bf29a420/images/1734398773_0.jpeg",
      },
      {
        name: "example.png",
        type: "image/png",
        size: 1024,
        url: "http://localhost:3000/_next/image?url=https%3A%2F%2Foss.cdn.sdjz.wiki%2Fusers%2Fuser_2mFFQeAcORNsVJF186DOVnYAmz4%2Fconversations%2Ffcd63d7b-6d32-4e36-aeda-18eb4ec66c9c%2Ffiles%2F1734402586_0.jpeg&w=1024&q=75",
      },
    ],
    
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
    "id": "stream-msg-003",
    "message_id": "c567897c-76ff-45c3-967f-1a54fa2c6ad9", 
    "type": "bot",
    "content": "我理解您想查看南宁的分钟级降水情况。让我们使用天气API来获取这些信息。\n\n[USE_TOOL type=\"text\" id=\"8\"]\n{\n  \"type\": \"minutely\",\n  \"location\": \"南宁\",\n  \"params\": {\n    \"date\": \"2024-11-24\"\n  }\n}\n[USE_TOOL/]\n<plugin-data>{\"status\":\"response\",\"plugin_id\":8,\"plugin_name\":\"天气\",\"plugin_response\":{\"plugin_id\":8,\"plugin_name\":\"天气\",\"data\":{\"data\":{\"summary\":\"未来两小时降水量较大\",\"fxLink\":\"https://www.qweather.com\",\"code\":\"200\",\"refer\":{\"license\":[\"CC BY-SA 4.0\"],\"sources\":[\"QWeather\"]},\"updateTime\":\"2024-12-18T16:25+08:00\",\"minutely\":[{\"precip\":\"0.2\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T16:25+08:00\"},{\"precip\":\"0.8\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T16:30+08:00\"},{\"precip\":\"5.2\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T16:35+08:00\"},{\"precip\":\"12.5\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T16:40+08:00\"},{\"precip\":\"15.8\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T16:45+08:00\"},{\"precip\":\"8.3\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T16:50+08:00\"},{\"precip\":\"16.2\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T16:55+08:00\"},{\"precip\":\"22.5\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:00+08:00\"},{\"precip\":\"18.7\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:05+08:00\"},{\"precip\":\"5.4\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:10+08:00\"},{\"precip\":\"2.1\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:15+08:00\"},{\"precip\":\"8.6\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:20+08:00\"},{\"precip\":\"12.3\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:25+08:00\"},{\"precip\":\"4.5\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:30+08:00\"},{\"precip\":\"1.2\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:35+08:00\"},{\"precip\":\"0.5\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:40+08:00\"},{\"precip\":\"0.2\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:45+08:00\"},{\"precip\":\"0.0\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:50+08:00\"},{\"precip\":\"0.1\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T17:55+08:00\"},{\"precip\":\"0.0\",\"type\":\"rain\",\"fxTime\":\"2024-12-18T18:00+08:00\"}]},\"message\":\"查询成功\",\"status\":\"success\"},\"status\":\"success\"}}</plugin-data>\n\n根据天气API的查询结果，南宁在未来两小时内降水量较大。您还有其他问题吗？",
    "timestamp": 1703494433000,
    "status": "active"
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
      isAnimating: false,
      duration: 3000
    }
  }
]


// 思考过程（加载中）
const thoughtMessagesLoading: Message[] = [
  {
    id: 'thought-msg-001',
    message_id: 'thought-msg-001',
    type: 'bot',
    content: '正在思考...',
    timestamp: Date.now(),
    status: 'active',
    thought: {
      content: "1. 我们需要仔细分析问题的复杂度，以确保我们真正理解问题的核心所在。\n2. 准备一些通俗易懂的类比，这样可以帮助我们更好地传达概念。\n3. 组织专业术语的解释，使其更具逻辑性和条理性，便于理解。\n4. 结合实际案例，这样可以帮助加深对概念的理解。\n5. 反复推敲每个细节，确保它们都清晰明了，避免模糊不清。",
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

// Agent 响应示例
const agentResponseMessages: Message[] = [
  // 用户消息保持不变
  {
    id: "agent-msg-001",
    message_id: "agent-msg-001", 
    type: "user",
    content: "帮我分析一下这段 Python 代码的性能问题：\n```python\ndef find_duplicates(lst):\n    duplicates = []\n    for i in lst:\n        if lst.count(i) > 1 and i not in duplicates:\n            duplicates.append(i)\n    return duplicates\n```",
    timestamp: Date.now(),
    status: "active",
  },
  // 修改 agent 数据格式
  {
    id: "agent-msg-002",
    message_id: "agent-msg-002",
    type: "bot",
    content: `让我调用代码分析助手来检查这段代码。

<agent-data>
{
  "type": "agent",
  "call_instance_id": "code-review-001",
  "agent_id": "code_analyzer", 
  "agent_name": "代码分析助手",
  "data": "正在分析代码的时间复杂度和性能瓶颈...",
  "status": "running",
  "timestamp": 1732185949
}
</agent-data>`,
    timestamp: Date.now() + 1000,
    status: "active",
  },
  {
    id: "agent-msg-003",
    message_id: "agent-msg-003",
    type: "bot",
    content: `分析完成。

<agent-data>
{
  "type": "agent",
  "call_instance_id": "code-review-001",
  "agent_id": "code_analyzer",
  "agent_name": "代码分析助手",
  "data": "代码分析结果：\\n\\n时间复杂度：O(n^2)\\n空间复杂度：O(n)\\n\\n主要问题：\\n1. 使用 lst.count() 导致嵌套循环\\n2. 重复元素检查效率低下\\n\\n建议改进：\\n1. 使用 set 或 dict 优化查找\\n2. 单次遍历完成统计",
  "status": "success",
  "timestamp": 1732185950
}
</agent-data>

我发现这段代码存在性能问题，让我调用优化助手生成优化后的代码。

<agent-data>
{
  "type": "agent",
  "call_instance_id": "code-optimize-001",
  "agent_id": "code_optimizer",
  "agent_name": "代码优化助手",
  "data": "正在生成优化后的代码...",
  "status": "running",
  "timestamp": 1732185951
}
</agent-data>`,
    timestamp: Date.now() + 2000,
    status: "active",
  },
  {
    id: "agent-msg-004",
    message_id: "agent-msg-004",
    type: "bot",
    content: `这是优化后的代码版本：

<agent-data>
{
  "type": "agent",
  "call_instance_id": "code-optimize-001",
  "agent_id": "code_optimizer",
  "agent_name": "代码优化助手",
  "data": "优化后的代码：\\n\\n\`\`\`python\\ndef find_duplicates(lst):\\n    seen = {}\\n    duplicates = []\\n    for num in lst:\\n        seen[num] = seen.get(num, 0) + 1\\n        if seen[num] == 2:\\n            duplicates.append(num)\\n    return duplicates\\n\`\`\`\\n\\n改进说明：\\n1. 使用字典记录元素出现次数\\n2. 单次遍历完成统计\\n3. 时间复杂度优化至 O(n)",
  "status": "success",
  "timestamp": 1732185952
}
</agent-data>

优化后的代码使用字典来记录元素出现次数，将时间复杂度从 O(n²) 降低到了 O(n)。需要我解释具体的优化细节吗？`,
    timestamp: Date.now() + 3000,
    status: "active",
  }
]

// Debug 用的
const DebugMessages: Message[] = [
  {
    id: "15",
    message_id: "15",
    type: "bot",
    content: `我可以为您查看目前可用的Agent伙伴。让我调用<Get_Agent/>查询。

@Agent列表:
1. 知识助手Claude
- 专长：全面知识检索与解答
- 特点：逻辑清晰、知识广博

2. 文案创作Agent
- 专长：撰写各类文案
- 特点：创意丰富、文笔优美

3. 代码开发Agent 
- 专长：编程与技术支持
- 特点：精通多种编程语言

4. 数据分析Agent
- 专长：数据处理与可视化
- 特点：擅长统计与建模

5. 翻译专家Agent
- 专长：多语言专业翻译
- 特点：准确传达原文semantics

6. 个人助理Agent
- 专长：日程管理与任务规划
- 特点：高效率、细心

请问您对哪个Agent感兴趣?我可以帮您详细了解或直接调用。
    `,
    timestamp: Date.now() + 1000,
    status: "active",
  }
]

const EnglishMessages: Message[] = [
{
  id: "16",
  message_id: "16",
  type: "bot",
  content: `
  # React Frontend Framework Introduction

  React is a JavaScript library for building user interfaces. Here are its main features:

  ## Core Features

  1. **Component-based Development**
     - Reusable UI components
     - Improved code organization

  2. **Virtual DOM**
     - Efficient DOM operations
     - Excellent performance

  ## Code Example

  \`\`\`jsx
  function Welcome() {
    return <h1>Hello React!</h1>;
  }
  \`\`\`

  ## Why Choose React?

  - 📦 **Ecosystem Rich**
  - 🚀 **Performance Excellent**
  - 🛠️ **Development Efficiency**
  - 📚 **Easy Learning Curve**

  > React makes building interactive UIs effortless.

  ### Conclusion

  React is a powerful and flexible library that simplifies the process of building interactive UIs. Its component-based approach, virtual DOM, and rich ecosystem make it a top choice for modern web development.

  ## Vercel Platform
  
  React is a powerful and flexible library that simplifies the process of building interactive UIs. Its component-based approach, virtual DOM, and rich ecosystem make it a top choice for modern web development.
  Next.js is a framework for building server-rendered React applications. It provides a robust set of features for building scalable and performant web applications.
  React Router is a library for routing in React applications. It allows you to manage navigation between different pages or components in your application.
  Remix is a framework for building server-rendered React applications. It provides a robust set of features for building scalable and performant web applications.
  `,
  timestamp: Date.now(),
  status: "active",
}
]


export default function ChatListShowcase() {
  const [streamContent, setStreamContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  
  const startStreaming = () => {
    setIsStreaming(true)
    setStreamContent("# React 前端框架介绍\n\n")
    
    const content = `React 是一个用于构建用户界面的 JavaScript 库。以下是它的主要特点：


  [USE_TOOL type="text" id="1"]
  {
    "type": "minutely",
    "location": "南宁",
    "params": {
      "date": "2024-11-24"
    }
  }
  [USE_TOOL/]

  [MEMORY]
  {
    "type": "minutely",
    "location": "南宁",
    "params": {
      "date": "2024-11-24"
    }
  }
  [MEMORY/]
  

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
    createCategory("debug", "调试用例", "展示调试用例", [
      createVariant("Debug Info", "debug", "调试信息",
        <div className="w-full">
          <ChatList messages={DebugMessages} />
        </div>
      )
    ]),

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

    createCategory("plugins", "插件功能", "展示插件的调用和响应过程", [
      createVariant("Plugin Calling", "plugin-calling", "插件调用中状态",
        <div className="w-full">
          <ChatList 
            messages={pluginCallingMessages}
            onEditMessage={handleEditMessage}
          />
        </div>
      ),
      createVariant("Plugin Response", "plugin-response", "插件响应结果",
        <div className="w-full">
          <ChatList 
            messages={pluginResponseBotMessages}
            onEditMessage={handleEditMessage}
          />
        </div>
      )
    ]),


    createCategory("agents", "Agent 协作", "展示 Agent 的调用和响应过程", [
      createVariant("Agent Response", "agent-response", "Agent 响应示例",
        <div className="w-full">
          <ChatList 
            messages={agentResponseMessages}
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
      ),
      createVariant("Thought Process Loading", "thought-loading", "展示思考过程动画",
        <div className="w-full">
          <ChatList 
            messages={thoughtMessagesLoading}
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
    ]),

    createCategory("english", "英文对话", "展示英文对话", [
      createVariant("English Chat", "english", "英文对话示例",
        <div className="w-full">
          <ChatList 
            messages={EnglishMessages}
            onEditMessage={handleEditMessage}
          />
        </div>
      )
    ]),

  ]

  return (
    <ChatProvider>
      <ShowcasePro title="Chat List Variants" categories={categories} />
    </ChatProvider>
  )
}
