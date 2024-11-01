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
            loaders: {
                '.svg': ['@svgr/webpack'],
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
        optimizeServerReact: true,
        adjustFontFallbacks: true,
        optimisticClientCache: true,
        serverMinification: true,
        serverSourceMaps: false,
    },

    // Webpack 配置优化
    webpack: (config, {dev, isServer}) => {
        if (!dev) {
            // 生产环境优化
            config.optimization = {
                ...config.optimization,
                moduleIds: 'deterministic',
                runtimeChunk: {
                    name: 'runtime',
                },
                splitChunks: {
                    chunks: 'all',
                    minSize: 20000,
                    maxSize: 244000,
                    minChunks: 1,
                    maxAsyncRequests: 30,
                    maxInitialRequests: 30,
                    cacheGroups: {
                        defaultVendors: {
                            test: /[\\/]node_modules[\\/]/,
                            priority: -10,
                            reuseExistingChunk: true,
                        },
                        default: {
                            minChunks: 2,
                            priority: -20,
                            reuseExistingChunk: true,
                        },
                        styles: {
                            name: 'styles',
                            test: /\.(css|scss)$/,
                            chunks: 'all',
                            enforce: true,
                        },
                    },
                },
                minimize: true,
                minimizer: [
                    '...',
                    new (require('css-minimizer-webpack-plugin'))(),
                ],
            };
        }

        // 图片优化
        config.module.rules.push({
            test: /\.(jpe?g|png|gif|webp)$/i,
            use: [
                {
                    loader: 'image-webpack-loader',
                    options: {
                        mozjpeg: {
                            progressive: true,
                            quality: 65,
                        },
                        optipng: {
                            enabled: true,
                            optimizationLevel: 7,
                        },
                        pngquant: {
                            quality: [0.65, 0.90],
                            speed: 4,
                            strip: true,
                        },
                        gifsicle: {
                            interlaced: false,
                        },
                        webp: {
                            quality: 75,
                            method: 6,
                        },
                    },
                },
            ],
        });

        return config;
    },

    // 缓存优化
    onDemandEntries: {
        maxInactiveAge: 60 * 60 * 1000,
        pagesBufferLength: 5,
    },

    // 输出优化
    output: 'standalone',
    poweredByHeader: false,
    generateEtags: true,
    compress: true,
    
    // 性能优化
    reactStrictMode: true,
    productionBrowserSourceMaps: false,
    staticPageGenerationTimeout: 120,
    
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

    // 禁用生产环境源映射
    productionBrowserSourceMaps: false,

    // 输出优化
    output: 'standalone',
    poweredByHeader: false,
    generateEtags: true,
    compress: true,
    
    // 静态页面优化
    staticPageGenerationTimeout: 120,
};

export default nextConfig;