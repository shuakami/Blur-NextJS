import {useUser} from "@clerk/nextjs";
import React from "react";

const Encode: React.FC = () => {
    // 编码用户ID为颜色对比度差异
    const encodeUserId = (id: string) => {
        return id.split('').map(char => {
            const binary = char.charCodeAt(0).toString(2).padStart(8, '0');
            // 将每个字符的二进制位编码
            const colorValue = parseInt(binary, 2) % 255;
            return `<span style="color: rgba(${colorValue}, ${colorValue}, ${colorValue}, 0.015)">${char}</span>`;
        }).join('');
    };

    const {user} = useUser();
    const userId = user?.id || '未登录';
    const encodedUserId = encodeUserId(userId);


    return (
        <div style={{
            position: 'fixed',
            pointerEvents: 'none',  // 允许点击穿透
            userSelect: 'none',     // 不允许选择
        }} dangerouslySetInnerHTML={{__html: encodedUserId}}/>
    );

};

export default Encode;