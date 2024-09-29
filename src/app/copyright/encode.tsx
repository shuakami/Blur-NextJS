import {useUser} from "@clerk/nextjs";
import React, {useEffect, useState} from "react";

const Encode: React.FC = () => {
    const {user} = useUser();
    const userId = user?.id || 'No Login';
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        // 初始检测
        checkDarkMode();

        // 创建 MutationObserver 监听 class 属性变化
        const observer = new MutationObserver(() => {
            checkDarkMode();
        });

        observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});

        // 清理
        return () => {
            observer.disconnect();
        };
    }, []);

    // 编码用户ID为颜色对比度差异
    const encodeUserId = (id: string) => {
        return id.split('').map(char => {
            const binary = char.charCodeAt(0).toString(2).padStart(8, '0');
            // 将每个字符的二进制位编码
            const colorValue = parseInt(binary, 2) % 255;

            // 根据主题调整颜色
            let rgba;
            if (isDarkMode) {
                // 在黑色主题下使用较亮的颜色
                rgba = `rgba(${255 - colorValue}, ${255 - colorValue}, ${255 - colorValue}, 0.015)`;
            } else {
                // 在白色主题下使用较暗的颜色
                rgba = `rgba(${colorValue}, ${colorValue}, ${colorValue}, 0.015)`;
            }

            return `<span style="color: ${rgba}">${char}</span>`;
        }).join('');
    };

    const encodedUserId = encodeUserId(userId);

    return (
        <div style={{
            position: 'fixed',
            pointerEvents: 'none',  // 允许点击穿透
            userSelect: 'none',     // 不允许选择
            zIndex: 1000,           // 确保在顶部
        }} dangerouslySetInnerHTML={{__html: encodedUserId}}/>
    );
};

export default Encode;
