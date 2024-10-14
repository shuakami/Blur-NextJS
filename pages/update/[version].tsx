import fs from 'fs';
import path from 'path';
import {GetStaticPaths, GetStaticProps} from 'next';
import matter from 'gray-matter';
import {MarkdownRenderer} from '@/components/ui/markdown/MarkdownRenderer';
import DocsSidebar from '@/components/ui/tofu/docs-sidebar';
import {FaBook, FaServer, FaEye, FaMicrophone} from 'react-icons/fa';
import {BreadcrumbWithCustomSeparator} from "@/components/ui/tofu/Breadcrumb";
import {ReadingTime} from "@/components/ui/tofu/ReadingTime";
import TableOfContents from "@/components/ui/tofu/TableOfContents";
import {countNonTextElements, extractPlainText} from "@/lib/contentUtils"; // 导入辅助函数

interface UpdatePageProps {
    content: string;
    plainText: string;
    version: string;
    title: string;
    nonTextElementsCount: number;
    lang: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
    const updatesDir = path.join(process.cwd(), 'content', 'update');
    const filenames = fs.readdirSync(updatesDir);

    const paths = filenames.map((filename) => {
        const version = filename.replace('.mdx', '');
        return {params: {version}};
    });

    return {paths, fallback: false};
};

export const getStaticProps: GetStaticProps<UpdatePageProps> = async ({params}) => {
    const {version} = params as { version: string };
    const filePath = path.join(process.cwd(), 'content', 'update', `${version}.mdx`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const {content, data} = matter(fileContent);

    // 计算非文本元素数量
    const nonTextElementsCount = await countNonTextElements(content);

    // 提取纯文本以用于阅读时间计算
    const plainText = await extractPlainText(content);

    return {
        props: {
            content,
            plainText,
            version,
            title: data.title || '未命名标题', // 从元数据中解析标题
            nonTextElementsCount, // 非文本元素数量
            lang: data.lang || 'en', // 假设元数据中包含语言信息
        },
    };
};

const UpdatePage: React.FC<UpdatePageProps> = ({content, plainText, version, title, nonTextElementsCount, lang}) => {
    // 定义 SpecialButton 和 NavItem 数据
    const specialButtons = [
        {icon: FaBook, text: '用户指南'},
        {icon: FaServer, text: '私有化部署'},
    ];

    const navItems = [
        {
            icon: FaEye,
            text: '功能特性',
            items: [
                {text: '视觉识别'},
                {text: '语音会话'},
                {text: '文生图'},
                {text: '图生图'},
            ],
        },
        {
            icon: FaMicrophone,
            text: '语音交互',
            items: [
                {text: '语音识别'},
                {text: '语音生成'},
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 md:px-8 flex flex-col lg:flex-row">
                {/* 左侧边栏 - 在大屏幕上显示，在小屏幕上隐藏 */}
                <div className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <DocsSidebar
                            searchPlaceholder="搜索文档..."
                            specialButtons={specialButtons}
                            navItems={navItems}
                        />
                    </div>
                </div>

                {/* 主内容和右侧目录树的容器 */}
                <div className="flex-grow flex flex-col lg:flex-row lg:ml-8">
                    {/* 主内容区域 */}
                    <main className="flex-1 p-6 bg-white rounded-lg mt-6 md:mt-16">
                        {/* 面包屑和阅读时间布局 */}
                        <div className="flex justify-between items-center mb-6">
                            <BreadcrumbWithCustomSeparator
                                items={[
                                    {label: 'Docs', href: '/docs'},
                                    {label: 'UpdateLog', href: '/docs/update'},
                                    {label: title},
                                ]}
                            />
                            <ReadingTime text={plainText} nonTextElementsCount={nonTextElementsCount}/>
                        </div>

                        {/* 标题 */}
                        <h1 className="text-3xl font-bold mb-6">{title}</h1>

                        {/* Markdown 内容 */}
                        <MarkdownRenderer content={content}/>
                    </main>

                    {/* 右侧目录树 - 在大屏幕上固定，在小屏幕上可隐藏 */}
                    <aside className="hidden lg:block w-64 ml-8 flex-shrink-0">
                        <div className="sticky top-24"
                             style={{height: 'calc(100vh - 6rem)', overflowY: 'auto', overflowX: 'hidden'}}>
                            <TableOfContents content={content}/>
                        </div>
                    </aside>
                </div>

            </div>
        </div>
    );
};

export default UpdatePage;
