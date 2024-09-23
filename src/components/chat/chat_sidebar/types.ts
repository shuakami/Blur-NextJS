// types.ts
export interface DateGroup {
    date: number; // 时间戳
    children: SidebarItem[];
}

export interface SidebarItem {
    icon?: React.ReactNode;
    id?: string;
    label: string;
    href?: string;
    children?: SidebarItem[];
}

export type SidebarItemType = DateGroup | SidebarItem;
