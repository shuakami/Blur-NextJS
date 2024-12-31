import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Meta from '@/components/ui/Meta';

export default function GitHubErrorPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { message } = router.query;

  useEffect(() => {
    setMounted(true);
  }, []);

  const errorMessage = typeof message === 'string' 
    ? decodeURIComponent(message)
    : '授权过程中发生错误';

  return (
    <>
      <Meta pageName="GitHub授权" pageDescription="GitHub授权失败" />
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className={`text-center transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-red-50 dark:bg-red-500/10 rounded-full transform scale-150 blur-2xl" />
            <svg className="w-8 h-8 mx-auto relative text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="relative">
            <h2 className="text-base font-medium text-black dark:text-white mb-3">
              GitHub授权失败
            </h2>
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-500/10 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errorMessage}
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => window.location.href = '/plugin/github/auth'}
                  className="px-4 py-2 text-sm text-white dark:text-black bg-black dark:bg-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  重试授权
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 