import React, {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {MarkdownRenderer} from '@/components/ui/markdown/MarkdownRenderer';
import {ChatList} from "@/components/ui/chat-list";
import SearchingMessage from '@/components/ui/LLM/SearchingMessage';
import FormUI from "@/components/ui/LLM/Form";
import TextFormUI from "@/components/ui/LLM/TextForm";
import AgentUI from "@/components/ui/LLM/agent";
import UpdateModal from '@/components/UpdateModal';
import AgentContent from '@/components/ui/LLM/AgentMessage';
import { ThoughtStream } from '@/components/ui/chat/ThoughtStream';


const LETTERS_PER_FRAME = 3;
const FRAME_DURATION = 16; // 约60fps

const BlurTextDemo: React.FC = () => {
    const [visibleText, setVisibleText] = useState('');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const fullText = useMemo(() => `# Welcome to My Blog

There's no doubt that my mother gives all her love to me. I do believe she is a great person who makes my life beautiful and meaningful.

## About My Mother

She is an easygoing and kind woman with bright eyes and a lovely smile. Although she is often busy, I still feel that I am taken good care of by her.

$$
P(A|B) = \\frac{P(B|A) P(A)}{P(B)}
$$


### Her Support

It's a great pleasure to chat with her when I get into troubles. She always encourages me not to give up and tries to cheer me up by coming up with good solutions.

## Her Talents

In addition, I am fascinated by her:

- Cooking
- Writing

## 渲染公式\` dayjs \` 

\`\`\`tsx
// src/components/ui/markdown/MarkdownRenderer.tsx
    import dynamic from 'next/dynamic';
    import React from 'react';
    import 'katex/dist/katex.min.css';

// 动态导入 react-katex 的 InlineMath
    const DynamicInlineMath = dynamic(() =>
        import('react-katex').then((mod) => mod.InlineMath), { ssr: false }
    );

    export const InlineMath: React.FC<{ children: string }> = ({ children }) => {
        // @ts-ignore
        return <DynamicInlineMath>{children}</DynamicInlineMath>;
    };

// 动态导入 react-katex 的 BlockMath
    const DynamicBlockMath = dynamic(() =>
        import('react-katex').then((mod) => mod.BlockMath), { ssr: false }
    );

    export const BlockMath: React.FC<{ children: string }> = ({ children }) => {
        // @ts-ignore
        return <DynamicBlockMath>{children}</DynamicBlockMath>;
    };
\`\`\`

> **我正在思考**
> #### 老子应该调用谁
>
> 不知道


## Conclusion

With her love, I feel like a fish swimming happily in a beautiful sea. I'll cherish her love forever.`, []);

    const messages = [
//         {
//             type: 'user',
//             content: '早。请问如何使用 dayjs 的 fromNow 函数？',
//             avatarUrl: 'https://github.com/shuakami.png'
//         },
//         {
//             type: 'bot',
//             content: `早啊。**如果要使用  \` dayjs \` 的 fromNow 函数的话**，需要先安装 dayjs 库并在代码中引入它。然后，可以使用以下语法来获取当前时间与给定时间之间的相对时间：
// \`\`\`ts
// dayjs().fromNow(); // 获取当前时间的相对时间
// dayjs('2021-05-01').fromNow(); // 获取给定时间的相对时间
// \`\`\`
// 第一个示例将返回类似于"几秒前"、"一分钟前"、"2天前"的相对时间字符串，表示当前时间与调用 fromNow 方法时的时间差。第二个示例将返回给定时间与当前时间的相对时间字符串。`,
//             avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix'
//         },
//         {
//             type: 'user',
//             content: `感谢解答，我会去试试 dayjs 的。另外想问问，怎么在多语言应用中处理日期格式？\n \n 谢谢！ \n \n \n \n aaa \n \n\n\n\n\n\n\\n\n\n\n`,
//             avatarUrl: 'https://github.com/shuakami.png'
//         },
//         {
//             type: 'bot',
//             content: `你可以使用 dayjs 的国际化插件来处理多语言支持，方法是：
// \`\`\`ts
// import 'dayjs/locale/zh-cn';
// dayjs.locale('zh-cn');
// dayjs().format('MMMM D, YYYY'); // 比如说：2024年9月18日
// \`\`\``,
//             avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix'
//         },
//         {
//             type: 'user',
//             content: '这个方法很不错，我已经集成到项目中了，效果很好！',
//             avatarUrl: 'https://github.com/shuakami.png'
//         },
//         {
//             type: 'bot',
//             content: `喜欢就好~ (Wink)`,
//             avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix'
//         },
//        // 公式
//         {
//             type: 'bot',
//             content: 'latex: $$\\int_0^\\infty e^{-x^2}dx=\\frac{\\sqrt{\\pi}}{2}$$',
//             avatarUrl: 'https://github.com/shuakami.png'
//         },
//         {
//             type: 'error',
//             content: '节点异常',
//         },
//         {
//             type: 'bot',
//             content: '这是机器人的回复内容',
//             thought: {
//                 titles: ['分析问题...', '思考方案...', '整理答案...'],
//                 content: `
//         > **分析过程**
//         > 1. 首先理解用户需求，的编辑文档编辑，但我不觉得快把肯定比我空军第八·好的吧v卡博客大巴尽快把我都快把科技部
//         > 2. 考虑最佳实现方案
//         > 3. 优化代码结构
//                 `,
//                 isAnimating: true,
//                 duration: 9
//             },
//         },
        {
            type: 'bot',
            id: 'msg_123',
            content: `<思考：highlight.js的Markdown高亮规则对基本元素如标题、粗体、斜体、列表、链接等有支持，但细分的Markdown元素效果可能欠缺。总结并优化一波，看看有哪些类。>
<技术性思考：Markdown的样式结构清晰，但涉及多种语法风格，因此要注意highlight.js给这些元素的class设置。>
<反思：总结清楚Markdown的高亮细节会对后续优化样式有帮助。>

highlight.js 默认的 Markdown 支持相对基础，以下是常见的高亮类和对应的 Markdown 语法：

## 以及markdown

### hljs 的 Markdown 高亮类总结

1. **标题 (\`hljs-section\`)**：
   - 标题用 \`#\` 或 \`##\` 等开始的行，如 \`# 一级标题\`，\`## 二级标题\` 等。

2. **粗体 (\`hljs-strong\`)**：
   - 用 \`**\` 或 \`__\` 包裹的内容，如 \`**粗体文本**\` 或 \`__粗体文本__\`。

3. **斜体 (\`hljs-emphasis\`)**：
   - 用 \`*\` 或 \`_\` 包裹的内容，如 \`*斜体文本*\` 或 \`_斜体文本_\`。

4. **列表 (\`hljs-bullet\`)**：
   - 无序列表，用 \`-\`、\`*\`、\`+\` 等符号作为开头，如 \`- 列表项\`。

5. **链接 (\`hljs-link\` 和 \`hljs-string\`)**：
   - 链接文本 \`[显示文本](链接地址)\`：
     - \`hljs-link\`：链接地址部分。
     - \`hljs-string\`：链接文本部分。

6. **分隔线 (\`hljs-section\` 或 \`hljs-divider\`)**：
   - 三个或更多的 \`---\` 或 \`***\` 组成的分隔线。

7. **引用块 (\`hljs-quote\`)**：
   - 以 \`>\` 开头的引用行，比如 \`> 这是引用文本\`。

8. **代码块 (\`hljs-code\`)**：
   - 行内代码，用反引号包裹，如 \`\` \`代码内容\` \`\`。
   - 多行代码块，使用三个反引号开始和结束，如：
     \`\`\`markdown
     \`\`\`
     多行代码内容
     \`\`\`



     `,
            avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix'
        },
    ];

    const options = [
        { id: '1', label: 'Option 1', description: 'Description for option 1' },
        { id: '2', label: 'Option 2', description: 'Description for option 2' },
        { id: '3', label: 'Option 3', description: 'Description for option 3' },
    ];


    const requestRef = useRef<number>();
    const previousTimeRef = useRef<number>();

    const animateText = useCallback((time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;

            if (deltaTime >= FRAME_DURATION) {
                setVisibleText((prev) => {
                    const newLength = Math.min(prev.length + LETTERS_PER_FRAME, fullText.length);
                    return fullText.slice(0, newLength);
                });

                previousTimeRef.current = time;
            }
        } else {
            previousTimeRef.current = time;
        }

        if (visibleText.length < fullText.length) {
            requestRef.current = requestAnimationFrame(animateText);
        }
    }, [fullText, visibleText.length]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animateText);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [animateText]);

    const thoughtContent = `
    > **Laying out the profile**  
    > I'm thinking through the scenario of "洛小黑," a 16-year-old high school student...  
    >  
    > **Navigating nuances**  
    > Interestingly enough, the instructions emphasize clear communication...  
    `;

    const [titles, setTitles] = useState<string[]>([]);
    // 模拟接收新标题,10个，间隔3秒
    useEffect(() => {
        const interval = setInterval(() => {
            setTitles(prev => [...prev, "Processing data..."]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);
        


    return (
        <div className="flex-col px-4 py-6 flex mx-auto max-w-3xl justify-center items-center">
           {/* <SearchingMessage/> */}
            {/* <MarkdownRenderer content={visibleText}/> */}
            <ChatList messages={messages}/>
            {/* <button onClick={() => setShowUpdateModal(true)}>Show Update Modal</button>
            <UpdateModal 
                isOpen={showUpdateModal} 
                onClose={() => setShowUpdateModal(false)} 
            /> */}
            {/*<FormUI*/}
            {/*    title="Please select an option"*/}
            {/*    description="Choose the option that best fits your needs."*/}
            {/*    options={options}*/}
            {/*    onSubmit={(selectedOption) => {*/}
            {/*        console.log('Selected option:', selectedOption);*/}
            {/*        // Handle the submission here*/}
            {/*    }}*/}
            {/*/>*/}
            {/*<FormUI*/}
            {/*    title="选择你喜欢的水果"*/}
            {/*    description="你可以选择多个选项"*/}
            {/*    options={[*/}
            {/*        { id: '1', label: '苹果', description: '红富士苹果' },*/}
            {/*        { id: '2', label: '香蕉', description: '黄皮香蕉' },*/}
            {/*        { id: '3', label: '橙子', description: '脐橙' },*/}
            {/*    ]}*/}
            {/*    onSubmit={(selectedOptions) => console.log(selectedOptions)}*/}
            {/*    multiSelect={true}*/}
            {/*/>*/}
            {/*<TextFormUI*/}
            {/*    question="请描述一下你的理想工作环境"*/}
            {/*    onSubmit={(answer) => console.log(answer)}*/}
            {/*/>*/}
            {/* <AgentUI/> */}
            {/* <AgentContent/> */}
            {/* <ThoughtStream 
            titles={titles}
            isAnimating={true}
            duration={9}
            content={thoughtContent}
        /> */}
        </div>
    );
};

export default BlurTextDemo;