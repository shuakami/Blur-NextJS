import { LinkInfo } from './types'

// 常量定义
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);
const FILE_EXTENSIONS = new Set([
  'zip', 'rar', '7z', 'tar', 'gz',
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'json', 'md', 'exe', 'msi', 'dmg'
]);

// URL 验证
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 获取文件信息
const getFileInfo = (url: URL): { ext?: string; filename?: string } => {
  const pathname = url.pathname;
  const filename = pathname.split('/').pop();
  const ext = filename?.split('.').pop()?.toLowerCase();
  return { ext, filename };
};

export async function getLinkInfo(href: string): Promise<LinkInfo> {
  if (!isValidUrl(href)) {
    return { type: 'link', title: href, hostname: '未知来源' };
  }

  try {
    const url = new URL(href);
    const { ext, filename } = getFileInfo(url);
    const baseInfo = { hostname: url.hostname, filename };

    // 文件类型判断
    if (ext) {
      if (IMAGE_EXTENSIONS.has(ext)) {
        return { ...baseInfo, type: 'image' };
      }
      if (ext === 'pdf') {
        return { ...baseInfo, type: 'pdf' };
      }
      if (FILE_EXTENSIONS.has(ext)) {
        return { ...baseInfo, type: 'file' };
      }
    }

    // 链接预览
    try {
      const response = await fetch(
        `/api/link-preview?url=${encodeURIComponent(href)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (!response.ok) {
        return { type: 'link', ...baseInfo, title: url.hostname };
      }

      const { title, description, favicon } = await response.json();
      return {
        type: 'link',
        ...baseInfo,
        title: title || url.hostname,
        description: description?.slice(0, 100),
        favicon
      };
    } catch {
      return { type: 'link', ...baseInfo, title: url.hostname };
    }
  } catch (error) {
    console.error('Failed to get link info:', error);
    return { type: 'link', title: href, hostname: '未知来源' };
  }
}