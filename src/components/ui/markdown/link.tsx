import { toast } from '@/hooks/use-toast';
import React, { useState, useMemo } from 'react';
import { ToastAction } from '../toast';

export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ href, ...props }) => {
  // 使用 useMemo 缓存访问记录的 key，避免重复计算
  const visitedKey = useMemo(() => 
    href ? `visited-${encodeURIComponent(href)}` : null
  , [href]);

  // 判断是否是外部链接
  const isExternal = useMemo(() => 
    href?.startsWith('http') || href?.startsWith('https')
  , [href]);

  const [isVisited, setIsVisited] = useState(() => {
    // 初始化时就检查访问状态，避免二次渲染
    if (visitedKey) {
      try {
        return !!localStorage.getItem(visitedKey);
      } catch (e) {
        // localStorage 可能被禁用，静默失败
        toast({
            title: '您的浏览器不支持 localStorage',
            action: (
              <ToastAction altText="更新浏览器">
                <a href="https://firefox.com" target="_blank" rel="noopener noreferrer">
                更新
                </a>
              </ToastAction>
            ),
            description: '请升级您的浏览器以获得更好的体验',
            variant: 'destructive'
          });
        return false;
      }
    }
    return false;
  });

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (visitedKey) {
      try {
        localStorage.setItem(visitedKey, 'true');
        setIsVisited(true);
      } catch (e) {
        // 处理 localStorage 可能的异常
        console.warn('Failed to save visited state:', e);
      }
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <a 
      className={`text-link ${isVisited ? 'visited' : ''}`}
      href={href}
      onClick={handleClick}
      // 外部链接添加安全属性和性能优化
      {...(isExternal ? {
        target: "_blank",
        rel: "noopener noreferrer",
        // DNS 预获取
        prefetch: "true",
        // 预连接
        preconnect: "true",
        // 预加载
        preload: "true"
      } : {})}
      {...props}
    />
  );
};
