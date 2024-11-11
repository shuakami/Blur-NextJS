import {useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import {useToast} from '@/hooks/use-toast';
import useTranslation from '@/hooks/useTranslation';

export default function useVersionCheck() {
    const {toast} = useToast();
    const {t} = useTranslation();
    const latestVersion = process.env.NEXT_PUBLIC_VERSION as string;

    const [mounted, setMounted] = useState(false);

    //  // [ TEST ] 测试用：在页面加载的时候立即触发demo toast
    // useEffect(() => {
    //     toast({
    //         title: "确认操作",
    //         description: "您确定要执行此操作吗？",
    //         acceptButton: {
    //           label: "确认",
    //           onClick: () => {
    //             // 处理确认逻辑
    //           }
    //         },
    //         quitButton: {
    //           label: "取消",
    //           onClick: () => {
    //             // 处理取消逻辑
    //           }
    //         }
    //       })
    // }, [toast, t]);

    useEffect(() => {
        // 组件挂载后设置 mounted 为 true，确保组件已加载
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return; // 确保仅在挂载后运行此逻辑

        const storedVersion = Cookies.get('app_version');

        if (!storedVersion) {
            // 首次访问，存储版本号
            Cookies.set('app_version', latestVersion);
        } else if (storedVersion !== latestVersion) {
            // 版本号不一致，提示用户刷新页面
            toast({
                variant: 'info',
                title: t('检测到新版本'),
                duration: 7000,
                description: t('请按Ctrl+F5强制刷新页面，或清除浏览器缓存，以更新到最新版本。'),
            });
            // 更新存储的版本号
            Cookies.set('app_version', latestVersion);
            // 删除has_shown_update_message
            Cookies.remove('has_shown_update_message');
        } else {
            // 版本号一致，可选地在首次加载时提示已是最新版本
            const hasShownUpdateMessage = Cookies.get('has_shown_update_message');
            if (!hasShownUpdateMessage) {
                toast({
                    variant: 'success',
                    title: t('已更新到最新版本'),
                    description: `${latestVersion}`,
                });
                Cookies.set('has_shown_update_message', 'true');
            }
        }
    }, [latestVersion, toast, t, mounted]);
}
