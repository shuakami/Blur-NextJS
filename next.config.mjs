import withBundleAnalyzer from '@next/bundle-analyzer';

const analyzeBundles = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: true,
    analyzerMode: 'server',
analyzerPort: 'auto',
});

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
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            }
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
        
        // CDN 域名列表
        const CDN_DOMAINS = [
            'cdnjs.cloudflare.com',
            'lf3-cdn-tos.bytecdntp.com',
            'mirrors.sustech.edu.cn'
        ];
        
        return [
            {
                source: '/:all*(svg|jpg|png|webp|avif|js|css)',
                locale: false,
                headers: [
                    {
                        key: 'Cache-Control',
                        value: isDev 
                            ? 'no-cache, no-store'
                            : 'public, max-age=31536000, immutable'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: isDev
                            ? "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; connect-src *; font-src *; frame-src *; worker-src * blob:;"
                            : (
                                "default-src 'self'; " +
                                `script-src 'self' ${CDN_DOMAINS.join(' ')} 'unsafe-inline'; ` +
                                "worker-src 'self' blob:; " +
                                "style-src 'self' 'unsafe-inline'; " +
                                "img-src * data:; " +
                                `connect-src 'self' data: ${CDN_DOMAINS.join(' ')}; ` +
                                "font-src 'self' https://fonts.gstatic.com; " +
                                "upgrade-insecure-requests;"
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
                source: '/cdn/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=604800'
                    }
                ]
            },
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate'
                    }
                ]
            },
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: isDev
                            ? 'no-cache, no-store'
                            : 'public, max-age=3600, stale-while-revalidate=86400'
                    }
                ]
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

// 导出时包装配置
export default process.env.ANALYZE === 'true' ? analyzeBundles(nextConfig) : nextConfig;