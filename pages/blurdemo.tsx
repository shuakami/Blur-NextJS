import React, {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {MarkdownRenderer} from '@/components/ui/markdown/MarkdownRenderer';
import {ChatList} from "@/components/ui/chat-list";

const LETTERS_PER_FRAME = 3;
const FRAME_DURATION = 16; // 约60fps

const BlurTextDemo: React.FC = () => {
    const [visibleText, setVisibleText] = useState('');
    const fullText = useMemo(() => `# Welcome to My Blog

There's no doubt that my mother gives all her love to me. I do believe she is a great person who makes my life beautiful and meaningful.

## About My Mother

She is an easygoing and kind woman with bright eyes and a lovely smile. Although she is often busy, I still feel that I am taken good care of by her.

### Her Support

It's a great pleasure to chat with her when I get into troubles. She always encourages me not to give up and tries to cheer me up by coming up with good solutions.

## Her Talents

In addition, I am fascinated by her:

- Cooking
- Writing

## Conclusion

With her love, I feel like a fish swimming happily in a beautiful sea. I'll cherish her love forever.`, []);

    const messages = [
        {
            type: 'user',
            content: '早。请问如何使用 dayjs 的 fromNow 函数？',
            avatarUrl: 'https://github.com/shuakami.png'
        },
        {
            type: 'bot',
            content: `早啊。**如果要使用  \` dayjs \` 的 fromNow 函数的话**，需要先安装 dayjs 库并在代码中引入它。然后，可以使用以下语法来获取当前时间与给定时间之间的相对时间：
\`\`\`ts
dayjs().fromNow(); // 获取当前时间的相对时间
dayjs('2021-05-01').fromNow(); // 获取给定时间的相对时间
\`\`\`
第一个示例将返回类似于"几秒前"、"一分钟前"、"2天前"的相对时间字符串，表示当前时间与调用 fromNow 方法时的时间差。第二个示例将返回给定时间与当前时间的相对时间字符串。`,
            avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix'
        },
        {
            type: 'user',
            content: '感谢解答，我会去试试 dayjs 的。另外想问问，怎么在多语言应用中处理日期格式？',
            avatarUrl: 'https://github.com/shuakami.png'
        },
        {
            type: 'bot',
            content: `你可以使用 dayjs 的国际化插件来处理多语言支持，方法是：
\`\`\`ts
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
dayjs().format('MMMM D, YYYY'); // 比如说：2024年9月18日
\`\`\``,
            avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix'
        },
        {
            type: 'user',
            content: '这个方法很不错，我已经集成到项目中了，效果很好！',
            avatarUrl: 'https://github.com/shuakami.png'
        },
        {
            type: 'bot',
            content: `喜欢就好~ (Wink)`,
            avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix'
        }
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

    return (
        <div className="text-markdown-container">
            <MarkdownRenderer content={visibleText}/>
            <ChatList messages={messages}/>
        </div>
    );
};

export default BlurTextDemo;