import React, { useEffect, useCallback, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFloating, shift, offset, flip, autoUpdate } from '@floating-ui/react-dom';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';

interface MenuItemProps {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick?: () => void;
  shortcut?: string;
  className?: string;
  isDanger?: boolean;
}

// 添加自定义样式接口
interface MenuStyles {
  menu?: string;          // 菜单容器样式
  item?: string;          // 菜单项基础样式
  itemHover?: string;     // 菜单项悬浮样式
  itemDanger?: string;    // 危险项样式
  itemIcon?: string;      // 图标样式
  separator?: string;     // 分割线样式
  shortcut?: string;      // 快捷键样式
}

const MenuItem = memo(React.forwardRef<
  HTMLButtonElement,
  MenuItemProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { styles?: MenuStyles }
>(({ icon: Icon, children, onClick, shortcut, className, isDanger, styles, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex w-full items-center text-sm/6 transition-colors",
      "px-2.5 py-1.5 rounded-lg my-0.5",
      
      // 默认或危险状态
      isDanger 
        ? cn("text-red-500 dark:text-red-400", styles?.itemDanger)
        : cn("text-gray-800 dark:text-gray-200", styles?.item),
      
      // 悬浮和焦点状态
      cn(
        "hover:bg-gray-70 dark:hover:bg-gray-800",
        "focus:outline-none focus:bg-gray-80 dark:focus:bg-gray-800",
        styles?.itemHover
      ),
      
      className
    )}
    onClick={onClick}
    {...props}
  >
    <span className={cn(
      "flex w-4 h-4 mr-3",
      !Icon && "hidden",
      styles?.itemIcon
    )}>
      {Icon && (
        <Icon className={cn(
          "w-4 h-4",
          isDanger 
            ? "text-red-500 dark:text-red-400"
            : "text-gray-500 dark:text-gray-400"
        )} />
      )}
    </span>
    <span className="flex-grow text-left">{children}</span>
    {shortcut && (
      <kbd className={cn(
        "ml-5 text-xs text-gray-400 dark:text-gray-500",
        styles?.shortcut
      )}>
        {shortcut}
      </kbd>
    )}
  </button>
)));
MenuItem.displayName = 'MenuItem';

interface MenuSeparatorProps {
  className?: string;
}

const MenuSeparator = ({ className, styles }: MenuSeparatorProps & { styles?: MenuStyles }) => (
  <div className={cn(
    "my-1 h-px bg-gray-200 dark:bg-gray-700",
    styles?.separator,
    className
  )} />
);

interface MenuButtonProps extends ButtonProps {
  children: React.ReactNode;
  noDisplayChevronIcon?: boolean;
}

const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ children, className, variant = "outline", size = "default", noDisplayChevronIcon = false, ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "inline-flex items-center gap-1.5",
        className
      )}
      {...props}
    >
      {children}
      {!noDisplayChevronIcon && <ChevronDown className="w-4 h-4 opacity-50" />}
    </Button>
  )
);
MenuButton.displayName = 'MenuButton';

interface MenuItemsProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  referenceElement: HTMLElement | null;
  onClose?: () => void;
  styles?: MenuStyles;    // 添加自定义样式
}

const MenuItems = ({
  children,
  className,
  isOpen,
  referenceElement,
  onClose,
  styles
}: MenuItemsProps) => {
  const { x, y, strategy, refs, update } = useFloating({
    placement: 'bottom-end',
    strategy: 'fixed',
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const floatingRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      refs.setFloating(node);
    }
  }, [refs]);

  // 使用 useRef 跟踪鼠标状态
  const mouseDownTarget = useRef<EventTarget | null>(null);
  const isClickInside = useRef(false);

  useEffect(() => {
    if (referenceElement) {
      refs.setReference(referenceElement);
    }
  }, [referenceElement, refs]);

  useEffect(() => {
    if (!isOpen) return;

    update();

    const handleMouseDown = (event: MouseEvent) => {
      mouseDownTarget.current = event.target;
      
      // 检查点击是否在菜单内部或触发按钮上
      isClickInside.current = Boolean(
        (refs.floating.current && refs.floating.current.contains(event.target as Node)) ||
        (referenceElement && referenceElement.contains(event.target as Node))
      );
    };

    const handleMouseUp = (event: MouseEvent) => {
      // 只有当鼠标按下和抬起的目标都在菜单外部时才关闭
      if (
        !isClickInside.current && 
        mouseDownTarget.current === event.target &&
        refs.floating.current && 
        !refs.floating.current.contains(event.target as Node) &&
        referenceElement && 
        !referenceElement.contains(event.target as Node)
      ) {
        onClose?.();
      }
      
      // 重置状态
      mouseDownTarget.current = null;
      isClickInside.current = false;
    };

    // 处理 Esc 键
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    // 处理滚动
    const handleScroll = () => {
      requestAnimationFrame(update);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, update, refs.floating, referenceElement, onClose]);

  // 优化菜单项点击处理
  const handleItemClick = useCallback((event: React.MouseEvent) => {
    const menuItem = (event.target as HTMLElement).closest('[role="menuitem"]');
    if (menuItem) {
      onClose?.();
    }
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={floatingRef}
          role="menu"
          aria-orientation="vertical"
          initial={{ 
            opacity: 0,
            scale: 0.98,
            y: -8,
            transformOrigin: 'top'
          }}
          animate={{ 
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.8
            }
          }}
          exit={{ 
            opacity: 0,
            scale: 0.98,
            y: -8,
            transition: {
              duration: 0.1,
              ease: [0.4, 0, 1, 1]
            }
          }}
          className={cn(
            "fixed z-50 min-w-[195px] origin-top-right rounded-xl",
            "border border-gray-200/80 dark:border-gray-800/80",
            "bg-white/95 dark:bg-gray-900/95",
            "py-1 px-1.5",
            "shadow-[0_5px_30px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_5px_30px_-12px_rgba(0,0,0,0.45)]",
            "backdrop-blur-xl backdrop-saturate-150",
            "focus:outline-none",
            styles?.menu,
            className
          )}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            willChange: 'transform, opacity',
            contain: 'layout style paint',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ 
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.15,
                ease: [0.4, 0, 0.2, 1],
                staggerChildren: 0.025,
                delayChildren: 0.025
              }
            }}
            exit={{ 
              opacity: 0,
              y: -8,
              transition: {
                duration: 0.1,
                ease: [0.4, 0, 1, 1]
              }
            }}
          >
            {React.Children.map(children, (child, index) => {
              if (React.isValidElement(child)) {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ 
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.2,
                        ease: [0.4, 0, 0.2, 1]
                      }
                    }}
                    exit={{ 
                      opacity: 0,
                      y: -8,
                      transition: {
                        duration: 0.1,
                        ease: [0.4, 0, 1, 1]
                      }
                    }}
                  >
                    {React.cloneElement(child, {
                      role: 'menuitem',
                      styles,
                      ...child.props
                    })}
                  </motion.div>
                );
              }
              return child;
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export {
  MenuItem,
  MenuSeparator,
  MenuButton,
  MenuItems,
};