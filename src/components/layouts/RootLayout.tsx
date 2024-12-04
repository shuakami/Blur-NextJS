import React from 'react';
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';
import { useLayout } from './LayoutContext';

export function RootLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, toggleSidebar, isMobile } = useLayout();

  return (
    <div className="w-full h-screen flex overflow-hidden relative bg-white dark:bg-[#212121]">
      {/* 侧边栏 */}
      <div className={`
        fixed top-0 left-0 h-full z-50 w-[220px]
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[220px]'}
      `}>
        <MessagesSidebar onClose={toggleSidebar} />
      </div>

      {/* 移动端遮罩 */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 cursor-pointer z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* 主内容区 */}
      <div className={`
        flex-1 transition-[margin] duration-300 ease-in-out
        ${isSidebarOpen && !isMobile ? 'ml-[220px]' : 'ml-0'}
      `}>
        {children}
      </div>
    </div>
  );
}