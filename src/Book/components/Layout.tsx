import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { Route } from 'next';


type LayoutProps = {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* 侧边栏 */}
      <div className="w-64 bg-gray-50 border-r border-gray-200">
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <Link href={'/book' as Route} className="text-xl font-semibold text-gray-900">
            知识库
          </Link>
        </div>
        <nav className="p-4">
          {/* 后续添加导航菜单 */}
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1">
        <div className="h-16 border-b border-gray-200">
          {/* 后续添加顶部工具栏 */}
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout; 