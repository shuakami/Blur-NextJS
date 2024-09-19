import React from 'react';
import { MarkdownRenderer, Style } from '@/components/ui/MarkdownRenderer'; // 引入你定义的组件

// 示例 Markdown 内容
const markdownContent = `
# Heading 1
这是一个示例文本，使用 **Heading 1** 来显示主要标题。

## Heading 2
使用 **Heading 2** 来展示次级标题。正文可以包含 **加粗** 和 *斜体*。

### Heading 3
以下是一个代码块的示例：

\`\`\`js
function helloWorld() {
  console.log('Hello, World!');
}
\`\`\`

#### Heading 4
可以嵌入更多的 Markdown 内容，比如列表：
- 第一项
- 第二项
- 第三项

##### Heading 5
Markdown 还支持有序列表：
1. 第一项
2. 第二项
3. 第三项

###### Heading 6
这是最小的标题级别，通常用于细微的说明文本。

这是普通的段落文本。保持阅读体验的舒适性是至关重要的，所以行间距也要适当。

---

好了，让我们带上分割线来到下一张。

![图片](/background.png)

> 很帅呢。哼哼~

~哈哈其实这是我特意选的~

这个图片的链接是
[图片](/background.png)

---

洛小黑老师开课咯~ 在markdown中，我们可以使用这些：

| Markdown | 语法 |
| :--- | :--- |
| **加粗** | 使用两个星号或下划线将文本括起来，以显示为粗体。 |
| *斜体* | 使用一个星号或下划线将文本括起来，以显示为斜体。 |
| ~~删除线~~ | 使用两个波浪线将文本括起来，以显示为删除线。 |
| 代码 | 使用反引号将文本括起来，以显示为代码。 |
| [链接](https://example.com) | 使用方括号将文本括起来，以创建链接。 |
| 列表 | 使用连字符或数字将文本括起来，以创建列表。 |
| 图片 | 使用方括号将文本括起来，以创建图片。 |
| 分割线 | 使用三个破折号或下划线创建分割线。 |

`;

// 演示组件
const MarkdownDemo: React.FC = () => {
    return (
        <div className="container mx-auto p-6 bg-white">
            {/* 插入样式 */}
            <Style />

            {/* 渲染 Markdown 内容 */}
            <MarkdownRenderer content={markdownContent} />
        </div>
    );
};

export default MarkdownDemo;
