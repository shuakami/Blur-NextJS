import * as React from "react";

export const PersonalCenterMain: React.FC = () => {
    return (
        <div className="flex-1 overflow-y-auto p-14">
            <div className="mx-auto max-w-2xl">
                {/* 用户信息 */}
                <div className="flex items-center mb-14 -mt-5">
                    <img
                        src="https://github.com/shuakami.png"
                        alt="用户头像"
                        className="h-[67px] w-[67px] rounded-full border-2 border-gray-300 mr-8 "
                    />
                    <div className="mt-2.5">
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">刷卡自信一点 | Shuakami</h2>
                        <button className="text-sm text-gray-600 hover:underline">
                            更新个人资料
                        </button>
                    </div>
                </div>

                {/* 用户信息详情 */}
                <div className="space-y-12">
                    {/* 用户名 */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">用户名</h3>
                        <p className="text-lg text-gray-800">shuakami0303</p>
                        <button className="text-sm text-gray-600 hover:underline mt-2">
                            更新用户名
                        </button>
                    </div>

                    {/* 电子邮件地址 */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">电子邮件地址</h3>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-lg text-gray-800">shuakami@sdjz.wiki</p>
                            <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1">
                主要
              </span>
                        </div>
                        <button className="text-sm text-gray-600 hover:underline">
                            + 添加电子邮件地址
                        </button>
                    </div>

                    {/* 连接的账户 */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">连接的账户</h3>
                        <div className="flex items-center mb-2">
                            <img
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                                alt="GitHub"
                                className="h-6 w-6 mr-3"
                            />
                            <p className="text-lg text-gray-800">GitHub • shuakami</p>
                        </div>
                        <button className="text-sm text-gray-600 hover:underline mt-2">
                            + 连接账户
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
