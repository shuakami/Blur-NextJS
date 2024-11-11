/** @type {import('next').NextConfig} */
const nextConfig = {
    // 编译优化
    swcMinify: true,
    compiler: {
        removeConsole: {
            exclude: ['error', 'warn'], // 保留错误和警告日志
        },
    },

    // 图片优化 - 更精确的配置
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
        deviceSizes: [640, 750, 828, 1080, 1200, 1920], // 优化断点
        imageSizes: [16, 32, 48, 64, 96, 128, 256], // 增加常用尺寸
        formats: ['image/webp'], // 移除 avif，因为支持度还不够广泛
        minimumCacheTTL: 60 * 60 * 24, // 24小时缓存
    },

    // 实验性功能优化
    experimental: {
        optimizeCss: true,
        // 移除 turbo.rules 因为 @svgr/webpack 已被移除
        scrollRestoration: true,
        webVitalsAttribution: ['CLS', 'LCP', 'FID'], // 添加 FID 监控
        optimizePackageImports: [
            '@headlessui/react',
            'framer-motion',
            'react-markdown',
            '@radix-ui/react-dialog',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
        ],
    },

    // webpack 配置优化
    webpack: (config, { dev, isServer }) => {
        if (!isServer && !dev) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    minSize: 20000,
                    maxSize: 90000, // 减小chunk大小
                    cacheGroups: {
                        framework: {
                            name: 'framework',
                            chunks: 'all',
                            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
                            priority: 40,
                            enforce: true,
                        },
                        commons: {
                            name: 'commons',
                            chunks: 'all',
                            minChunks: 2,
                            priority: 20,
                        },
                        lib: {
                            test: /[\\/]node_modules[\\/]/,
                            name(module) {
                                const match = module.context?.match(
                                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                                );
                                if (!match || !match[1]) return 'vendors';
                                const packageName = match[1];
                                return `lib.${packageName.replace('@', '')}`;
                            },
                            priority: 10,
                            minChunks: 1,
                            reuseExistingChunk: true,
                        },
                    },
                },
                runtimeChunk: {
                    name: 'runtime',
                },
            };
        }

        return config;
    },

    // 安全头部优化
    async headers() {
        const isDev = process.env.NODE_ENV !== 'production';
        const securityHeaders = {
            production: {
                'Content-Security-Policy': [
                    "default-src 'self'",
                    "script-src 'self' https://*.clerk.accounts.dev https://*.luoxiaohei.cn 'unsafe-inline'",
                    "worker-src 'self' blob:",
                    "style-src 'self' 'unsafe-inline'",
                    "img-src * data:",
                    "connect-src 'self' data: https://*.clerk.accounts.dev https://*.luoxiaohei.cn https://*.sdjz.wiki",
                    "font-src 'self' https://fonts.gstatic.com",
                    "upgrade-insecure-requests"
                ].join('; '),
                'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
                'X-Frame-Options': 'DENY',
                'X-Content-Type-Options': 'nosniff',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
                'X-DNS-Prefetch-Control': 'on',
            },
            development: {
                'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; worker-src 'self' blob:",
            }
        };

        return [
            {
                source: '/:all*(svg|jpg|png|webp|js|css)',
                locale: false,
                headers: [
                    {
                        key: 'Cache-Control',
                        value: isDev 
                            ? 'no-cache, no-store'
                            : 'public, max-age=31536000, immutable'
                    },
                    ...Object.entries(isDev ? securityHeaders.development : securityHeaders.production)
                        .map(([key, value]) => ({ key, value }))
                ],
            }
        ];
    },

    // 基础优化
    output: 'standalone',
    poweredByHeader: false,
    generateEtags: true,
    compress: true,
    productionBrowserSourceMaps: false,
    staticPageGenerationTimeout: 180,
};

export default nextConfig;