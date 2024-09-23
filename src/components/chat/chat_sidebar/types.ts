// types.ts
export interface DateGroup {
    date: number; // 时间戳
    children: SidebarItem[];
}

export interface SidebarItem {
    id: string; // 新增唯一标识符
    label: string;
    href?: string;
    icon?: React.ReactNode;
    children?: SidebarItemType[];
    date?: number;
}

export type SidebarItemType = DateGroup | SidebarItem;
