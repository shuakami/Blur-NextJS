import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * 位置接口
 * @interface Position
 * @property {number} x - 水平位置坐标
 * @property {number} y - 垂直位置坐标
 */
interface Position {
    x: number;
    y: number;
}

/**
 * 图像缩放钩子的属性接口
 * @interface UseImageZoomProps
 * @property {boolean} isOpen - 图像缩放对话框是否打开
 * @property {() => void} [onClose] - 关闭对话框的回调函数
 * @property {number} [minScale] - 最小缩放比例，默认为0.5
 * @property {number} [maxScale] - 最大缩放比例，默认为3
 * @property {number} [scaleStep] - 每次缩放的步长，默认为0.1
 */
interface UseImageZoomProps {
    isOpen: boolean;
    onClose?: () => void;
    minScale?: number;
    maxScale?: number;
    scaleStep?: number;
}

/**
 * 图像缩放钩子的返回值接口
 * @interface UseImageZoomReturn
 * @property {number} scale - 当前缩放比例
 * @property {Position} position - 当前图像位置
 * @property {boolean} isDragging - 是否正在拖动图像
 * @property {(e: WheelEvent) => void} handleWheel - 处理���轮事件的函数
 * @property {(e: React.MouseEvent) => void} handleMouseMove - 处理鼠标移动事件的函数
 * @property {(e: React.MouseEvent) => void} handleMouseDown - 处理鼠标按下事件的函数
 * @property {() => void} handleMouseUp - 处理鼠标抬起事件的函数
 * @property {(factor: number) => void} handleZoom - 处理缩放的函数
 * @property {() => void} resetImageState - 重置图像状态的函数
 */
interface UseImageZoomReturn {
    scale: number;
    position: Position;
    isDragging: boolean;
    handleWheel: (e: WheelEvent) => void;
    handleMouseMove: (e: React.MouseEvent) => void;
    handleMouseDown: (e: React.MouseEvent) => void;
    handleMouseUp: () => void;
    handleZoom: (factor: number) => void;
    resetImageState: () => void;
}

const DEFAULT_MIN_SCALE = 0.5; // 默认最小缩放比例
const DEFAULT_MAX_SCALE = 3; // 默认最大缩放比例
const DEFAULT_SCALE_STEP = 0.1; // 默认缩放步长
const DRAG_SENSITIVITY = 0.5; // 拖动灵敏度

/**
 * 自定义钩子，用于处理图像缩放
 * @param {UseImageZoomProps} props - 图像缩放钩子的属性
 * @returns {UseImageZoomReturn} - 图像缩放钩子的返回值
 */
export const useImageZoom = ({ 
    isOpen, 
    onClose,
    minScale = DEFAULT_MIN_SCALE,
    maxScale = DEFAULT_MAX_SCALE,
    scaleStep = DEFAULT_SCALE_STEP
}: UseImageZoomProps): UseImageZoomReturn => {
    const dragStartRef = useRef<Position>({ x: 0, y: 0 });
    const lastPositionRef = useRef<Position>({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

    // 计算最大偏移量，考虑图片尺寸和缩放
    const getMaxOffset = useCallback((currentScale: number) => {
        return Math.max(150, 100 * currentScale);
    }, []);

    const handleZoom = useCallback((factor: number) => {
        setScale(prev => {
            const newScale = Math.min(Math.max(minScale, prev + factor), maxScale);
            // 缩小时重置位置
            if (newScale <= 1) {
                setPosition({ x: 0, y: 0 });
            }
            return newScale;
        });
    }, [minScale, maxScale]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingRef.current || scale <= 1) return;

        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        
        const maxOffset = getMaxOffset(scale);
        const newX = lastPositionRef.current.x + deltaX * DRAG_SENSITIVITY;
        const newY = lastPositionRef.current.y + deltaY * DRAG_SENSITIVITY;
        
        setPosition({
            x: Math.min(Math.max(-maxOffset, newX), maxOffset),
            y: Math.min(Math.max(-maxOffset, newY), maxOffset)
        });
    }, [scale, getMaxOffset]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale <= 1) return;

        e.preventDefault(); // 防止意外的选择
        isDraggingRef.current = true;
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY
        };
        lastPositionRef.current = position;
    }, [scale, position]);

    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            lastPositionRef.current = position;
        }
    }, [position]);

    const resetImageState = useCallback(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        isDraggingRef.current = false;
        lastPositionRef.current = { x: 0, y: 0 };
        dragStartRef.current = { x: 0, y: 0 };
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        if (!isOpen || e.deltaY === 0) return;

        // 如果按住 Ctrl 键，则进行缩放
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? -scaleStep : scaleStep;
            handleZoom(zoomFactor);
            return;
        }

        // 如果已经放大，则允许拖动
        if (scale > 1) {
            e.preventDefault();
            const maxOffset = getMaxOffset(scale);
            const sensitivity = 0.5;

            setPosition(prev => ({
                x: Math.min(Math.max(-maxOffset, prev.x - e.deltaX * sensitivity), maxOffset),
                y: Math.min(Math.max(-maxOffset, prev.y - e.deltaY * sensitivity), maxOffset)
            }));
        }
    }, [isOpen, scale, scaleStep, handleZoom, getMaxOffset]);

    // 清理函数
    useEffect(() => {
        if (!isOpen) {
            resetImageState();
        }
        return () => {
            resetImageState();
        };
    }, [isOpen, resetImageState]);

    useEffect(() => {
        if (!isOpen) return;

        const element = document.body;
        const wheelHandler = (e: WheelEvent) => {
            handleWheel(e);
        };

        element.addEventListener('wheel', wheelHandler, { passive: false });
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            const isZoomIn = (e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=');
            const isZoomOut = (e.ctrlKey || e.metaKey) && e.key === '-';
            
            if (isZoomIn || isZoomOut) {
                e.preventDefault();
                handleZoom(isZoomIn ? scaleStep : -scaleStep);
            } else if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            element.removeEventListener('wheel', wheelHandler);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleWheel, handleZoom, onClose, scaleStep]);

    return {
        scale,
        position,
        isDragging: isDraggingRef.current,
        handleWheel,
        handleMouseMove,
        handleMouseDown,
        handleMouseUp,
        handleZoom,
        resetImageState,
    };
};