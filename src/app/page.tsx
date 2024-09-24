import Header from "@/components/ui/header";
import {ChatList} from "@/components/ui/chat-list";
import ErrorModal from "@/components/ui/error-modal";
import MarkdownDemo from "@/components/demo/markdown-1-h1-h6-demo";
import ChatInputWrapper from "@/components/ui/ChatInputWrapper";
import LanguageDropdown from "@/app/[语言选择器]/language-dropdown";
import ChatSidebar from "@/components/chat/chat_sidebar";
import {FolderOpen} from "lucide-react";


export default function Home() {
    const now = Date.now();

    const sidebarItems = [
        {
            date: now, // 今天
            children: [
                {
                    icon: <FolderOpen size={20} />,
                    label: 'Dev',
                    children: [
                        { label: 'Create Next App', href: '#' },
                        { label: 'localhost:3000/login', href: '#' },
                    ],
                },
            ],
        },
        {
            date: now - 86400000, // 昨天
            children: [
                { label: 'Design System', href: '#' },
                { label: 'API Documentation', href: '#' },
            ],
        },
        {
            date: now - 2 * 86400000, // 前天
            children: [
                { label: 'Project Planning', href: '#' },
                { label: 'Team Meeting Notes', href: '#' },
            ],
        },
    ];

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

    const user = {
        avatarUrl: 'https://github.com/shuakami.png',
        name: 'Admin',
        status: 'Test#AL1_0001',
    };

    return (
        <>
            <div className="w-full h-screen flex overflow-hidden">
                {/* 左侧的侧边栏 */}
                <div className="h-full">
                    <ChatSidebar items={sidebarItems} user={user}/>
                </div>

                {/* 右侧的聊天列表和输入框 <在这里加-z-10就可以了，但是下面的元素都动不了了>*/}
                <div
                    className="h-full flex-1 flex flex-col overflow-hidden"
                >
                    {/* 聊天列表 */}
                    <div className="overflow-y-auto">
                        <div
                            className="justify-center items-center xs:px-1 sm:px-6 md:px-10 lg:px-20 xl:px-32 2xl:px-48 3xl:px-64">
                            <ChatList messages={messages}/>
                        </div>
                    </div>

                    {/* 悬浮的输入框 */}
                    <div className="fixed bottom-0 left-28 w-full p-4 flex justify-center bg-transparent">
                        <div className="sm:w-2/3 lg:w-1/2 xl:w-1/2 2xl:w-2/4 3xl:w-2/5 px-4">
                            <ChatInputWrapper/>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
