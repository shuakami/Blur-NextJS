import { toast } from '../../hooks/ui/use-toast';

/**
 * 下载方法类型
 * @returns {Promise<boolean>} 下载是否成功
 */
type DownloadMethod = () => Promise<boolean>;

/**
 * 尝试本地下载
 * @param {string} src - 图片的源地址
 * @param {string} [alt] - 下载时的文件名
 * @returns {Promise<boolean>} 下载是否成功
 */
export const tryLocalDownload = (src: string, alt?: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = document.querySelector('div[role="dialog"] img') as HTMLImageElement;
            
            if (!img || !ctx) {
                reject(new Error('无法获取图片元素'));
                return;
            }
            
            if (!img.complete) {
                img.onload = () => {
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('无法创建 Blob'));
                            return;
                        }
                        
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = alt || 'image.png';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        resolve(true);
                    }, 'image/png');
                };
            } else {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('无法创建 Blob'));
                        return;
                    }
                    
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = alt || 'image.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    resolve(true);
                }, 'image/png');
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * 尝试直接下载
 * @param {string} src - 图片的源地址
 * @param {string} [alt] - 下载时的文件名
 * @returns {Promise<boolean>} 下载是否成功
 */
export const tryDirectDownload = async (src: string, alt?: string): Promise<boolean> => {
    try {
        const response = await fetch(src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = alt || src.split('/').pop() || 'image.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('直接下载失败:', error);
        return false;
    }
};

/**
 * 尝试服务器代理下载
 * @param {string} src - 图片的源地址
 * @param {string} [alt] - 下载时的文件名
 * @returns {Promise<boolean>} 下载是否成功
 */
export const tryProxyDownload = async (src: string, alt?: string): Promise<boolean> => {
    try {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(src)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('服务器下载失败');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = alt || src.split('/').pop() || 'image.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('服务器下载失败:', error);
        return false;
    }
};

/**
 * 主下载函数
 * @param {string} src - 图片的源地址
 * @param {string} [alt] - 下载时的文件名
 * @returns {Promise<void>}
 */
export const downloadImage = async (src: string, alt?: string): Promise<void> => {
    try {
        // 1. 先尝试本地下载
        await tryLocalDownload(src, alt);
    } catch (error) {
        toast({
            title: '下载失败',
            description: '正在尝试另外一种下载方式....',
        });
        // 2. 本地下载失败，检查是否需要处理跨域
        const needsProxy = src.includes('sinaimg.cn') || src.includes('其他需要代理的域名');
        
        if (needsProxy) {
            toast({
                title: '尝试下载',
                description: '正在尝试使用代理下载图片....',
            });
            // 对于已知需要处理跨域的域名，直接使用代理
            const success = await tryProxyDownload(src, alt);
            if (!success) {
                toast({
                    title: '尝试失败',
                    description: '最后一种下载方式也失败了，请手动下载图片',
                });
                window.open(src, '_blank');
            }
        } else {
            // 对于其他域名，先尝试直接下载
            const directSuccess = await tryDirectDownload(src, alt);
            if (!directSuccess) {
                toast({
                    title: '尝试失败',
                    description: '还有最后一种下载方式....',
                });
                // 直接下载失败才使用代理
                const proxySuccess = await tryProxyDownload(src, alt);
                if (!proxySuccess) {
                    toast({
                        title: '尝试失败',
                        description: '最后一种下载方式也失败了，请手动下载图片',
                    });
                    window.open(src, '_blank');
                }
            }
        }
    }
};