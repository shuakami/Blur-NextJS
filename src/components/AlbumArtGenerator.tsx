import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ColorThief from 'colorthief';
import { IoDownload } from 'react-icons/io5';
import html2canvas from 'html2canvas';

interface AlbumData {
  coverImage: string;
  dominantColor: string;
  blurAmount: number;
  brightness: number;
  gradientOpacity: number;
}

const COVER_CONFIG = {
  width: 1920,  // 16:9 的标准分辨率
  height: 1080,
  scale: 2,     // 导出时的缩放比例
};

export default function AlbumBackground() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [albumData, setAlbumData] = useState<AlbumData>({
    coverImage: '',
    dominantColor: 'rgb(0,0,0)',
    blurAmount: 40,
    brightness: 0.4,
    gradientOpacity: 0.8,
  });

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = reader.result as string;
          img.onload = () => {
            const colorThief = new ColorThief();
            const dominantColor = colorThief.getColor(img);
            setAlbumData(prev => ({
              ...prev,
              coverImage: reader.result as string,
              dominantColor: `rgb(${dominantColor.join(',')})`
            }));
            setIsLoading(false);
          };
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsLoading(false);
    }
  };

  // 下载功能
  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    
    try {
      setIsLoading(true);
      
      const tempContainer = document.createElement('div');
      tempContainer.style.width = `${COVER_CONFIG.width}px`;
      tempContainer.style.height = `${COVER_CONFIG.height}px`;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      
      const clone = previewRef.current.cloneNode(true) as HTMLElement;
      clone.style.width = '100%';
      clone.style.height = '100%';
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        width: COVER_CONFIG.width,
        height: COVER_CONFIG.height,
        scale: COVER_CONFIG.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      
      document.body.removeChild(tempContainer);
      
      const link = document.createElement('a');
      link.download = `video-background.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error downloading background:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 p-8">
      {/* 左侧控制面板 */}
      <div className="w-1/3 bg-gray-800 rounded-xl p-8 shadow-2xl mr-8 text-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            视频背景生成器
          </h2>
          <button
            onClick={handleDownload}
            disabled={!albumData.coverImage || isLoading}
            className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <IoDownload className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* 图片上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              专辑图片
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
            />
          </div>

          {/* 模糊度控制 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              背景模糊度
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={albumData.blurAmount}
              onChange={(e) => setAlbumData(prev => ({...prev, blurAmount: Number(e.target.value)}))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* 亮度控制 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              背景亮度
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={albumData.brightness * 100}
              onChange={(e) => setAlbumData(prev => ({...prev, brightness: Number(e.target.value) / 100}))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* 渐变透明度 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              渐变强度
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={albumData.gradientOpacity * 100}
              onChange={(e) => setAlbumData(prev => ({...prev, gradientOpacity: Number(e.target.value) / 100}))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 右侧预览区域 */}
      <div className="w-2/3 relative">
        <div 
          ref={previewRef}
          className="w-full aspect-video relative overflow-hidden rounded-xl shadow-2xl bg-gray-800"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : albumData.coverImage ? (
            <>
              {/* 背景层 */}
              <div className="absolute inset-0">
                {/* 主背景图模糊效果 */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${albumData.coverImage})`,
                    filter: `blur(${albumData.blurAmount}px) brightness(${albumData.brightness})`,
                    transform: 'scale(1.2)'
                  }}
                />
                
                {/* 渐变叠加层 */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(45deg, rgba(0,0,0,${albumData.gradientOpacity}) 0%, ${albumData.dominantColor}66 50%, rgba(0,0,0,${albumData.gradientOpacity}) 100%)`
                  }}
                />
              </div>

              {/* 主图层 */}
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative z-10 flex items-center h-full px-16"
              >
                <div className="w-[45%]">
                  <div className="relative group">
                    <img
                      src={albumData.coverImage}
                      alt="专辑封面"
                      className="rounded-2xl shadow-2xl border-2 border-white/20 transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    {/* 装饰性遮罩 */}
                    <div 
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: `linear-gradient(45deg, transparent 0%, ${albumData.dominantColor}40 100%)`
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>上传图片预览效果</p>
            </div>
          )}
        </div>
        
        {/* 尺寸提示 */}
        <div className="mt-2 text-gray-400 text-sm text-center">
          预览尺寸: 1920 x 1080 px (16:9)
        </div>
      </div>
    </div>
  );
}