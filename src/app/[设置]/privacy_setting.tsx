import React, {useEffect, useRef, useState} from "react";
import useTranslation from "@/hooks/useTranslation";
import {PieChart, Pie, Cell, ResponsiveContainer} from "recharts";
import {useThemeContext} from "@/theme/ThemeContext";

interface Setting {
    [key: string]: string | boolean;
}

const privacyCategories = [
    {
        id: "personal_info",
        name: "个人信息",
        options: [
            {id: "name_visibility", name: "名字可见性", default: "friends"},
            {id: "email_visibility", name: "邮箱可见性", default: "none"},
            {id: "phone_visibility", name: "电话可见性", default: "none"},
        ],
    },
    {
        id: "activity",
        name: "活动与互动",
        options: [
            {id: "post_visibility", name: "帖子可见性", default: "public"},
            {id: "comment_visibility", name: "评论可见性", default: "friends"},
            {id: "like_visibility", name: "点赞可见性", default: "friends"},
        ],
    },
    {
        id: "data_usage",
        name: "数据使用",
        options: [
            {id: "analytics", name: "分析数据收集", default: true},
            {id: "personalized_ads", name: "个性化广告", default: false},
            {id: "third_party_sharing", name: "第三方数据共享", default: false},
        ],
    },
];

const visibilityOptions = ["public", "friends", "none"];

export const PrivacySettings: React.FC = () => {
    const {theme} = useThemeContext();
    const {t} = useTranslation();
    const [settings, setSettings] = useState<Setting>(() => {
        const initialSettings: Setting = {};
        privacyCategories.forEach((category) => {
            category.options.forEach((option) => {
                initialSettings[option.id] = option.default;
            });
        });
        return initialSettings;
    });

    const [privacyScore, setPrivacyScore] = useState(70);

    const updateSetting = (id: string, value: any) => {
        setSettings((prev) => ({...prev, [id]: value}));
        setPrivacyScore(Math.floor(Math.random() * 40) + 60);
    };

    const renderPrivacyScore = () => {
        const data = [
            {name: "Score", value: privacyScore},
            {name: "Remaining", value: 100 - privacyScore},
        ];
        const COLORS = ["#00C49F", "#EAEAEA"];

        return (
            <div className="mb-8">
                <div className="flex items-center">
                    <ResponsiveContainer width={100} height={100}>
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={30}
                                outerRadius={40}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="ml-4">
                        <p className="text-3xl font-bold">{privacyScore}/100</p>
                        <p className="text-sm text-gray-500">{t("您的隐私保护评分")}</p>
                    </div>
                </div>
            </div>
        );
    };

    // 自定义下拉菜单
    const CustomDropdown: React.FC<{ value: string; options: string[]; onChange: (val: string) => void }> = ({
                                                                                                                 value,
                                                                                                                 options,
                                                                                                                 onChange,
                                                                                                             }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        // 监听全局点击事件
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);

        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="border rounded-md px-2 py-1 text-sm w-full text-left bg-white dark:bg-gray-800"
                >
                    {t(value)}
                </button>
                {isOpen && (
                    <ul className="absolute w-20 z-10 mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {options.map((opt) => (
                            <li
                                key={opt}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap ${
                                    opt === value ? "font-bold" : ""
                                }`}
                                onClick={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                            >
                                {t(opt)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    // 更个性化的提示语句
    const generateCustomMessage = (optionName: string, settingValue: string | boolean) => {
        if (typeof settingValue === "boolean") {
            return settingValue
                ? t(`${optionName}已启用，您将享受到个性化体验`)
                : t(`${optionName}已关闭`);
        } else {
            switch (settingValue) {
                case "public":
                    return t(`${optionName}当前对所有人公开`);
                case "friends":
                    return t(`${optionName}当前只对好友可见`);
                case "none":
                    return t(`${optionName}只对您自己可见`);
                default:
                    return t(`${optionName}的当前设置为: ${settingValue}`);
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-semibold mb-6">{t("隐私设置")}</h2>

            {renderPrivacyScore()}

            {privacyCategories.map((category) => (
                <div key={category.id} className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">{t(category.name)}</h3>
                    <div className="space-y-4">
                        {category.options.map((option) => (
                            <div key={option.id} className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t(option.name)}</span>
                                    {typeof settings[option.id] === "boolean" ? (
                                        <button
                                            onClick={() => updateSetting(option.id, !settings[option.id])}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:${theme.ring()} ${
                                                settings[option.id] ? `${theme.bg(500)}` : "bg-gray-150"
                                            }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                                    settings[option.id] ? "translate-x-6" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    ) : (
                                        <CustomDropdown
                                            value={settings[option.id] as string}
                                            options={visibilityOptions}
                                            onChange={(val) => updateSetting(option.id, val)}
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {generateCustomMessage(option.name, settings[option.id])}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
