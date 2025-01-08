import { FC, useState } from 'react';
import { useRouter } from 'next/router';
import Editor from '@/Book/components/Editor';
import { ChatBubbleLeftIcon, ClockIcon, StarIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const DocPage: FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    console.log('Content updated:', newContent);
  };

  return (
    <div className="min-h-screen bg-white text-sm">
      {/* 固定顶栏 */}
      <header className="flex justify-between items-center overflow-hidden h-[44px] px-[12px] py-[10px] fixed top-0 left-0 right-0 z-50">
        {/* 左侧面包屑 */}
        <div className="flex items-center text-[14px] h-full flex-grow-0 mr-[8px] min-w-0">
          <button className="flex items-center flex-shrink-1 whitespace-nowrap h-[24px] rounded-[6px] px-[6px] text-[#37352f] hover:bg-[#ebebea]">
            <span className="truncate max-w-[240px]">新页面</span>
          </button>
        </div>

        {/* 右侧按钮组 */}
        <div className="flex items-center pl-[10px] justify-between h-[44px]">
          {/* 编辑时间 */}
          <span className="flex items-center text-[14px] text-[#37352f80] h-[28px] whitespace-nowrap mr-2">
            上次编辑 23 分钟前
          </span>

          {/* 分享按钮 */}
          <button className="h-[28px] px-2 rounded-[6px] hover:bg-[#ebebea] mx-[2px]">
            分享
          </button>

          {/* 评论按钮 */}
          <button className="h-[28px] w-[34px] rounded-[6px] hover:bg-[#ebebea] mx-[2px] flex items-center justify-center">
            <ChatBubbleLeftIcon className="w-5 h-5 text-[#37352f]" />
          </button>

          {/* 更新按钮 */}
          <button className="h-[28px] w-[34px] rounded-[6px] hover:bg-[#ebebea] mx-[2px] flex items-center justify-center">
            <ClockIcon className="w-5 h-5 text-[#37352f]" />
          </button>

          {/* 收藏按钮 */}
          <button className="h-[28px] w-[34px] rounded-[6px] hover:bg-[#ebebea] mx-[2px] flex items-center justify-center">
            <StarIcon className="w-5 h-5 text-[#37352f]" />
          </button>

          {/* 更多按钮 */}
          <button className="h-[28px] w-[34px] rounded-[6px] hover:bg-[#ebebea] flex items-center justify-center">
            <EllipsisHorizontalIcon className="w-5 h-5 text-[#37352f]" />
          </button>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="mx-auto pt-20 max-w-[min(1000px,90vw)] min-w-[min(100%,320px)] px-[clamp(20px,5vw,80px)]">
        {/* 标题区域和按钮组 */}
        <div className="group">
          {/* 顶部按钮组 */}
          <div className="flex gap-[clamp(6px,0.8vw,12px)] mb-3 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="flex items-center h-[clamp(28px,3.5vw,36px)] px-[clamp(6px,0.8vw,12px)] rounded hover:bg-gray-100 text-gray-400">
              <svg viewBox="0 0 14 14" className="w-[clamp(14px,1.2vw,18px)] h-[clamp(14px,1.2vw,18px)] mr-[clamp(4px,0.6vw,8px)]" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M7 0c3.861 0 7 3.139 7 7s-3.139 7-7 7-7-3.139-7-7 3.139-7 7-7zM3.561 5.295a1.027 1.027 0 1 0 2.054 0 1.027 1.027 0 0 0-2.054 0zm5.557 1.027a1.027 1.027 0 1 1 0-2.054 1.027 1.027 0 0 1 0 2.054zm1.211 2.816a.77.77 0 0 0-.124-1.087.786.786 0 0 0-1.098.107c-.273.407-1.16.958-2.254.958-1.093 0-1.981-.55-2.244-.945a.788.788 0 0 0-1.107-.135.786.786 0 0 0-.126 1.101c.55.734 1.81 1.542 3.477 1.542 1.668 0 2.848-.755 3.476-1.541z"/>
              </svg>
              <span className="text-[clamp(12px,1vw,14px)]">添加图标</span>
            </button>

            <button className="flex items-center h-[clamp(28px,3.5vw,36px)] px-[clamp(6px,0.8vw,12px)] rounded hover:bg-gray-100 text-gray-400">
              <svg viewBox="0 0 14 14" className="w-[clamp(14px,1.2vw,18px)] h-[clamp(14px,1.2vw,18px)] mr-[clamp(4px,0.6vw,8px)]" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M2 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm0 12h10L8.5 5.5l-2 4-2-1.5L2 12z"/>
              </svg>
              <span className="text-[clamp(12px,1vw,14px)]">添加封面</span>
            </button>

            <button className="flex items-center h-[clamp(28px,3.5vw,36px)] px-[clamp(6px,0.8vw,12px)] rounded hover:bg-gray-100 text-gray-400">
              <svg viewBox="0 0 16 16" className="w-[clamp(14px,1.2vw,18px)] h-[clamp(14px,1.2vw,18px)] mr-[clamp(4px,0.6vw,8px)]" fill="currentColor">
                <path d="M4.095 15.465c.287 0 .499-.137.84-.444l2.523-2.277 4.47.007c2.058 0 3.214-1.19 3.214-3.22V4.22c0-2.03-1.156-3.22-3.213-3.22H3.213C1.163 1 0 2.19 0 4.22V9.53c0 2.037 1.196 3.22 3.165 3.213h.273v1.983c0 .45.24.738.657.738zM3.958 5.156a.454.454 0 01-.444-.45c0-.24.198-.438.444-.438h7.157c.246 0 .445.198.445.437a.45.45 0 01-.445.451H3.958zm0 2.256a.454.454 0 01-.444-.451c0-.24.198-.444.444-.444h7.157a.448.448 0 010 .895H3.958zm0 2.256a.448.448 0 010-.896h4.669c.246 0 .437.206.437.452a.438.438 0 01-.437.444H3.958z"/>
              </svg>
              <span className="text-[clamp(12px,1vw,14px)]">添加评论</span>
            </button>
          </div>

          {/* 标题区域 */}
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="无标题"
              className="w-full text-[clamp(24px,5vw,40px)] font-bold text-gray-800 leading-tight outline-none border-none bg-transparent placeholder-gray-300"
            />
          </div>
        </div>

        {/* 编辑器区域 */}
        <div className="relative">
          <div className="prose prose-lg max-w-none">
            <Editor content={content} onChange={handleContentChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocPage; 