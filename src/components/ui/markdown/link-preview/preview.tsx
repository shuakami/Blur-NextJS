import { FileText, Image as ImageIcon, File, Link2 } from 'lucide-react'
import { LinkInfo } from './types'
import { useState, memo } from 'react'
import { cn } from '../../../../lib/utils/utils'

interface PreviewProps {
  href: string;
  info: LinkInfo;
}

// 文件类型配置
const FILE_TYPES = {
  // 压缩文件
  'zip,rar,7z,tar,gz': { label: '压缩文件', color: 'text-orange-500', icon: File },
  
  // 文档
  'pdf': { label: 'PDF', color: 'text-red-500', icon: FileText },
  'doc,docx': { label: 'Word', color: 'text-blue-500', icon: File },
  'xls,xlsx': { label: 'Excel', color: 'text-green-500', icon: File },
  'ppt,pptx': { label: 'PPT', color: 'text-orange-500', icon: File },

  // 程序
  'exe,msi': { label: 'Windows 程序', color: 'text-purple-500', icon: File },
  'dmg': { label: 'Mac 程序', color: 'text-purple-500', icon: File },

  // 代码和文本
  'txt': { label: '文本文件', color: 'text-gray-500', icon: FileText },
  'json': { label: 'JSON', color: 'text-yellow-500', icon: File },
  'md': { label: 'Markdown', color: 'text-blue-400', icon: FileText },
} as const;

// 组件样式常量
const STYLES = {
  imageContainer: cn(
    "w-full max-w-[400px] h-auto rounded-md bg-gray-50/50 dark:bg-gray-800/50",
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
          <div className="absolute inset-0 animate-pulse bg-gray-100 dark:bg-gray-800" />
        )}
        <img 
          src={href} 
          alt={filename}
          className={cn(STYLES.image, imageLoading ? "opacity-0" : "opacity-100")}
          onLoad={() => setImageLoading(false)}
        />
      </div>
    </div>
  );
});

// 信息布局组件
const InfoLayout = memo(({ icon: Icon, title, subtitle, color }: {
  icon: typeof FileText;
  title: string;
  subtitle?: string;
  color?: string;
  favicon?: string;
}) => (
  <div className={STYLES.infoContainer}>
    <div className={STYLES.iconContainer}>
      <Icon className={`h-5 w-5 ${color || 'text-gray-400'}`} />
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
));

export const Preview = memo(({ href, info }: PreviewProps) => {
  if (info.type === 'image') {
    return <ImagePreview href={href} filename={info.filename} />;
  }

  if (info.type === 'file' || info.type === 'pdf') {
    const ext = info.filename?.split('.').pop()?.toLowerCase() || '';
    const fileType = Object.entries(FILE_TYPES).find(([types]) => 
      types.split(',').includes(ext)
    )?.[1];
    
    return (
      <InfoLayout 
        icon={fileType?.icon || File}
        title={info.filename || '未知文件'} 
        subtitle={`${fileType?.label || '未知格式'}${info.size ? ` · ${info.size}` : ''}`}
        color={fileType?.color || 'text-gray-400'}
      />
    );
  }

  return (
    <InfoLayout 
      icon={Link2}
      title={info.title || info.hostname || href}
      subtitle={info.description}
    />
  );
});

Preview.displayName = 'Preview';
ImagePreview.displayName = 'ImagePreview';
InfoLayout.displayName = 'InfoLayout';