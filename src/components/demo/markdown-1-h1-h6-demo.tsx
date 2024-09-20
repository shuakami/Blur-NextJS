import React from 'react';
import { MarkdownRenderer } from '@/components/ui/markdwon/MarkdownRenderer'; // 引入你定义的组件

// 示例 Markdown 内容
const markdownContent = `
# Heading 1
这是一个示例文本，使用 **Heading 1** 来显示主要标题。

## Heading 2
使用 **Heading 2** 来展示次级标题。正文可以包含 **加粗** 和 *斜体*。

### Heading 3
以下是一个代码块的示例：

\`\`\`js
// 定义一个函数来计算斐波那契数列
function fibonacci(n) {
    if (n <= 0) return [];
    if (n === 1) return [0];
    if (n === 2) return [0, 1];

    const sequence = [0, 1];
    for (let i = 2; i < n; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence;
}

// 使用示例
const num = 10;
console.log(\`斐波那契数列前 num 项:\`, fibonacci(num));
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

你还可以嵌套他们。

1. 有许多活动可以帮助我们保持健康，比如：
   - 良好睡眠
     - 每晚保持7-9小时的睡眠
     - 设定规律的作息时间
2. 健康饮食
   - 水果
   - 蔬菜

###### Heading 6
这是最小的标题级别，通常用于细微的说明文本。

这是普通的段落文本。保持阅读体验的舒适性是至关重要的，所以行间距也要适当。

---

好了，让我们带上分割线来到下一张。

![图片](/background.png)

~哈哈其实这是我特意选的~

> 很帅呢。哼哼~

> BLBLBLLBLBL。。。。

这个图片的链接是
[图片](/background.png)

---

在markdown中，我们可以使用这些：

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

学完后，给自己定几个任务吧？

- [ ] 完成作业
- [ ] 学习新知识
- [ ] 提交作业

`;

// 演示组件
const MarkdownDemo: React.FC = () => {
    return (
        <div className="container mx-auto p-6 bg-white">
            {/* 插入样式 */}

            {/* 渲染 Markdown 内容 */}
            <MarkdownRenderer content={markdownContent} />
        </div>
    );
};

export default MarkdownDemo;
