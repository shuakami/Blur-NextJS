export default async function handler(req, res) {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Referer': 'https://weibo.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
        });

        const contentType = response.headers.get('content-type');
        const buffer = await response.arrayBuffer();

        res.setHeader('Content-Type', contentType || 'image/jpeg');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: 'Failed to fetch image' });
    }
}