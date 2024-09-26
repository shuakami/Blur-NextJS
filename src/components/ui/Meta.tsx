// src/components/Meta.tsx

import Head from 'next/head';
import seoDescription from "@/seo/seo_description";
import seoKeywords from "@/seo/seo_keywords";

interface MetaProps {
    pageName?: string;
    pageDescription?: string;
}

const Meta = ({pageName, pageDescription}: MetaProps) => {
    let title;

    // 根据提供的参数构建标题
    if (pageName && pageDescription) {
        title = `${pageName} - ${pageDescription}`;
    } else if (pageName) {
        title = `${pageName} - Blur`;
    } else if (pageDescription) {
        title = `${pageDescription} - Blur`;
    } else {
        title = 'Blur - Meet your mirror, your muse.';
    }

    const description = seoDescription;
    const keywords = seoKeywords.join(',');

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description}/>
            <meta name="keywords" content={keywords}/>
            <link rel="icon" href="/favicon.ico"/>
        </Head>
    );
};

export default Meta;
