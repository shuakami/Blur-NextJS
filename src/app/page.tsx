import Header from "@/components/ui/header";
import {ChatList} from "@/components/ui/chat-list";
import ErrorModal from "@/components/ui/error-modal";
import MarkdownDemo from "@/components/demo/markdown-1-h1-h6-demo";
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";


export default function Home() {



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

    return (
        <>
            <div className="w-full h-screen">
                <MarkdownDemo/>
                <ErrorModal/>
                <ChatList messages={messages}/>
                <div className="flex justify-center items-center min-h-screen">
                    <ChatInputWrapper/>
                </div>
                <Header/>
            </div>
        </>
    );
}
