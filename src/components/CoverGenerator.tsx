import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ColorThief from 'colorthief';
import { IoMusicalNotes, IoDownload, IoColorPalette } from 'react-icons/io5';
import html2canvas from 'html2canvas';

interface CoverData {
  songNumber: string;
  songName: string;
  artistName: string;
  coverImage: string;
  dominantColor: string;
  palette: string[];
  fontSize: {
    title: number;
    artist: number;
  };
  theme: 'default' | 'light' | 'dark';
  score: string;
}

const THEMES = {
  default: {
    background: 'linear-gradient(45deg, rgba(0,0,0,0.8) 0%, {color}99 50%, rgba(0,0,0,0.8) 100%)',
    text: 'text-white',
  },
  light: {
    background: 'linear-gradient(45deg, rgba(255,255,255,0.9) 0%, {color}66 50%, rgba(255,255,255,0.9) 100%)',
    text: 'text-gray-800',
  },
  dark: {
    background: 'linear-gradient(45deg, rgba(0,0,0,0.95) 0%, {color}33 50%, rgba(0,0,0,0.95) 100%)',
    text: 'text-white',
  },
};

// 添加常量配置
const COVER_CONFIG = {
  width: 1920,  // 16:9 的标准分辨率
  height: 1080,
  scale: 1,     // 导出时的缩放比例
};

