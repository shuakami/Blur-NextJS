"use client";

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DropDownMenu from "@/components/ui/tofu/dropdown-menu";
import dynamic from 'next/dynamic';
import { LogOut, SettingsIcon, UserRound, Keyboard, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

// 动态导入
const SettingsModal = dynamic(() => import("@/app/[设置]/settings_modal"), {
  loading: () => null,
  ssr: false
});
const PersonalCenter = dynamic(() => import("@/app/[个人中心]"), {
  loading: () => null,
  ssr: false
});
const ShortcutsModal = dynamic(() => import("@/components/ui/shortcuts-modal"), {
  loading: () => null,
  ssr: false
});
const MemoryManagerDialog = dynamic(() => import("@/components/ui/memory/memory-manager-dialog").then(mod => mod.MemoryManagerDialog), {
  loading: () => null,
  ssr: false
});

// 菜单项配置
const createMenuItems = (handlers: {
  openSettings: () => void,
  openAccountSettings: () => void,
  openShortcuts: () => void,
  openMemoryManager: () => void,
  signOut: () => void,
  closeMenu: () => void
}) => [
  {
    id: "settings",
    text: "设置",
    icon: SettingsIcon,
    onClick: () => {
      handlers.closeMenu();
      handlers.openSettings();
    },
  },
  {
    id: "account",
    text: "账户设置",
    icon: UserRound,
    onClick: () => {
      handlers.closeMenu();
      handlers.openAccountSettings();
    },
  },
  {
    id: "shortcuts",
    text: "键盘快捷键",
    icon: Keyboard,
    onClick: () => {
      handlers.closeMenu();
      handlers.openShortcuts();
    },
  },
  {
    id: "memory",
    text: "记忆管理",
    icon: Brain,
    onClick: () => {
      handlers.closeMenu();
      handlers.openMemoryManager();
    },
  },
  {
    id: "logout",
    text: "退出登录",
    icon: LogOut,
    onClick: () => {
      handlers.closeMenu();
      handlers.signOut();
    },
    isDanger: true,
    isSpecial: true
  },
];

const UserAvatar = memo(() => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const avatarRef = useRef<HTMLButtonElement>(null);
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [memoryManagerOpen, setMemoryManagerOpen] = useState(false);

  // URL 参数处理
  useEffect(() => {
    setSettingsOpen(searchParams?.get("settings") === "open");
    setAccountOpen(searchParams?.get("account") === "open");
    setShortcutsOpen(searchParams?.get("shortcuts") === "open");
    setMemoryManagerOpen(searchParams?.get("memory") === "open");
  }, [searchParams]);

  // URL 更新处理器
  const updateURL = useCallback((params: { [key: string]: string | null }) => {
    try {
      const newUrl = new URL(window.location.href);
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newUrl.searchParams.delete(key);
        } else {
          newUrl.searchParams.set(key, value);
        }
      });
      router.push(newUrl.toString() as any);
    } catch (error) {
      console.error('URL update failed:', error);
    }
  }, [router]);

  // 模态框处理器
  const modalHandlers = {
    openSettings: useCallback(() => {
      setSettingsOpen(true);
      updateURL({ settings: "open" });
    }, [updateURL]),

    closeSettings: useCallback(() => {
      setSettingsOpen(false);
      updateURL({ settings: null, account: null, tab: null });
    }, [updateURL]),

    openAccountSettings: useCallback(() => {
      setAccountOpen(true);
      updateURL({ account: "open" });
    }, [updateURL]),

    closeAccountSettings: useCallback(() => {
      setAccountOpen(false);
      updateURL({ account: null, tab: null, settings: null });
    }, [updateURL]),

    openShortcuts: useCallback(() => {
      setShortcutsOpen(true);
      updateURL({ shortcuts: "open" });
    }, [updateURL]),

    closeShortcuts: useCallback(() => {
      setShortcutsOpen(false);
      updateURL({ shortcuts: null });
    }, [updateURL]),

    openMemoryManager: useCallback(() => {
      setMemoryManagerOpen(true);
      updateURL({ memory: "open" });
    }, [updateURL]),

    closeMemoryManager: useCallback(() => {
      setMemoryManagerOpen(false);
      updateURL({ memory: null });
    }, [updateURL])
  };

  // 菜单项配置
  const menuItems = createMenuItems({
    openSettings: modalHandlers.openSettings,
    openAccountSettings: modalHandlers.openAccountSettings,
    openShortcuts: modalHandlers.openShortcuts,
    openMemoryManager: modalHandlers.openMemoryManager,
    signOut,
    closeMenu: () => setMenuOpen(false)
  });

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-4 hidden md:block"
          onClick={() => router.push("/login" as any)}
        >
          登录
        </Button>
        <Button
          size="sm"
          variant="default"
          className="h-8 px-4 hidden md:block"
          onClick={() => router.push("/signup" as any)}
        >
          注册
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Avatar 
        ref={avatarRef} 
        onClick={() => setMenuOpen(true)}
        size="sm-md"
      >
        {user?.imageUrl ? (
          <AvatarImage 
            src={user.imageUrl} 
            alt="User avatar" 
            className="cursor-pointer hover:ring-[3px] hover:ring-gray-250 
                     dark:hover:ring-gray-850/70 transition-all duration-200 
                     ease-in-out rounded-full"
          />
        ) : (
          <AvatarFallback className="cursor-pointer">
            {user?.fullName?.[0] || 'NL'}
          </AvatarFallback>
        )}
      </Avatar>

      <DropDownMenu
        referenceElement={avatarRef.current}
        isOpen={menuOpen}
        menuItems={menuItems}
        placement="bottom"
        onClose={() => setMenuOpen(false)}
      />
      
      {settingsOpen && (
        <SettingsModal 
          isOpen={settingsOpen} 
          onClose={modalHandlers.closeSettings}
        />
      )}

      {accountOpen && (
        <PersonalCenter 
          isOpen={accountOpen} 
          onClose={modalHandlers.closeAccountSettings}
        />
      )}

      {shortcutsOpen && (
        <ShortcutsModal 
          isOpen={shortcutsOpen} 
          onClose={modalHandlers.closeShortcuts}
        />
      )}

      {memoryManagerOpen && (
        <MemoryManagerDialog 
          open={memoryManagerOpen} 
          onOpenChange={modalHandlers.closeMemoryManager}
        />
      )}
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;