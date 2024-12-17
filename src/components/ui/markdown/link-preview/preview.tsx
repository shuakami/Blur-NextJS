import { useFileTheme } from '@/hooks/ui/useFileTheme';
import { FileText, Link2 } from 'lucide-react'
import { LinkInfo } from './types'
import { useState, memo } from 'react'
import { cn } from '@/lib/utils/utils'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner';

interface PreviewProps {
  href: string;
  info: LinkInfo;
}

// 组件样式常量
const STYLES = {
  imageContainer: cn(
    "w-full max-w-[400px] h-full rounded-md bg-gray-50/50 dark:bg-gray-800/50",
    "relative overflow-hidden group cursor-zoom-in"
  ),
  image: cn(
    "w-full h-full object-contain transition-all duration-200",
    "group-hover:scale-105"
  ),
  infoContainer: cn(
    "flex items-center gap-3.5 py-1.5 px-2.5 rounded-lg",
    "hover:bg-gray-50/80 dark:hover:bg-gray-800/30",
    "transition-colors duration-200"
  ),
  iconContainer: cn(
    "h-9 w-9 shrink-0 rounded-lg",
    "bg-gray-50/80 dark:bg-gray-800/30",
    "flex items-center justify-center",
    "ring-1 ring-gray-200/50 dark:ring-gray-700/50"
  )
};

// 图片预览组件
const ImagePreview = memo(({ href, filename }: { href: string; filename?: string }) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  return (
    <div className="-m-1 p-1">
      <div className={STYLES.imageContainer}>
        {imageLoading && (
          <div className={cn("w-80 h-8 flex items-center justify-center")}>
            <Spinner className="w-8 h-8 translate-y-1/2 pt-16" />
          </div>
        )}
        <Image
          src={href} 
          alt={filename || ''}
          className={cn(STYLES.image, imageLoading ? "opacity-0" : "opacity-100")}
          onLoad={() => setImageLoading(false)}
          width={400}
          height={200}
          priority
        />
      </div>
    </div>
  );
});

// 信息布局组件
const InfoLayout = memo(({ 
  icon: Icon, 
  title, 
  subtitle, 
  color,
  favicon 
}: {
  icon: typeof FileText;
  title: string;
  subtitle?: string;
  color?: string;
  favicon?: string;
}) => {
  const [showFallback, setShowFallback] = useState(false);

  return (
    <div className={STYLES.infoContainer}>
      <div className={STYLES.iconContainer}>
        {favicon && !showFallback ? (
          <Image
            src={favicon}
            alt=""
            width={20}
            height={20}
            className="rounded"
            onError={() => setShowFallback(true)}
          />
        ) : (
          <Icon className={cn('h-5 w-5', color || 'text-gray-400 dark:text-gray-500')} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 max-w-[250px]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
});

export const Preview = memo(({ href, info }: PreviewProps) => {
  const { getFileTypeInfo } = useFileTheme();

  if (info.type === 'image') {
    return <ImagePreview href={href} filename={info.filename} />;
  }

  if (info.type === 'file' || info.type === 'pdf') {
    const fileType = getFileTypeInfo(info.filename || '');
    
    return (
      <InfoLayout 
        icon={fileType.icon}
        title={info.filename || '未知文件'} 
        subtitle={`${fileType.label}${info.size ? ` · ${info.size}` : ''}`}
        color={fileType.color}
      />
    );
  }

  // 构建 favicon URL
  const favicon = info.favicon || `https://www.google.com/s2/favicons?domain=${info.hostname}&sz=64`;

  return (
    <InfoLayout 
      icon={Link2}
      title={info.title || info.hostname || href}
      subtitle={info.description}
      favicon={favicon}
    />
  );
});

Preview.displayName = 'Preview';
ImagePreview.displayName = 'ImagePreview';
InfoLayout.displayName = 'InfoLayout';