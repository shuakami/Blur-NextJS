import React from "react";
import useTranslation from '../../hooks/i18n/useTranslation';
import {Logo} from "@/components/logo";

const AboutBlur: React.FC = () => {
    const {t} = useTranslation();

    const infoItems = [
        {label: "版本", value: "2.5.1"},
        {label: "开发者", value: "Blur Inc."},
        {label: "联系我们", value: "blur@luoxiaohei.cn", isLink: true},
    ];

    const legalItems = [
        {label: "使用条款", href: "#"},
        {label: "隐私政策", href: "#"},
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            {/* Logo 和标题部分 */}
            <div className="mb-12 text-center">
                <Logo className="mx-auto mb-6 h-14 w-auto"/>
            </div>

            {/* 信息列表 */}
            <div className="space-y-8 text-sm">
                {infoItems.map((item, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3"
                    >
                        <span className="text-gray-700 dark:text-gray-300">{t(item.label)}</span>
                        {item.isLink ? (
                            <a href={`mailto:${item.value}`}
                               className="text-blue-600 dark:text-blue-400 hover:underline">
                                {item.value}
                            </a>
                        ) : (
                            <span className="text-gray-900 dark:text-gray-200">{item.value}</span>
                        )}
                    </div>
                ))}

                {/* 法律信息 */}
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                    <span className="text-gray-700 dark:text-gray-300">{t("法律信息")}</span>
                    <div className="flex space-x-6">
                        {legalItems.map((item, index) => (
                            <a key={index} href={item.href}
                               className="text-blue-600 dark:text-blue-400 hover:underline">
                                {t(item.label)}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* 版权信息 */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-12 text-center">
                {t("© 2024 LuoXiaoHei Inc. 保留所有权利。")}
            </p>
        </div>
    );
};

export default AboutBlur;
