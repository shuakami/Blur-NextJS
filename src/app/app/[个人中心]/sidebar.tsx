import * as React from "react"
import {User, CreditCard, Bell, Shield, HelpCircle, LogOut} from "lucide-react"
import {Button} from "@/components/ui/button"

const menuItems = [
    {id: "profile", icon: User, label: "个人资料", href: "/profile"},
    {id: "subscription", icon: CreditCard, label: "订阅管理", href: "/subscription"},
    {id: "notifications", icon: Bell, label: "通知设置", href: "/notifications"},
    {id: "security", icon: Shield, label: "安全设置", href: "/security"},
    {id: "help", icon: HelpCircle, label: "帮助中心", href: "/help"},
]

interface SidebarProps {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export const Sidebar: React.FC<SidebarProps> = ({activeTab, setActiveTab}) => {
    return (
        <div className="p-2 w-64 flex flex-col border-r bg-muted/30 py-6 px-2 space-x-1.5">
            <div className="mb-6 px-6 mt-5">
                <h1 className="text-3xl font-semibold">个人中心</h1>
                <p className="text-sm-md text-muted-foreground mt-1.5">管理您的账户和偏好设置</p>
            </div>
            <nav className="flex-grow space-y-2 px-1">
                {menuItems.map((item) => (
                    <Button
                        key={item.id}
                        variant={activeTab === item.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon className="mr-3 h-4 w-4"/>
                        <span className="text-sm mt-0.5">{item.label}</span>
                    </Button>
                ))}
            </nav>
            <div className="mt-auto px-6">
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => alert("登出功能")}
                >
                    <LogOut className="mr-3 h-4 w-4"/>
                    <span className="text-sm">退出登录</span>
                </Button>
            </div>
        </div>
    )
}