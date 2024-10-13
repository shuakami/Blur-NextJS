import {useState, useRef} from 'react';
import {ChevronDown, Search, Smile, Brain, Sparkles, Orbit} from "lucide-react";
import {Button} from "@/components/ui/button";
import DropDownMenuPlus from "@/components/ui/tofu/dropdown-menu-plus";

type Model = {
    name: string;
    version: string;
    description: string;
    icon: React.ComponentType; // 图标类型
}

const models: Model[] = [
    {
        name: "Blur",
        version: "Lite",
        description: "为轻松日常对话打造。体验清晰、快速的智能交互。",
        icon: Orbit
    },
    {
        name: "Blur",
        version: "Flex",
        description: "赋予更多情感与温度的模型，完美满足你在情感共鸣上的需求。",
        icon: Sparkles
    },
    {
        name: "Blur Search",
        version: "",
        description: "专注于高速大规模检索，适合查找专业知识分析数据。",
        icon: Search
    },
    {
        name: "Blur",
        version: "Intellect",
        description: "精于推理，善于思考。应对复杂问题和逻辑分析的最佳选择。",
        icon: Brain
    }
]

export default function ModelSelector() {
    const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null); // 用于关联 DropDownMenu 的参考元素

    // 将 models 转换成符合 DropDownMenuPlus 的 menuItems 格式
    const menuItems = models.map((model) => ({
        id: `${model.name}-${model.version}`,
        text: `${model.name} ${model.version}`,
        description: model.description, // 添加描述信息
        icon: model.icon, // 添加图标
        onClick: () => setSelectedModel(model),
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
                    {selectedModel.name} <span className="text-muted-foreground">{selectedModel.version}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground"/>
            </Button>

            {/* 下拉菜单 */}
            <DropDownMenuPlus
                referenceElement={buttonRef.current}
                isOpen={isMenuOpen}
                menuItems={menuItems}
                onClose={() => setIsMenuOpen(false)}
                placement="bottom"
            />
        </div>
    );
}
