"use client";

import React, { createContext, useContext, useEffect, useState, FC, useRef } from 'react';
import Cookies from 'js-cookie';
import { ChevronDown, Search, Brain, Sparkles, Orbit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DropDownMenuPlus from "@/components/ui/tofu/dropdown-menu-plus";

// 定义 Model 类型
type Model = {
    name: string;
    version: string;
    description: string;
    icon: React.ComponentType;
};

// 定义模型数组
const models: Model[] = [
    {
        name: "Blur",
        version: "Lite",
        description: "为轻松日常对话打造。体验清晰、快速的智能交互。",
        icon: Orbit,
    },
    {
        name: "Blur",
        version: "Flex",
        description: "赋予更多情感与温度的模型，完美满足你在情感共鸣上的需求。",
        icon: Sparkles,
    },
    {
        name: "Blur Search",
        version: "",
        description: "专注于高速大规模检索，适合查找专业知识分析数据。",
        icon: Search,
    },
    {
        name: "Blur",
        version: "Intellect",
        description: "精于推理，善于思考。应对复杂问题和逻辑分析的最佳选择。",
        icon: Brain,
    },
];

// 创建 Model Context，用于全局管理模型状态
const ModelContext = createContext<{
    selectedModel: Model;
    setSelectedModel: (model: Model) => void;
} | undefined>(undefined);

// ModelProvider 组件：包裹组件，用于提供全局的模型状态
export const ModelProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedModel, setSelectedModel] = useState<Model>(models[0]);

    // 更新 URL 和 Cookie 的函数移到这里，并确保只在必要时更新
    const updateModelInUrlAndCookie = (model: Model) => {
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            const currentModal = url.searchParams.get('modal');
            const newModal = `${model.name}-${model.version}`;
            
            // 只在值真正改变时才更新
            if (currentModal !== newModal) {
                url.searchParams.set('modal', newModal);
                window.history.replaceState({}, '', url);
                Cookies.set('selectedModel', newModal);
            }
        }
    };

    // 包装 setSelectedModel 以同步更新 URL 和 Cookie
    const handleModelChange = (model: Model) => {
        setSelectedModel(model);
        updateModelInUrlAndCookie(model);
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const modalFromUrl = urlParams.get("modal");
            const cookieModel = Cookies.get("selectedModel");

            let modelToSet = models[0];

            if (modalFromUrl) {
                const [name, version] = modalFromUrl.split("-");
                const matchedModel = models.find(
                    (model) => model.name === name && model.version === version
                );
                if (matchedModel) {
                    modelToSet = matchedModel;
                }
            } else if (cookieModel) {
                const [name, version] = cookieModel.split("-");
                const matchedModel = models.find(
                    (model) => model.name === name && model.version === version
                );
                if (matchedModel) {
                    modelToSet = matchedModel;
                }
            }

            // 使用新的处理函数
            handleModelChange(modelToSet);
        }
    }, []);

    return (
        <ModelContext.Provider value={{ selectedModel, setSelectedModel: handleModelChange }}>
            {children}
        </ModelContext.Provider>
    );
};

// 自定义 Hook，用于全局获取当前的模型
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

    return (
        <div>
            {/* 触发下拉菜单的按钮 */}
            <Button
                ref={buttonRef}
                variant="ghost"
                className="flex items-center gap-1 rounded-lg py-1.5 px-3 text-[19px] font-semibold hover:bg-secondary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <span className="text-secondary-foreground">
                    {selectedModel.name}{" "}
                    <span className="text-muted-foreground">{selectedModel.version}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* 下拉菜单 */}
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