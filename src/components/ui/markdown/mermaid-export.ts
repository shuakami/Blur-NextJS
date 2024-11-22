import { ColorScheme } from './mermaid-themes';

// Base64 编码函数
export const utf8ToBase64 = (str: string): string => {
    try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode(parseInt('0x' + p1));
            }));
    } catch (err) {
        console.error('Base64 encoding error:', err);
        return '';
    }
};

// 通用下载函数
export const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// 导出图表函数
export const exportDiagram = async (
    svgElement: SVGElement, 
    format: 'svg' | 'png' | 'json', 
    colorScheme: ColorScheme,
    chartContent: string
) => {
    const isDark = colorScheme === 'system' ? 
        window.matchMedia('(prefers-color-scheme: dark)').matches : 
        colorScheme === 'dark';

    try {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        
        switch (format) {
            case 'svg':
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                downloadBlob(svgBlob, `mermaid-diagram.svg`);
                break;
                
            case 'png':
                const svgSize = svgElement.getBoundingClientRect();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const scale = 8; // 增加到8倍
                
                // 增加边距
                const padding = 100 * scale;
                
                // 限制最大尺寸
                const maxDimension = 16000; // 增加最大限制
                const targetWidth = Math.min((svgSize.width * scale) + (padding * 2), maxDimension);
                const targetHeight = Math.min((svgSize.height * scale) + (padding * 2), maxDimension);
                
                // 计算实际缩放比例
                const actualScale = Math.min(
                    (targetWidth - padding * 2),
                    (targetHeight - padding * 2) ,
                    scale
                );
                
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                
                const img = new Image();
                const svgDataUrl = 'data:image/svg+xml;base64,' + utf8ToBase64(svgData);
                
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        if (ctx) {
                            // 使用更高质量的渲染设置
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = 'high';
                            
                            // 设置背景
                            ctx.fillStyle = isDark ? '#18181B' : '#ffffff';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            
                            // 在中心位置绘制图像
                            const drawWidth = svgSize.width * actualScale;
                            const drawHeight = svgSize.height * actualScale;
                            const x = (canvas.width - drawWidth) / 2;
                            const y = (canvas.height - drawHeight) / 2;
                            
                            // 分步渲染以提高质量
                            const tempCanvas = document.createElement('canvas');
                            const tempCtx = tempCanvas.getContext('2d');
                            tempCanvas.width = drawWidth;
                            tempCanvas.height = drawHeight;
                            
                            if (tempCtx) {
                                tempCtx.imageSmoothingEnabled = true;
                                tempCtx.imageSmoothingQuality = 'high';
                                tempCtx.drawImage(img, 0, 0, drawWidth, drawHeight);
                                
                                // 将临时画布的内容绘制到主画布
                                ctx.drawImage(tempCanvas, x, y);
                            }
                            
                            // 使用更高的位深度导出
                            canvas.toBlob(
                                (blob) => {
                                    if (blob) {
                                        downloadBlob(blob, `mermaid-diagram.png`);
                                        resolve();
                                    } else {
                                        reject(new Error('Failed to create PNG blob'));
                                    }
                                },
                                'image/png'
                            );
                        } else {
                            reject(new Error('Failed to get canvas context'));
                        }
                    };
                    
                    img.onerror = () => reject(new Error('Failed to load SVG image'));
                    img.src = svgDataUrl;
                });
                break;
                
            case 'json':
                const jsonBlob = new Blob([chartContent], { type: 'application/json' });
                downloadBlob(jsonBlob, `mermaid-diagram.json`);
                break;
        }
    } catch (err) {
        console.error('Export error:', err);
        // 这里可以添加错误提示 UI
    }
};