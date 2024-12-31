import { useEffect, useState } from 'react';
import Meta from '@/components/ui/Meta';

export default function GitHubSuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Meta pageName="GitHub授权" pageDescription="GitHub授权成功" />
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className={`text-center transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mb-6">
            <svg className="w-8 h-8 mx-auto text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-base font-normal text-black dark:text-white mb-2">
            GitHub授权成功
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Blur已获得访问您GitHub账户的权限
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.close()}
                className="px-4 py-1.5 text-sm text-black dark:text-white border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                关闭窗口
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 