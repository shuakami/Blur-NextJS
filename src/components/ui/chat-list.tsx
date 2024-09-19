import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChatList() {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white mt-20 space-y-6">
            {/* 机器人消息 */}
            <div className="flex items-start space-x-4">
                <Avatar className="w-10 h-10">
                    <AvatarImage src="https://api.dicebear.com/6.x/bottts/svg?seed=Felix" />
                    <AvatarFallback>BT</AvatarFallback>
                </Avatar>
                <div className="text-black p-4 max-w-[80%]">
                    <p className="text-sm mb-2">
                        要使用 dayjs 的 fromNow 函数，需要先安装 dayjs 库并在代码中引入它。然后，可以使用以下语法来获取当前时间与给定时间之间的相对时间：
                    </p>
                    <pre className="bg-gray-200 p-2 rounded text-sm overflow-x-auto">
            <code>
              {`dayjs().fromNow(); // 获取当前时间的相对时间
dayjs('2021-05-01').fromNow(); // 获取给定时间的相对时间`}
            </code>
          </pre>
                    <p className="text-sm mt-2">
                        第一个示例将返回类似于"几秒前"、"一分钟前"、"2天前"的相对时间字符串，表示当前时间与调用 fromNow 方法时的时间差。第二个示例将返回给定时间与当前时间的相对时间字符串。
                    </p>
                </div>
            </div>

            {/* 人类消息 */}
            <div className="flex justify-end items-start space-x-4">
                <div className="bg-[#F4F4F4] text-black rounded-2xl p-4 max-w-[80%]">
                    <p className="text-sm mb-2">
                        感谢解答，我会尝试使用 dayjs。顺便问下，怎么在多语言应用中处理日期格式？
                    </p>
                </div>
                <Avatar className="w-10 h-10 ml-4">
                    <AvatarImage src="https://github.com/shuakami.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>

            {/* 机器人消息 */}
            <div className="flex items-start space-x-4">
                <Avatar className="w-10 h-10">
                    <AvatarImage src="https://api.dicebear.com/6.x/bottts/svg?seed=Felix" />
                    <AvatarFallback>BT</AvatarFallback>
                </Avatar>
                <div className="text-black p-4 max-w-[80%]">
                    <p className="text-sm mb-2">
                        你可以使用 dayjs 的国际化插件来处理多语言支持，方法是：
                    </p>
                    <pre className="bg-gray-200 p-2 rounded text-sm overflow-x-auto">
            <code>
              {`import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
dayjs().format('MMMM D, YYYY'); // 例如：2024年9月18日`}
            </code>
          </pre>
                </div>
            </div>

            {/* 人类消息 */}
            <div className="flex justify-end items-start space-x-4">
                <div className="bg-[#F4F4F4] text-black rounded-2xl p-4 max-w-[80%]">
                    <p className="text-sm">
                        这个方法很不错，我已经集成到项目中了，效果很好！
                    </p>
                </div>
                <Avatar className="w-10 h-10 ml-4">
                    <AvatarImage src="https://github.com/shuakami.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
        </div>
    );
}
