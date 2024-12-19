"use client";

import React, { createContext, useContext, useEffect, useState, FC, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { ChevronDown, Search, Brain, Sparkles, Orbit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DropDownMenuPlus from "@/components/ui/tofu/dropdown-menu-plus";
import { useShortcutManager } from "@/providers/ShortcutProvider";
import { SHORTCUTS, SHORTCUT_DESCRIPTIONS } from "@/constants/shortcuts";

// 类型定义
type ModelCode = 'claude' | 'gemini';

interface Model {
    id: string;           // 唯一标识符
    name: string;
    version: string;
    description: string;
    code: ModelCode;
    icon: React.ComponentType;
    isDisabled?: boolean;
}

// 常量定义
const MODELS: readonly Model[] = [
    {
        id: 'blur-lite',
        name: "Blur",
        version: "Lite",
        code: "claude",
        description: "全能助手，支持工具调用。",
        icon: Orbit,
    },
    {
        id: 'blur-flex',
        name: "Blur",
        version: "Flex",
        code: "gemini",
        description: "赋予更多情感与温度的模型（即将推出）",
        icon: Sparkles,
        isDisabled: true,
    },
    {
        id: 'blur-search',
        name: "Blur Search",
        version: "",
        code: "claude",
        description: "专注于高速大规模检索的模型。（即将推出）",
        icon: Search,
        isDisabled: true,
    },
    {
        id: 'blur-intellect',
        name: "Blur",
        version: "Intellect",
        code: "gemini",
        description: "精于推理，善于思考，帮你解决复杂问题。",
        icon: Brain,
    },
] as const;

// 持久化配置
const STORAGE_KEY = 'selectedModelId';
const DEFAULT_MODEL = MODELS[0];

// Context 类型定义
interface ModelContextType {
    selectedModel: Model;
    setSelectedModel: (model: Model) => void;
    isLoading: boolean;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

// 持久化工具函数
const persistModel = (modelId: string) => {
    try {
        // 更新 Cookie
        Cookies.set(STORAGE_KEY, modelId, { expires: 365 });
        
        // 更新 URL
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('model', modelId);
            window.history.replaceState({}, '', url.toString());
        }
    } catch (error) {
        console.error('Failed to persist model selection:', error);
    }
};

// 获取持久化的模型
const getPersistedModel = (): Model => {
    try {
        if (typeof window === 'undefined') return DEFAULT_MODEL;

        // 优先从 URL 获取
        const urlParams = new URLSearchParams(window.location.search);
        const modelFromUrl = urlParams.get('model');
        if (modelFromUrl) {
            const model = MODELS.find(m => m.id === modelFromUrl);
            if (model && !model.isDisabled) return model;
        }

        // 其次从 Cookie 获取
        const modelFromCookie = Cookies.get(STORAGE_KEY);
        if (modelFromCookie) {
            const model = MODELS.find(m => m.id === modelFromCookie);
            if (model && !model.isDisabled) return model;
        }

        return DEFAULT_MODEL;
    } catch (error) {
        console.error('Failed to get persisted model:', error);
        return DEFAULT_MODEL;
    }
};

// Provider 组件
export const ModelProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedModel, setSelectedModel] = useState<Model>(DEFAULT_MODEL);
    const [isLoading, setIsLoading] = useState(true);
    const isInitialized = useRef(false);

    // 初始化
    useEffect(() => {
        if (isInitialized.current) return;
        
        const initializeModel = () => {
            const model = getPersistedModel();
            setSelectedModel(model);
            setIsLoading(false);
            isInitialized.current = true;
        };

        initializeModel();
    }, []);

    // 处理模型变更
    const handleModelChange = useCallback((model: Model) => {
        if (model.isDisabled) return;
        setSelectedModel(model);
        persistModel(model.id);
    }, []);

    const contextValue = {
        selectedModel,
        setSelectedModel: handleModelChange,
        isLoading
    };

    return (
        <ModelContext.Provider value={contextValue}>
            {children}
        </ModelContext.Provider>
    );
};

// Hook
export const useModel = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModel must be used within ModelProvider');
    }
    return context;
};

// Selector 组件
const ModelSelector: FC = () => {
    const { selectedModel, setSelectedModel, isLoading } = useModel();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const shortcutManager = useShortcutManager();

    // 菜单项
    const menuItems = MODELS.map((model) => ({
        id: model.id,
        text: `${model.name} ${model.version}`.trim(),
        description: model.description,
        icon: model.icon,
        isDisabled: model.isDisabled,
        onClick: () => {
            if (!model.isDisabled) {
                setSelectedModel(model);
                setIsMenuOpen(false);
            }
        },
    }));

    // 快捷键处理
    const toggleModelSelector = useCallback(() => {
        if (!isLoading) {
            setIsMenuOpen(prev => !prev);
        }
    }, [isLoading]);

    useEffect(() => {
        shortcutManager.register({
            command: 'TOGGLE_MODEL',
            key: SHORTCUTS.TOGGLE_MODEL,
            description: SHORTCUT_DESCRIPTIONS.TOGGLE_MODEL,
            handler: toggleModelSelector,
            condition: () => !isLoading && document.activeElement?.tagName !== 'INPUT'
        });

        return () => shortcutManager.unregister('TOGGLE_MODEL');
    }, [shortcutManager, toggleModelSelector, isLoading]);

    // 键盘导航
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isMenuOpen || isLoading) return;

        const enabledModels = MODELS.filter(m => !m.isDisabled);
        const currentIndex = enabledModels.findIndex(m => m.id === selectedModel.id);

        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    setSelectedModel(enabledModels[currentIndex - 1]);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < enabledModels.length - 1) {
                    setSelectedModel(enabledModels[currentIndex + 1]);
                }
                break;
            case 'Enter':
            case 'Escape':
                e.preventDefault();
                setIsMenuOpen(false);
                break;
        }
    }, [isMenuOpen, selectedModel, setSelectedModel, isLoading]);

    useEffect(() => {
        if (isMenuOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isMenuOpen, handleKeyDown]);

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 w-32 bg-secondary rounded" />
            </div>
        );
    }

    return (
        <div>
            <Button
                ref={buttonRef}
                variant="ghost"
                tooltip="切换模型"
                className="flex items-center gap-1 rounded-lg text-lg font-semibold hover:bg-secondary"
                onClick={toggleModelSelector}
            >
                <span className="text-secondary-foreground">
                    {selectedModel.name}
                    {selectedModel.version && (
                        <span className="text-muted-foreground"> {selectedModel.version}</span>
                    )}
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