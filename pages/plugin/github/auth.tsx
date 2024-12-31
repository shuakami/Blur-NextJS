import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { GitHubService } from '@/lib/github';
import Meta from '@/components/ui/Meta';

export default function GitHubAuthPage() {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      console.log('User not logged in, redirecting to login page');
      window.location.href = '/login';
      return;
    }

    const redirectToGitHub = async () => {
      try {
        console.log('Getting GitHub auth URL...');
        const authUrl = await GitHubService.getAuthUrl();
        
        console.log('Redirecting to GitHub auth URL:', authUrl);
        if (authUrl) {
          window.location.href = authUrl;
        } else {
          console.error('Auth URL is empty');
          window.location.href = '/plugin/github/error?message=' + encodeURIComponent('获取授权URL失败');
        }
      } catch (error) {
        console.error('Failed to get GitHub auth URL:', error);
        window.location.href = '/plugin/github/error?message=' + encodeURIComponent('获取授权URL失败');
      }
    };

    if (isLoaded && user) {
      console.log('User logged in, starting GitHub auth process');
      redirectToGitHub();
    }
  }, [isLoaded, user]);

  return (
    <>
      <Meta pageName="GitHub授权" pageDescription="正在准备GitHub授权" />
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className={`text-center transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mb-6">
            <svg viewBox="0 0 16 16" className="w-8 h-8 mx-auto text-black dark:text-white" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </div>
          <h2 className="text-base font-normal text-black dark:text-white mb-2">
            正在准备GitHub授权
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            请稍候...
          </p>
        </div>
      </div>
    </>
  );
}