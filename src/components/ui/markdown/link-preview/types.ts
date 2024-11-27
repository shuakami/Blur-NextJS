export type LinkType = 'image' | 'pdf' | 'file' | 'link';

export interface LinkInfo {
  type: LinkType;
  filename?: string;
  hostname?: string;
  title?: string;
  description?: string;
  favicon?: string;
  size?: string;
}