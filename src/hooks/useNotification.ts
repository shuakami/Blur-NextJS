import { useCallback, useEffect, useRef } from 'react';
import { useThemeContext } from '@/theme/ThemeContext';

interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;  // 用于分组通知
  onClick?: () => void;
  onClose?: () => void;
  duration?: number;
  requireInteraction?: boolean;  // 是否需要用户交互才关闭
}

export const useNotification = () => {
  const { theme } = useThemeContext();
  const notificationsRef = useRef<Map<string, Notification>>(new Map());

  // 清理旧通知
  const clearOldNotifications = useCallback((tag?: string) => {
    if (tag) {
      const oldNotification = notificationsRef.current.get(tag);
      if (oldNotification) {
        oldNotification.close();
        notificationsRef.current.delete(tag);
      }
    }
  }, []);

  // 获取通知图标
  const getNotificationIcon = useCallback(() => {
    // 根据主题返回不同的图标
    return theme === 'dark' 
      ? '/notification-icon-dark.png' 
      : '/notification-icon-light.png';
  }, [theme]);

  // 请求权限
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持系统通知');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }, []);

  // 显示通知
  const showNotification = useCallback(async ({
    title,
    body,
    icon = getNotificationIcon(),
    tag = 'default',
    onClick,
    onClose,
    duration = 5000,
    requireInteraction = false
  }: NotificationOptions) => {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持系统通知');
      return null;
    }

    let hasPermission = Notification.permission === 'granted';
    
    if (Notification.permission === 'default') {
      hasPermission = await requestPermission();
    }

    if (!hasPermission) {
      console.warn('通知权限被拒绝');
      return null;
    }

    try {
      // 清理同类型的旧通知
      clearOldNotifications(tag);

      const notification = new Notification(title, {
        body,
        icon,
        tag,
        requireInteraction,
        silent: false, // 允许声音
        badge: icon,
      });

      // 存储通知引用
      notificationsRef.current.set(tag, notification);

      // 点击事件
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        onClick?.();
      };

      // 关闭事件
      notification.onclose = () => {
        notificationsRef.current.delete(tag);
        onClose?.();
      };

      // 自动关闭
      if (duration > 0 && !requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, duration);
      }

      return notification;
    } catch (error) {
      console.error('创建通知失败:', error);
      return null;
    }
  }, [getNotificationIcon, clearOldNotifications, requestPermission]);

  // 清理所有通知
  const clearAllNotifications = useCallback(() => {
    notificationsRef.current.forEach(notification => notification.close());
    notificationsRef.current.clear();
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearAllNotifications();
    };
  }, [clearAllNotifications]);

  return {
    showNotification,
    requestPermission,
    clearAllNotifications,
  };
};

// 使用示例
export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: 'new-message',
  SYSTEM: 'system',
  ERROR: 'error',
} as const;

// 预设通知类型
export type NotificationType = keyof typeof NOTIFICATION_TYPES;