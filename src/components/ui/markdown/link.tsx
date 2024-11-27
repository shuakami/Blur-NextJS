import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { LinkProps as NextLinkProps } from "next/link"
import { getLinkInfo } from './link-preview/utils'
import { Preview } from '@/components/ui/markdown/link-preview/preview'
import { LinkInfo } from './link-preview/types'

interface LinkProps extends Omit<NextLinkProps<string>, 'href'> {
  href: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href: originalHref, children, ...props }) => {
  // 处理 href
  const href = React.useMemo(() => {
    if (originalHref.startsWith('http')) return originalHref.startsWith('https') ? originalHref : `https://${originalHref}`;
    
    const baseUrl = window.location.origin;
    return originalHref.startsWith('/') 
      ? `${baseUrl}${originalHref}`
      : `${baseUrl}${window.location.pathname.split('/').slice(0, -1).join('/')}/${originalHref}`;
  }, [originalHref]);

  // 访问记录相关
  const visitedKey = React.useMemo(() => 
    href ? `visited-${encodeURIComponent(href)}` : null
  , [href]);

  const isExternal = React.useMemo(() => 
    href.startsWith('http') || href.startsWith('https')
  , [href]);

  const [isVisited, setIsVisited] = React.useState(() => {
    if (!visitedKey) return false;
    try {
      return !!localStorage.getItem(visitedKey);
    } catch {
      return false;
    }
  });

  // Popover 相关
  const [showPopover, setShowPopover] = React.useState(false);
  const [linkInfo, setLinkInfo] = React.useState<LinkInfo>({ type: 'link' });
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    const controller = new AbortController();
    getLinkInfo(href)
      .then(info => setLinkInfo(info))
      .catch(() => {/* 保持默认状态 */});
    return () => controller.abort();
  }, [href]);

  const handleMouseEnter = React.useCallback(() => {
    timeoutRef.current = setTimeout(() => setShowPopover(true), 450);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowPopover(false);
  }, []);

  const handleClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (visitedKey) {
      try {
        localStorage.setItem(visitedKey, 'true');
        setIsVisited(true);
      } catch (e) {
        console.warn('Failed to save visited state:', e);
      }
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  }, [visitedKey, props.onClick]);

  React.useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const displayHref = href.replace(`${window.location.origin}/chat`, window.location.origin);

  return (
    <Popover open={showPopover}>
      <PopoverTrigger asChild>
        <a 
          href={displayHref}
          className={`text-link inline-flex items-center gap-1.5 ${isVisited ? 'visited' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          {...(isExternal ? {
            target: "_blank",
            rel: "noopener noreferrer",
            prefetch: "true",
            preconnect: "true",
            preload: "true"
          } : {})}
          {...props}
        >
          {children}
        </a>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-2 mt-1" 
        align="start"
        sideOffset={8}
      >
        <Preview href={displayHref} info={linkInfo} />
      </PopoverContent>
    </Popover>
  );
};