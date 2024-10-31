// pages/api/favicon.js
import axios from 'axios';

export default async function handler(req, res) {
    const { domain } = req.query;

    if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
    }

    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

    try {
        // 请求 Google 的 favicon
        const response = await axios.get(googleFaviconUrl, {
            responseType: 'arraybuffer', // 确保以二进制获取图片
        });

        // 让 Next.js 使用 Cache-Control 缓存结果
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

        // 返回图片
        res.setHeader('Content-Type', 'image/x-icon');
        res.status(200).send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch favicon' });
    }
}
