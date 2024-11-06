/** @type {import('next').NextConfig} */
const nextConfig = {
    // 编译优化
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
        styledComponents: true,
    },

    // 图片优化
    images: {
        domains: [
            'github.com',
            'avatars.githubusercontent.com',
            'img.clerk.com',
            'github.githubassets.com',
            'basilisk-86.clerk.accounts.dev',
            'settled-basilisk-86.clerk.accounts.dev',
            'blur-api.al001.luoxiaohei.cn',
            'blur.al001.luoxiaohei.cn',
            'localhost',
            'data:'
        ],
        deviceSizes: [640, 768, 1024, 1280, 1920],
        imageSizes: [16, 32, 48, 64, 96],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 3600,
    },

    // 实验性功能
    experimental: {
        optimizeCss: true,
        turbo: {
            rules: {
                '*.svg': ['@svgr/webpack'],
            },
        },
        scrollRestoration: true,
        webVitalsAttribution: ['CLS', 'LCP'],
        optimizePackageImports: [
            '@headlessui/react',
            '@heroicons/react',
            'framer-motion',
            'react-markdown',
        ],
    },

    // 基础 webpack 配置
    webpack: (config, { dev, isServer }) => {
        if (!isServer && !dev) {
            config.optimization.splitChunks = {
                chunks: 'all',
                minSize: 20000,
                maxSize: 244000,
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        priority: -10,
                        reuseExistingChunk: true,
                    },
                },
            };
        }
        return config;
    },

    // 缓存策略
    async headers() {
        const isDev = process.env.NODE_ENV !== 'production';
        return [
            {
                source: '/:all*(svg|jpg|png|webp|avif|js|css)',
                locale: false,
                headers: [
                    {
                        key: 'Cache-Control',
                        value: isDev 
                            ? 'no-cache, no-store'
                            : 'public, max-age=3600, stale-while-revalidate=86400'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: isDev
                            ? "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; connect-src *; font-src *; frame-src *; worker-src * blob:;"
                            : (
                                "default-src 'self'; " +
                                "script-src 'self' https://basilisk-86.clerk.accounts.dev https://settled-basilisk-86.clerk.accounts.dev https://clerk.luoxiaohei.cn https://accounts.luoxiaohei.cn 'unsafe-inline'" +
                                " worker-src 'self' blob:; " +
                                " style-src 'self' 'unsafe-inline'; " +
                                " img-src 'self' data: https://github.com https://avatars.githubusercontent.com https://basilisk-86.clerk.accounts.dev https://blur.al001.luoxiaohei.cn https://blur-api.al001.sdjz.wiki https://img.clerk.com https://api.dicebear.com; " +
                                " connect-src 'self' data: https://basilisk-86.clerk.accounts.dev https://settled-basilisk-86.clerk.accounts.dev https://blur.al001.luoxiaohei.cn https://clerk.luoxiaohei.cn https://accounts.luoxiaohei.cn https://blur-api.al001.sdjz.wiki;" +
                                " font-src 'self' https://fonts.gstatic.com; " +
                                " upgrade-insecure-requests;"
                            )
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'geolocation=(), microphone=(), camera=()',
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: 'https://blur.al001.luoxiaohei.cn',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization',
                    },
                    {
                        key: 'X-Powered-By',
                        value: 'none',
                    },
                ],
            },
            {
                source: '/latest/meta-data/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'none';",
                    },
                ],
            },
        ];
    },

    // 基础优化
    output: 'standalone',
    poweredByHeader: false,
    generateEtags: true,
    compress: true,
    productionBrowserSourceMaps: false,
    staticPageGenerationTimeout: 120,
};

export default nextConfig;