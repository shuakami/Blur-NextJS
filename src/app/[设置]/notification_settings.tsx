import React, {useState} from "react";
import useTranslation from "@/hooks/useTranslation";
import {useThemeContext} from "@/theme/ThemeContext";

// 通知类型定义
const notificationTypes = [
    {id: "important", name: "重要通知"},
    {id: "updates", name: "更新提醒"},
    {id: "marketing", name: "营销信息"},
    {id: "newsletter", name: "新闻通讯"},
];

// 定义 settings 的类型
interface NotificationSettingsType {
    important: boolean;
    updates: boolean;
    marketing: boolean;
    newsletter: boolean;
}

export const NotificationSettings: React.FC = () => {
    const {theme} = useThemeContext();
    const {t} = useTranslation();

    // 设置初始状态并指定类型
    const [settings, setSettings] = useState<NotificationSettingsType>({
        important: true,
        updates: true,
        marketing: false,
        newsletter: true,
    });

    // 切换设置状态函数，确保使用索引签名访问属性
    const toggleSetting = (id: keyof NotificationSettingsType) => {
        setSettings((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h2 className="text-2xl font-semibold">{t("通知设置")}</h2>
            <p className="text-sm text-gray-500 mb-6">
                {t("您可以随时在此更改您的通知偏好设置。")}
            </p>

            <div className="space-y-6">
                {notificationTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-sm font-medium">{t(type.name)}</span>
                            {type.id === "important" && (
                                <span
                                    className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                                    {t("建议开启")}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => toggleSetting(type.id as keyof NotificationSettingsType)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:${theme.ring()} ${
                                settings[type.id as keyof NotificationSettingsType] ? `${theme.bg(500)}` : "bg-gray-150"
                            }`}
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                    settings[type.id as keyof NotificationSettingsType]
                                        ? "translate-x-6"
                                        : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
