import React, { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils/utils';

interface ResizableTableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** 表格最小宽度 */
  minWidth?: number;
  /** 表格最大宽度 */
  maxWidth?: number;
}

export const Table: React.FC<ResizableTableProps> = ({ 
  className,
  minWidth,
  maxWidth,
  ...props 
}) => {
  // 状态管理
  const [width, setWidth] = useState<number | null>(null);          // 当前表格宽度
  const [isResizing, setIsResizing] = useState(false);             // 是否正在调整大小

  // Refs
  const tableRef = useRef<HTMLTableElement>(null);                 // 表格元素引用
  const initialWidthRef = useRef<number | null>(null);             // 初始宽度
  const resizingRef = useRef(false);                              // 调整状态标记
  const startXRef = useRef(0);                                     // 开始拖动的X坐标
  const startWidthRef = useRef(0);                                 // 开始拖动时的宽度
  const maxWidthRef = useRef(0);                                   // 最大宽度限制

  // 初始化和窗口大小变化处理
  useEffect(() => {
    // 更新最大宽度计算
    const updateMaxWidth = () => {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const sideMargin = 48; // 两侧各留24px边距
      maxWidthRef.current = window.innerWidth - scrollbarWidth - (sideMargin * 2);
    };

    // 初始化表格宽度和最大宽度
    if (tableRef.current && !initialWidthRef.current) {
      initialWidthRef.current = tableRef.current.offsetWidth;
      updateMaxWidth();

      // 监听窗口大小变化
      window.addEventListener('resize', updateMaxWidth);
      return () => window.removeEventListener('resize', updateMaxWidth);
    }
  }, []);

  // 鼠标按下事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tableRef.current) {
      e.preventDefault();
      resizingRef.current = true;
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = tableRef.current.offsetWidth;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }
  }, []);

  // 鼠标移动事件处理
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizingRef.current && tableRef.current && initialWidthRef.current) {
      const diff = e.clientX - startXRef.current;
      // 计算新宽度，确保不小于初始宽度且不超过最大宽度
      const newWidth = Math.min(
        Math.max(startWidthRef.current + diff, initialWidthRef.current),
        maxWidthRef.current
      );
      
      // 使用 requestAnimationFrame 优化渲染性能
      requestAnimationFrame(() => {
        if (tableRef.current) {
          tableRef.current.style.width = `${newWidth}px`;
          // 只有当宽度大于初始宽度时才设置状态
          setWidth(newWidth > initialWidthRef.current! ? newWidth : null);
        }
      });
    }
  }, []);

  // 双击恢复默认宽度
  const handleDoubleClick = useCallback(() => {
    if (tableRef.current && initialWidthRef.current) {
      tableRef.current.style.width = `${initialWidthRef.current}px`;
      setWidth(null);
    }
  }, []);

  // 鼠标释放事件处理
  const handleMouseUp = useCallback(() => {
    resizingRef.current = false;
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
  }, [handleMouseMove]);

  return (
    <div className={cn(
      // 基础样式和过渡效果
      "table-container group relative transition-all duration-150 mt-0 -translate-x-0 z-10",
      // 调整时的样式
      isResizing && "resizing",
      // 扩展状态的样式，包括位置补偿和层级提升
      width && width > (initialWidthRef.current || 0) && "expanded -translate-x-[25px] transition-all duration-150 z-30"
    )}>
      <div className="table-scroll-container">
        <div className="relative w-full">
          <table
            ref={tableRef}
            className={cn("markdown-table", className)}
            {...props}
          />
          {/* 调整手柄 */}
          <div
            className={cn(
              "resize-handle-container absolute top-0 right-0 h-full",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
              isResizing && "opacity-100",
              "translate-x-1/2"
            )}
          >
            <div
              className={cn(
                "resize-handle",
                "w-4 h-full cursor-col-resize flex items-center justify-center",
                "after:content-[''] after:absolute after:inset-y-[15%] after:left-1/2",
                "after:w-[2px] after:rounded-full after:bg-gray-200/70 dark:after:bg-gray-700/70",
                "hover:after:bg-gray-300 dark:hover:after:bg-gray-600",
                "active:after:bg-gray-400 dark:active:after:bg-gray-500",
                "transition-[background-color,transform] duration-150"
              )}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
              title="双击恢复默认宽度"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const TableHeader: React.FC<React.ThHTMLAttributes<HTMLTableHeaderCellElement>> = ({ 
  className,
  ...props 
}) => (
  <th 
    className={cn(
      "table-header",
      className
    )} 
    {...props} 
  />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableDataCellElement>> = ({ 
  className,
  ...props 
}) => (
  <td 
    className={cn(
      "table-cell",
      className
    )} 
    {...props} 
  />
);
