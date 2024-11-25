"use client";

import React, { createContext, useContext, useEffect, useState, FC, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { ChevronDown, Search, Brain, Sparkles, Orbit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DropDownMenuPlus from "@/components/ui/tofu/dropdown-menu-plus";
import { useShortcutManager } from "@/providers/ShortcutProvider";
import { SHORTCUTS, SHORTCUT_DESCRIPTIONS } from "@/constants/shortcuts";

// 定义 Model 类型
type Model = {
    name: string;
    version: string;
    description: string;
    code?: string;
    icon: React.ComponentType;
};

// 定义模型数组
const models: Model[] = [
    {
        name: "Blur",
        version: "Lite",
        code: "claude",
        description: "为轻松日常对话打造。体验清晰、快速的智能交互。",
        icon: Orbit,
    },
    {
        name: "Blur",
        version: "Flex",
        code: "gemini",
        description: "赋予更多情感与温度的模型，完美满足你在情感共鸣上的需求。",
        icon: Sparkles,
    },
    {
        name: "Blur Search",
        version: "",
        code: "claude",
        description: "专注于高速大规模检索，适合查找专业知识分析数据。",
        icon: Search,
    },
    {
        name: "Blur",
        version: "Intellect",
        code: "claude",
        description: "精于推理，善于思考。应对复杂问题和逻辑分析的最佳选择。",
        icon: Brain,
    },
];

const ModelContext = createContext<{
    selectedModel: Model;
    setSelectedModel: (model: Model) => void;
} | undefined>(undefined);

export const ModelProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
    const isInitialMount = useRef(true);

    const updateModelInUrlAndCookie = (model: Model) => {
        if (typeof window !== "undefined") {
            const newModal = `${model.name}-${model.version}`;
            
            // 更新 Cookie
            const currentCookie = Cookies.get('selectedModel');
            if (currentCookie !== newModal) {
                Cookies.set('selectedModel', newModal);
            }
            console.log(newModal);

            // 更新 URL，但不触发重新渲染
            const url = new URL(window.location.href);
            const currentModal = url.searchParams.get('modal');
            if (currentModal !== newModal) {
                url.searchParams.set('modal', newModal);
                window.history.replaceState({}, '', url.toString());
            }
        }
    };

    // 初始化时获取模型
    useEffect(() => {
        if (!isInitialMount.current) return;
        
        const initializeModel = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const modalFromUrl = urlParams.get("modal");
            const cookieModel = Cookies.get("selectedModel");

            let modelToSet = models[0];
            const findModel = (name: string, version: string) => 
                models.find(model => model.name === name && model.version === version);

            if (modalFromUrl) {
                const [name, version] = modalFromUrl.split("-");
                modelToSet = findModel(name, version) || modelToSet;
            } else if (cookieModel) {
                const [name, version] = cookieModel.split("-");
                modelToSet = findModel(name, version) || modelToSet;
            }

            setSelectedModel(modelToSet);
            // 仅在初始化时更新 URL 和 Cookie
            if (modelToSet !== models[0]) {
                updateModelInUrlAndCookie(modelToSet);
            }
        };

        initializeModel();
        isInitialMount.current = false;
    }, []);

    // 处理模型变更
    const handleModelChange = (model: Model) => {
        setSelectedModel(model);
        updateModelInUrlAndCookie(model);
    };

    return (
        <ModelContext.Provider value={{ selectedModel, setSelectedModel: handleModelChange }}>
            {children}
        </ModelContext.Provider>
    );
};

// Hook - 用于全局获取当前的模型
export const useModel = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModel 必须在 ModelProvider 中使用');
    }
    return context;
};

// ModelSelector 组件：用于选择模型并显示
const ModelSelector: FC = () => {
    const { selectedModel, setSelectedModel } = useModel();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const shortcutManager = useShortcutManager();

    const menuItems = models.map((model) => ({
        id: `${model.name}-${model.version}`,
        text: `${model.name} ${model.version}`,
        description: model.description,
        icon: model.icon,
        onClick: () => {
            setSelectedModel(model);
            setIsMenuOpen(false);
        },
    }));

    // 切换模型选择器的显示状态
    const toggleModelSelector = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

    // 注册快捷键
    useEffect(() => {
        shortcutManager.register({
            command: 'TOGGLE_MODEL',
            key: SHORTCUTS.TOGGLE_MODEL,
            description: SHORTCUT_DESCRIPTIONS.TOGGLE_MODEL,
            handler: toggleModelSelector,
            condition: () => document.activeElement?.tagName !== 'INPUT'  // 不在输入状态时生效
        });

        return () => {
            shortcutManager.unregister('TOGGLE_MODEL');
        };
    }, [shortcutManager, toggleModelSelector]);

    // 添加键盘导航支持
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isMenuOpen) return;

        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                // 选择上一个模型
                const currentIndex = models.findIndex(m => m === selectedModel);
                if (currentIndex > 0) {
                    setSelectedModel(models[currentIndex - 1]);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                // 选择下一个模型
                const nextIndex = models.findIndex(m => m === selectedModel);
                if (nextIndex < models.length - 1) {
                    setSelectedModel(models[nextIndex + 1]);
                }
                break;
            case 'Enter':
                e.preventDefault();
                setIsMenuOpen(false);
                break;
            case 'Escape':
                e.preventDefault();
                setIsMenuOpen(false);
                break;
        }
    }, [isMenuOpen, selectedModel, setSelectedModel]);

    // 添加键盘事件监听
    useEffect(() => {
        if (isMenuOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isMenuOpen, handleKeyDown]);

    return (
        <div>
            {/* 触发下拉菜单的按钮 */}
            <Button
                ref={buttonRef}
                variant="ghost"
                tooltip="切换模型"
                className="flex items-center gap-1 rounded-lg text-lg font-semibold hover:bg-secondary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <span className="text-secondary-foreground">
                    {selectedModel.name}{" "}
                    <span className="text-muted-foreground">{selectedModel.version}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>

            <DropDownMenuPlus
                referenceElement={buttonRef.current}
                isOpen={isMenuOpen}
                menuItems={menuItems}
                onClose={() => setIsMenuOpen(false)}
                placement={window.innerWidth <= 768 ? "center" : "bottom"}
            />
        </div>
    );
};


export default ModelSelector;