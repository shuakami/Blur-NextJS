import { DropdownMenu } from '@/components/ui/dropdown-menu-home';
import '@/app/globals.css'
import {AccessIcon, ManagerIcon} from "hugeicons-react";

export default function Home() {

    const menuItems = [
        {
            title: "Design",
            items: [
                { icon: "🖌️", title: "Design", description: "Responsive design" },
                { icon: "🧭", title: "Navigation", description: "Link pages" },
                { icon: <AccessIcon/>, title: "Animations", description: "Refined animations" },
            ],
        },
        {
            title: "Publish",
            items: [
                { icon: <ManagerIcon/>, title: "Management", description: "Site control" }, // SVG 字符串
                { icon: "📋", title: "Forms", description: "Capture leads" },
                { icon: "🔍", title: "SEO", description: "Search optimized" },
            ],
        },
        {
            title: "Scale",
            items: [
                { icon: "🌍", title: "Localization", description: "Global reach" },
                { icon: "📝", title: "CMS", description: "Manage content" },
                { icon: "🤖", title: "AI", description: "Boost workflow" },
            ],
        },
    ];

    return (
        <DropdownMenu items={menuItems} columns={3} />
    );
}