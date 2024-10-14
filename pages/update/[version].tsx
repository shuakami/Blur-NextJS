import {GetStaticProps, GetStaticPaths} from 'next';
import {promises as fs} from 'fs';
import path from 'path';
import {MarkdownRenderer} from "@/components/ui/markdown/MarkdownRenderer";


interface UpdatePageProps {
    content: string;
    version: string;
}

export default function UpdatePage({content, version}: UpdatePageProps) {
    return (
        <div>
            <h1>更新日志 - 版本 {version}</h1>
            <MarkdownRenderer content={content}/>
        </div>
    );
}

// 获取所有的版本号文件
export const getStaticPaths: GetStaticPaths = async () => {
    const updatesDirectory = path.join(process.cwd(), 'update');
    const filenames = await fs.readdir(updatesDirectory);

    const paths = filenames.map((filename) => ({
        params: {version: filename.replace('.mdx', '')},
    }));

    return {
        paths,
        fallback: false,
    };
};

// 根据版本号加载内容
export const getStaticProps: GetStaticProps = async ({params}) => {
    const {version} = params as { version: string };
    const updatesDirectory = path.join(process.cwd(), 'update');
    const filePath = path.join(updatesDirectory, `${version}.mdx`);
    const fileContents = await fs.readFile(filePath, 'utf8');

    return {
        props: {
            content: fileContents,
            version,
        },
    };
};