export default function CoverGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coverData, setCoverData] = useState<CoverData>({
    songNumber: '001',
    songName: '',
    artistName: '',
    coverImage: '',
    dominantColor: 'rgb(0,0,0)',
    palette: [],
    fontSize: {
      title: 68,
      artist: 48,
    },
    theme: 'default',
    score: '',
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
            const palette = colorThief.getPalette(img, 5);
            
            setCoverData(prev => ({
              ...prev,
              coverImage: reader.result as string,
              dominantColor: `rgb(${dominantColor.join(',')})`,
              palette: palette.map((color: any[]) => `rgb(${color.join(',')})`)
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

  // 修改下载功能
  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    
    try {
      setIsLoading(true);
      
      // 创建一个临时的容器来确保导出尺寸
      const tempContainer = document.createElement('div');
      tempContainer.style.width = `${COVER_CONFIG.width}px`;
      tempContainer.style.height = `${COVER_CONFIG.height}px`;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      
      // 克隆预览内容到临时容器
      const clone = previewRef.current.cloneNode(true) as HTMLElement;
      clone.style.width = '100%';
      clone.style.height = '100%';
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      // 配置 html2canvas
      const canvas = await html2canvas(tempContainer, {
        width: COVER_CONFIG.width,
        height: COVER_CONFIG.height,
        scale: COVER_CONFIG.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc: { getElementsByTagName: (arg0: string) => any; }) => {
          // 确保克隆文档中的图片加载完成
          const images = clonedDoc.getElementsByTagName('img');
        //   return Promise.all(Array.from(images).map(img => {
        //     if (img.complete) return Promise.resolve();
        //     return new Promise(resolve => {
        //       img.onload = resolve;
        //       img.onerror = resolve;
        //     });
        //   }));
        }
      });
      
      // 清理临时容器
      document.body.removeChild(tempContainer);
      
      // 下载图片
      const link = document.createElement('a');
      link.download = `cover-${coverData.songNumber}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error downloading cover:', error);
    } finally {
      setIsLoading(false);
    }
  }, [coverData.songNumber]);

  // 调整字体大小
  const handleFontSize = (type: 'title' | 'artist', delta: number) => {
    setCoverData(prev => ({
      ...prev,
      fontSize: {
        ...prev.fontSize,
        [type]: Math.max(1, Math.min(10, prev.fontSize[type] + delta)),
      }
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-900 p-8">
      {/* 左侧控制面板 */}
      <div className="w-1/3 bg-gray-800 rounded-xl p-8 shadow-2xl mr-8 text-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            封面生成器
          </h2>
          <button
            onClick={handleDownload}
            disabled={!coverData.coverImage || isLoading}
            className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <IoDownload className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* 基本信息输入 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                编号
              </label>
              <input
                type="text"
                value={coverData.songNumber}
                onChange={(e) => setCoverData(prev => ({...prev, songNumber: e.target.value}))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="例如: 001"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                评分
              </label>
              <input
                type="text"
                value={coverData.score}
                onChange={(e) => setCoverData(prev => ({...prev, score: e.target.value}))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="例如: 9.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              歌曲名称
            </label>
            <input
              type="text"
              value={coverData.songName}
              onChange={(e) => setCoverData(prev => ({...prev, songName: e.target.value}))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="输入歌曲名称"
            />
            {/* 字体大小控制 */}
            <div className="flex items-center mt-2 space-x-2">
              <button
                onClick={() => handleFontSize('title', -1)}
                className="px-2 py-1 bg-gray-700 rounded"
              >
                -
              </button>
              <span className="text-sm">字体大小</span>
              <button
                onClick={() => handleFontSize('title', 1)}
                className="px-2 py-1 bg-gray-700 rounded"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              歌手名称
            </label>
            <input
              type="text"
              value={coverData.artistName}
              onChange={(e) => setCoverData(prev => ({...prev, artistName: e.target.value}))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="输入歌手名称"
            />
            {/* 字体大小控制 */}
            <div className="flex items-center mt-2 space-x-2">
              <button
                onClick={() => handleFontSize('artist', -1)}
                className="px-2 py-1 bg-gray-700 rounded"
              >
                -
              </button>
              <span className="text-sm">字体大小</span>
              <button
                onClick={() => handleFontSize('artist', 1)}
                className="px-2 py-1 bg-gray-700 rounded"
              >
                +
              </button>
            </div>
          </div>

          {/* 主题选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              主题风格
            </label>
            <div className="flex space-x-2">
              {Object.keys(THEMES).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setCoverData(prev => ({...prev, theme: theme as any}))}
                  className={`px-3 py-2 rounded ${
                    coverData.theme === theme ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              封面图片
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 右侧预览区域 */}
      <div className="w-2/3 relative">
        <div 
          ref={previewRef}
          className="w-full aspect-video relative overflow-hidden rounded-xl shadow-2xl bg-gray-800"
          style={{
            width: '100%',
            aspectRatio: '16/9',
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : coverData.coverImage ? (
            <>
              {/* 背景层 */}
              <div className="absolute inset-0">
                {/* 主背景图模糊效果 */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${coverData.coverImage})`,
                    filter: 'blur(40px) brightness(0.4)',
                    transform: 'scale(1.2)'
                  }}
                />
                
                {/* 渐变叠加层 */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: THEMES[coverData.theme].background.replace('{color}', coverData.dominantColor)
                  }}
                />
              </div>

              {/* 内容区域 */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex h-full"
              >
                {/* 大型编号 */}
                <div className="absolute top-8 left-8 z-20">
                  <div className={`${THEMES[coverData.theme].text} bg-white/15 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3`}>
                    <span className="text-4xl font-mono font-bold tracking-wider">
                      #{coverData.songNumber.padStart(3, '0')}
                    </span>
                    {coverData.score && (
                      <span
                        className="text-3xl font-bold tracking-wider"
                        style={{
                          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}
                      >
                        {coverData.score}
                      </span>
                    )}
                  </div>
                </div>

                {/* 主要内容区 */}
                <div className="flex items-center w-full px-16">
                  {/* 封面图片 */}
                  <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-[45%]"
                  >
                    <div className="relative group">
                      <img
                        src={coverData.coverImage}
                        alt="封面"
                        className="rounded-2xl shadow-2xl border-2 border-white/20 transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      {/* 装饰性遮罩 */}
                      <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: `linear-gradient(45deg, transparent 0%, ${coverData.dominantColor}40 100%)`
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* 文字信息 */}
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex-1 pl-20"
                  >
                    <div className="space-y-6">
                      {/* 歌曲标题 */}
                      <h1 
                        className={` font-bold ${THEMES[coverData.theme].text} leading-tight tracking-tight drop-shadow-xl`}
                        style={{
                          fontSize: `${coverData.fontSize.title}px`,
                          textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                      >
                        {coverData.songName || '歌曲名称'}
                      </h1>
                      
                      {/* 歌手名称 */}
                      <p 
                        className={` ${THEMES[coverData.theme].text} font-medium tracking-wide opacity-90`}
                        style={{
                          fontSize: `${coverData.fontSize.artist}px`,
                          textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      >
                        {coverData.artistName || '歌手名称'}
                      </p>
                    </div>

                    {/* 底部装饰元素 */}
                    <div className="absolute bottom-8 right-10">
                      <img 
                        src={THEMES[coverData.theme].text === 'text-white' 
                          ? '/img/shiyin/white.png' 
                          : '/img/shiyin/dark.png'
                        } 
                        alt="拾音集"
                        className="w-48 h-auto select-none"
                        style={{
                          filter: 'contrast(1.1) brightness(1.05)',  // 增加对比度和亮度
                          WebkitFontSmoothing: 'antialiased',       // 字体平滑
                          opacity: 0.95,                            // 稍微调整透明度
                          transform: 'scale(1.02)',                 // 轻微放大
                        }}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>上传图片预览封面效果</p>
            </div>
          )}
        </div>
        
        {/* 添加尺寸提示 */}
        <div className="mt-2 text-gray-400 text-sm text-center">
          预览尺寸: 1920 x 1080 px (16:9)
        </div>
      </div>
    </div>
  );
}