import {useEffect} from 'react';
import Cookies from 'js-cookie';
import {useToast} from '@/hooks/use-toast';
import useTranslation from '@/hooks/useTranslation';

export default function useVersionCheck() {
    const {toast} = useToast();
    const {t} = useTranslation();
    const latestVersion = process.env.NEXT_PUBLIC_VERSION as string;

    useEffect(() => {
        const storedVersion = Cookies.get('app_version');
        if (!storedVersion) {
            // 首次访问，存储版本号
            Cookies.set('app_version', latestVersion);
        } else if (storedVersion !== latestVersion) {
            // 版本号不一致，提示用户刷新页面
            setTimeout(() => {
                toast({
                    variant: 'info',
                    title: t('检测到新版本'),
                    description: t('请按Ctrl+F5强制刷新页面，或清除浏览器缓存，以更新到最新版本。'),
                });
                // 更新存储的版本号
                Cookies.set('app_version', latestVersion);
            }, 2000);
        } else {
            // 版本号一致，可选地在首次加载时提示已是最新版本
            const hasShownUpdateMessage = Cookies.get('has_shown_update_message');
            if (!hasShownUpdateMessage) {
                // toast等待组件加载好再出现
                setTimeout(() => {
                    toast({
                        variant: 'success',
                        title: t('已更新到最新版本'),
                        description: `${latestVersion}`,
                    });
                    Cookies.set('has_shown_update_message', 'true');
                }, 2000);
            }
        }
    }, [latestVersion, toast, t]); // 将 t 作为依赖项
}
