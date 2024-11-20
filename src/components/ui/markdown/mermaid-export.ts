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
                // 获取 SVG 的实际尺寸
                const svgSize = svgElement.getBoundingClientRect();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const scale = 2; // 2x 缩放以提高清晰度
                
                // 设置画布尺寸
                canvas.width = svgSize.width * scale;
                canvas.height = svgSize.height * scale;
                
                const img = new Image();
                img.src = 'data:image/svg+xml;base64,' + utf8ToBase64(svgData);
                
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        if (ctx) {
                            // 清空画布
                            ctx.fillStyle = isDark ? '#18181B' : '#ffffff';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            
                            // 设置缩放并绘制
                            ctx.scale(scale, scale);
                            ctx.drawImage(img, 0, 0, svgSize.width, svgSize.height);
                            
                            // 导出为 PNG
                            canvas.toBlob(
                                (blob) => {
                                    if (blob) {
                                        downloadBlob(blob, `mermaid-diagram.png`);
                                        resolve();
                                    } else {
                                        reject(new Error('Failed to create PNG blob'));
                                    }
                                },
                                'image/png',
                                1.0
                            );
                        } else {
                            reject(new Error('Failed to get canvas context'));
                        }
                    };
                    
                    img.onerror = () => reject(new Error('Failed to load SVG image'));
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