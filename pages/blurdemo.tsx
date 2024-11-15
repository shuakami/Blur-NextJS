import React from 'react';
import { ChatList } from "@/components/ui/chat-list";

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
        content: `感谢解答，我会去试试 dayjs 的。另外想问问，怎么在多语言应用中处理日期格式？\n \n 谢谢！ \n \n \n \n aaa \n \n\n\n\n\n\n\\n\n\n\n`,
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
        avatarUrl: 'https://api.dicebear.com/6.x/bottts/svg?seed=Felix',
        plugin_status: 'calling',
        plugin_name: 'test',
        plugin_id: '1'
    },
    {
        type: 'bot',
        content: 'latex: $$\\int_0^\\infty e^{-x^2}dx=\\frac{\\sqrt{\\pi}}{2}$$',
        avatarUrl: 'https://github.com/shuakami.png',
        plugin_status: 'response',
        plugin_response: {
            plugin_id: 1,
            plugin_name: 'test',
            data: JSON.stringify({
                data: {
                    message: '这是一个测试插件返回内容',
                    timestamp: new Date().toISOString(),
                    status: 'success'
                },
                code: 200,
                success: true
            }),
            status: 'success'
        }
    },
    {
        type: 'bot',
        content: '这是机器人的回复内容',
        thought: {
            titles: ['分析问题...', '思考方案...', '整理答案...'],
            content: `
> **分析过程**
> 1. 首先理解用户需求，的编辑文档编辑，但我不觉得快把肯定比我空军第八·好的吧v卡博客大巴尽快把我都快把科技部
> 2. 考虑最佳实现方案
> 3. 优化代码结构
            `,
            isAnimating: true,
            duration: 9
        },
        error: '这是一个错误消息'
    }
];

const BlurTextDemo: React.FC = () => {
    return (
        <div className="flex-col px-4 py-6 flex mx-auto max-w-3xl justify-center items-center">
            <ChatList messages={messages} />
        </div>
    );
};

export default BlurTextDemo;