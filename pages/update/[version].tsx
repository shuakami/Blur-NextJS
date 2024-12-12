import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';
import matter from 'gray-matter';
import { MarkdownRenderer } from '@/components/ui/markdown/MarkdownRenderer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useRouter } from 'next/router';
import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface UpdatePageProps {
    updates: {
        content: string;
        title: string;
        date: string;
        slug: string;
        version?: string;
        author?: {
            name: string;
            avatar: string;
        };
    }[];
}

const ITEMS_PER_PAGE = 3; // 每页显示数量

const UpdatePage: React.FC<UpdatePageProps> = ({ updates }) => {
    const router = useRouter();
    const contentRef = useRef<HTMLDivElement>(null);
    const [isContentReady, setIsContentReady] = useState(false);
    const [displayedUpdates, setDisplayedUpdates] = useState<typeof updates>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // 初始化显示内容
    useEffect(() => {
        setDisplayedUpdates(updates.slice(0, ITEMS_PER_PAGE));
    }, [updates]);

    // 滚动位置恢复逻辑
    useLayoutEffect(() => {
        if (typeof window === 'undefined') return;

        // 延迟执行以确保内容已渲染
        const timer = setTimeout(() => {
            const scrollPos = sessionStorage.getItem(`scrollPos:${router.asPath}`);
            console.log('Attempting to restore scroll position:', {
                path: router.asPath,
                savedPosition: scrollPos,
                contentReady: isContentReady,
                displayedUpdatesLength: displayedUpdates.length
            });

            if (scrollPos && contentRef.current) {
                try {
                    const position = parseInt(scrollPos);
                    // 强制滚动
                    document.documentElement.scrollTop = position;
                    document.body.scrollTop = position;
                    
                    console.log('Forced scroll to position:', position);
                    sessionStorage.removeItem(`scrollPos:${router.asPath}`);
                } catch (error) {
                    console.error('Failed to restore scroll position:', error);
                }
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [router.asPath, isContentReady, displayedUpdates]);

    // 保存滚动位置
    useEffect(() => {
        const saveScrollPosition = () => {
            const currentScroll = Math.max(
                document.documentElement.scrollTop,
                document.body.scrollTop,
                window.scrollY
            );
            
            if (currentScroll > 0) {
                try {
                    sessionStorage.setItem(
                        `scrollPos:${router.asPath}`, 
                        currentScroll.toString()
                    );
                    console.log('Saved scroll position:', {
                        path: router.asPath,
                        position: currentScroll
                    });
                } catch (error) {
                    console.error('Failed to save scroll position:', error);
                }
            }
        };

        router.events.on('routeChangeStart', saveScrollPosition);
        window.addEventListener('beforeunload', saveScrollPosition);

        return () => {
            router.events.off('routeChangeStart', saveScrollPosition);
            window.removeEventListener('beforeunload', saveScrollPosition);
        };
    }, [router]);

    // 确保在内容加载后再显示
    useEffect(() => {
        if (displayedUpdates.length > 0) {
            setIsContentReady(true);
        }
    }, [displayedUpdates]);

    // 还没加载好别显示页面（显示null）
    if (!isContentReady) {
        return null;
    }

    // 加载更多
    const loadMore = () => {
        const nextPage = currentPage + 1;
        const newUpdates = updates.slice(0, nextPage * ITEMS_PER_PAGE);
        setDisplayedUpdates(newUpdates);
        setCurrentPage(nextPage);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black py-4 px-6 md:px-0">
            {/* 头部区域 */}
            <div className="w-full max-w-screen-xl mx-auto px-6 pt-16 pb-24">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                        更新日志
                    </h1>
                    <p className="text-lg leading-7 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                        追踪我们的最新更新、功能改进和问题修复
                    </p>
                </div>
            </div>

            {/* 内容区域 */}
            <div 
                ref={contentRef}
                className={`transition-opacity duration-200 ${isContentReady ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className="w-full max-w-screen-xl mx-auto px-4 md:px-6 pb-32">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* 主时间线 - 确保延伸到底部 */}
                            <div className="hidden md:block absolute left-[139px] top-0 bottom-0 w-px">
                                <div className="h-full bg-gradient-to-b from-transparent via-gray-200 to-gray-200 dark:via-gray-800 dark:to-gray-800 opacity-80" />
                            </div>

                            {/* 更新列表 */}
                            <div className="space-y-16 md:space-y-24">
                                {displayedUpdates.map((update) => (
                                    <div key={update.slug} className="relative md:pl-[180px]">
                                        {/* 时间线 */}
                                        <div className="hidden md:block absolute left-[131px] top-[10px] py-1 px-1 border border-gray-200 dark:border-gray-800 rounded-full">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                                        </div>

                                        {/* 左侧信息区 */}
                                        <div className="flex flex-col md:absolute md:left-0 md:top-[8px] md:text-right md:w-[120px]">
                                            <time className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-4 md:mb-0">
                                                <span className="inline-flex items-center gap-1.5">
                                                    {formatDistanceToNow(new Date(update.date), { 
                                                        addSuffix: true,
                                                        locale: zhCN 
                                                    })}
                                                </span>
                                            </time>
                                        </div>

                                        {/* 主要内容区 */}
                                        <div>
                                            <div className="mb-6 md:mb-8">
                                                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white leading-tight">
                                                    {update.title}
                                                </h2>
                                            </div>

                                            <div className="prose prose-sm md:prose prose-gray dark:prose-invert max-w-none text-gray-750 text-base dark:text-gray-400">
                                                <MarkdownRenderer content={update.content} />
                                            </div>

                                            {update.author && (
                                                <div className="mt-6 md:mt-8 flex items-center space-x-2">
                                                    <Avatar size="xs">
                                                        <AvatarImage 
                                                            src={update.author.avatar} 
                                                            alt={update.author.name} 
                                                        />
                                                        <AvatarFallback>
                                                            {update.author.name.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-gray-700 dark:text-gray-400">
                                                        {update.author.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 加载更多按钮 */}
                            {displayedUpdates.length < updates.length && (
                                <div className="relative mt-16 md:mt-24">
                                    {/* 按钮容器 */}
                                    <div className="relative md:pl-[180px] flex items-center">
                                        {/* 时间线圆点 */}
                                        <div className="hidden md:block absolute left-[131px] top-1/2 -translate-y-1/2 py-1 px-1 border border-gray-200 dark:border-gray-800 rounded-full">
                                            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                                        </div>

                                        {/* 按钮 */}
                                        <Button
                                            onClick={loadMore}
                                            variant="outline"
                                            className="w-full"
                                            rounded="full"
                                        >
                                            <span>加载更多</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const updatesDir = path.join(process.cwd(), 'content', 'update');
    const filenames = fs.readdirSync(updatesDir);
    
    const paths = filenames.map((filename) => ({
        params: { version: filename.replace('.mdx', '') }
    }));

    return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<UpdatePageProps> = async () => {
    const updatesDir = path.join(process.cwd(), 'content', 'update');
    const filenames = fs.readdirSync(updatesDir);
    
    const updates = await Promise.all(
        filenames.map(async (filename) => {
            const filePath = path.join(updatesDir, filename);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { content, data } = matter(fileContent);
            
            // 确保日期是 ISO 字符串格式
            const dateStr = data.date instanceof Date 
                ? data.date.toISOString() 
                : new Date(data.date).toISOString();
            
            return {
                content,
                title: data.title,
                date: dateStr,
                author: {
                    name: data.author?.name || '',
                    avatar: data.author?.avatar || ''
                },
                slug: filename.replace('.mdx', '')
            };
        })
    );

    // 按日期排序
    updates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { 
        props: { updates },
        revalidate: 3600 // 1小时重新验证一次
    };
};

export default UpdatePage;