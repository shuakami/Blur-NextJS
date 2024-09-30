/** @type {import('next').NextConfig} */
const nextConfig = {

    swcMinify: true, // 使用 SWC 进行快速代码压缩

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
        deviceSizes: [640, 768, 1024, 1280, 1600],  // 为响应式图片优化的尺寸
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],  // 小图片优化的尺寸
    },


    // 性能优化
    experimental: {
        optimizeCss: true, // 启用 CSS 优化
    },

    webpack: (config, {dev, isServer}) => {
        const isProd = process.env.NODE_ENV === 'production';

        if (isProd && !isServer) {
            // 移除生产环境下的 console 日志
            config.optimization.minimizer.forEach((minimizer) => {
                if (minimizer.constructor.name === 'TerserPlugin') {
                    minimizer.options.terserOptions.compress.drop_console = true;
                }
            });
        }

        return config;
    },


    // 放宽 CSP 以避免 nonce 报错
    async headers() {
        const isDev = process.env.NODE_ENV !== 'production';
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: (
                            `default-src 'self'; ` +
                            `script-src 'self' https://basilisk-86.clerk.accounts.dev https://settled-basilisk-86.clerk.accounts.dev https://clerk.luoxiaohei.cn https://accounts.luoxiaohei.cn 'unsafe-inline'` +
                            (isDev ? " 'unsafe-eval';" : ";") +
                            `worker-src 'self' blob:; ` +
                            `style-src 'self' 'unsafe-inline'; ` +
                            `img-src 'self' data: https://github.com https://avatars.githubusercontent.com https://basilisk-86.clerk.accounts.dev https://blur.al001.luoxiaohei.cn https://blur-api.al001.sdjz.wiki https://img.clerk.com; ` +
                            `connect-src 'self' https://basilisk-86.clerk.accounts.dev https://settled-basilisk-86.clerk.accounts.dev https://blur.al001.luoxiaohei.cn https://clerk.luoxiaohei.cn https://accounts.luoxiaohei.cn https://blur-api.al001.sdjz.wiki http://blur-api.al001.sdjz.wiki;` +
                            (isDev ? " http://localhost:33413;" : ";") +
                            `font-src 'self' https://fonts.gstatic.com;`
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
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
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
                        value: "default-src 'none';", // 禁止访问云元数据路径
                    },
                ],
            },
        ];
    },

    productionBrowserSourceMaps: false, // 禁用生产环境下的源映射，提高安全性
};

export default nextConfig;
