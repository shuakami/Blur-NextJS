import React, {useState, useEffect} from 'react';
import {FiEdit, FiThumbsUp} from 'react-icons/fi';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({content}) => {
    const [toc, setToc] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    // 解析渲染后的内容并生成目录结构
    useEffect(() => {
        const container = document.querySelector('.markdown-body'); // 限定选择器，确保只从主要内容中获取标题
        const headings = Array.from(container?.querySelectorAll('h2, h3') || []);  // 直接从渲染后的 DOM 获取
        const tocItems: TOCItem[] = headings.map((heading) => {
            if (!heading.id) {
                heading.id = heading.textContent?.toLowerCase().replace(/\s+/g, '-') || ''; // 如果没有id则自动生成
            }
            return {
                id: heading.id,
                text: heading.textContent || '',
                level: parseInt(heading.tagName.charAt(1)),
            };
        });
        setToc(tocItems);
    }, [content]);

    // 使用 IntersectionObserver 实现滚动监听和高亮逻辑
    useEffect(() => {
        const headings = document.querySelectorAll('h2, h3');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {rootMargin: '0px 0px -50% 0px'} // 触发观察的时机，距离视口50%时触发
        );

        headings.forEach((heading) => {
            observer.observe(heading);
        });

        return () => {
            headings.forEach((heading) => {
                observer.unobserve(heading);
            });
        };
    }, [content]);

    // 平滑滚动到目标位置
    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            // 使用浏览器的 scrollIntoView 平滑滚动到目标元素
            element.scrollIntoView({behavior: 'smooth'});
            // 确保不改变 URL 中的其他部分
            window.history.replaceState(null, '', `#${id}`);
        }
    };

    return (
        <nav className="top-24 w-64 p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">文章目录</h2>
            <ul className="space-y-3">
                {toc.map((item) => (
                    <li
                        key={item.id}
                        className={`${
                            item.level === 3 ? 'ml-4' : ''
                        } text-sm cursor-pointer transition-colors duration-200`}
                    >
                        <a
                            href={`#${item.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToHeading(item.id);
                            }}
                            className={`${
                                activeId === item.id
                                    ? 'text-blue-600 font-medium'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
            <hr className="mt-4 border-t border-gray-300"/>

            {/* 编辑此页和反馈 */}
            <div className="mt-4">
                <a href="?edit" className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                    <FiEdit className="mr-2"/>
                    编辑此页
                </a>
                <a href="?feedback" className="flex items-center text-sm text-gray-600 hover:text-gray-800 mt-2">
                    <FiThumbsUp className="mr-2"/>
                    这篇文章解决了你的问题吗？
                </a>
            </div>
        </nav>
    );
};

export default TableOfContents;
