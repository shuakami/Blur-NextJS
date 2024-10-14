import {useEffect, useState} from "react";
import {Clock8} from "lucide-react";

// Flesch-Kincaid Grade Level 计算公式
const calculateFleschKincaid = (text: string): number => {
    const sentences = text.split(/[.!?。！？]/).filter(Boolean).length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const syllables = text.match(/[aeiouy]+/g)?.length || 0;

    if (sentences === 0 || words === 0) return 0;

    const fkgl = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    return fkgl;
}

// 可读性复杂度系数计算
const calculateReadabilityFactor = (fkgl: number): number => {
    if (fkgl < 5) return 0.9;  // 简单文章
    if (fkgl > 12) return 1.5; // 复杂文章
    return 1.0;                // 普通文章
}

// 核心算法：根据字数、非文本元素、可读性等计算阅读时间（以秒为单位）
const calculateReadingTime = (text: string, nonTextElementsCount: number = 0, lang: string = 'en'): number => {
    const words = text.trim().split(/\s+/).length; // 计算文章的字数
    if (words === 0) return 0; // 避免除以零

    const fkgl = calculateFleschKincaid(text); // 计算 Flesch-Kincaid 指数
    const readabilityFactor = calculateReadabilityFactor(fkgl); // 可读性复杂度系数

    // 设定基础阅读速度，基于语言不同
    let readingSpeed = 200; // 英文
    if (lang === 'zh') {
        readingSpeed = 350; // 中文
    }

    // 计算基础的阅读时间（以秒为单位）
    const readingTime = (words / readingSpeed) * readabilityFactor * 60; // 转换为秒

    // 每个非文本元素需要 10 秒的额外时间
    const nonTextElementTime = nonTextElementsCount * 10; // 直接以秒为单位

    // 总时间计算（以秒为单位）
    const totalTime = readingTime + nonTextElementTime;

    // 最小阅读时间限制为30秒
    const minimumTime = 30; // 最短阅读时间为30秒

    // 返回总时间，确保至少30秒
    return totalTime > minimumTime ? totalTime : minimumTime;
}

// 格式化时间，将总时间以秒、分钟或小时格式输出
const formatTime = (seconds: number): string => {
    if (seconds < 60) {
        return `${Math.ceil(seconds)} 秒`; // 小于 60 秒，显示为秒
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} 分钟`; // 小于 60 分钟，显示为分钟
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours} 小时 ${minutes} 分钟`; // 超过 60 分钟，显示为小时和分钟
    }
}

// 阅读时间组件：显示推算的阅读时间
interface ReadingTimeProps {
    text: string;  // 纯文本内容
    nonTextElementsCount?: number;  // 非文本元素数量
    lang?: string;  // 文章的语言
}

export const ReadingTime: React.FC<ReadingTimeProps> = ({text, nonTextElementsCount = 0, lang = 'en'}) => {
    const [readingTimeInSeconds, setReadingTimeInSeconds] = useState<number>(0);

    useEffect(() => {
        // 在客户端计算阅读时间
        const timeInSeconds = calculateReadingTime(text, nonTextElementsCount, lang);
        setReadingTimeInSeconds(timeInSeconds);
    }, [text, nonTextElementsCount, lang]);

    if (readingTimeInSeconds === 0) return null;

    return (
        <div className="flex items-center text-xs">
            <Clock8 className="mr-2 w-3.5 h-3.5"/>
            <span>阅读需要 {formatTime(readingTimeInSeconds)}</span>
        </div>
    );
};
