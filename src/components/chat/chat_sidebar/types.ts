export interface DateGroup {
    date: number; // 时间戳，表示日期
    children: SidebarItem[];
}

export interface SidebarItem {
    icon?: React.ReactNode;
    id?: string;
    label: string;
    href?: string;
    onClick?: () => void; // 用于点击事件
}

export type SidebarItemType = DateGroup | SidebarItem;
