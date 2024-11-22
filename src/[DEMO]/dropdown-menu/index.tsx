import { useState } from "react";
import { MenuItem, MenuSeparator, MenuButton, MenuItems } from "@/components/ui/dropdown-menu";
import {
  Pencil,
  Copy,
  Archive,
  Trash,
  Settings,
  User,
  LogOut,
  Mail,
  MessageSquare,
  PlusCircle,
  UserPlus,
  Users,
  Heart,
  LifeBuoy,
  Folder,
  ChevronDown,
  Link,
  Twitter,
  Facebook,
  Linkedin,
  Clock,
  Timer,
  Bot,
  Code2,
  Brush,
  History,
  Lock,
  FolderSearch,
  Share,
  Sparkles,
  Zap,
  Cpu,
  Gauge,
  Sliders,
  MessageCircle,
  BrainCircuit,
  Languages,
  VolumeX,
  Volume2,
  Mic,
  SpeakerIcon,
  Keyboard,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Showcase from "../showcase";
import { createCategory, createVariant } from "../utils";
import { cn } from "@/lib/utils";

export default function DropdownMenuShowcase() {
  const categories = [
    createCategory("basic", "基础下拉菜单", "基础的下拉菜单示例", [
      createVariant("Basic", "basic", "基础示例",
        <BasicExample />
      ),
      createVariant("With Icons", "with-icons", "带图标的下拉菜单",
        <WithIconsExample />
      ),
      createVariant("With Shortcuts", "with-shortcuts", "带快捷键的下拉菜单",
        <WithShortcutsExample />
      ),
    ]),

    createCategory("advanced", "进阶用法", "更复杂的下拉菜单示例", [
      createVariant("User Menu", "user-menu", "用户菜单示例",
        <UserMenuExample />
      ),
      createVariant("Settings Menu", "settings-menu", "设置菜单示例",
        <SettingsMenuExample />
      ),
      createVariant("Project Menu", "project-menu", "项目管理菜单",
        <ProjectMenuExample />
      ),
      createVariant("Share Menu", "share-menu", "分享菜单",
        <ShareMenuExample />
      ),
      createVariant("Status Menu", "status-menu", "状态切换菜单",
        <StatusMenuExample />
      ),
      createVariant("AI Assistant Settings", "ai-settings", "AI 助手设置菜单",
        <AISettingsExample /> 
      ),
    ]),
  ];

  return <Showcase title="Dropdown Menu 下拉菜单" categories={categories} />;
}

// 基础示例
function BasicExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center justify-center">
      <MenuButton ref={setButtonRef} onClick={() => setIsOpen(!isOpen)}>
        选项
      </MenuButton>

      <MenuItems
        isOpen={isOpen}
        referenceElement={buttonRef}
        onClose={() => setIsOpen(false)}
      >
        <MenuItem>新建文件</MenuItem>
        <MenuItem>打开文件</MenuItem>
        <MenuSeparator />
        <MenuItem>保存</MenuItem>
        <MenuItem isDanger>删除</MenuItem>
      </MenuItems>
    </div>
  );
}

// 带图标的示例
function WithIconsExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center justify-center">
      <MenuButton ref={setButtonRef} onClick={() => setIsOpen(!isOpen)}>
        操作
      </MenuButton>

      <MenuItems
        isOpen={isOpen}
        referenceElement={buttonRef}
        onClose={() => setIsOpen(false)}
      >
        <MenuItem icon={Pencil}>编辑</MenuItem>
        <MenuItem icon={Copy}>复制</MenuItem>
        <MenuSeparator />
        <MenuItem icon={Archive}>归档</MenuItem>
        <MenuItem icon={Trash} isDanger>删除</MenuItem>
      </MenuItems>
    </div>
  );
}

// 带快捷键的示例
function WithShortcutsExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center justify-center">
      <MenuButton ref={setButtonRef} onClick={() => setIsOpen(!isOpen)}>
        编辑
      </MenuButton>

      <MenuItems
        isOpen={isOpen}
        referenceElement={buttonRef}
        onClose={() => setIsOpen(false)}
      >
        <MenuItem icon={Copy} shortcut="⌘C">复制</MenuItem>
        <MenuItem icon={Pencil} shortcut="⌘E">编辑</MenuItem>
        <MenuSeparator />
        <MenuItem icon={Archive} shortcut="⌘A">归档</MenuItem>
        <MenuItem icon={Trash} shortcut="⌘⌫" isDanger>删除</MenuItem>
      </MenuItems>
    </div>
  );
}

// 用户菜单示例
function UserMenuExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center justify-center">
      <MenuButton 
        ref={setButtonRef} 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <img
          src="https://github.com/shuakami.png"
          alt="用户头像"
          className="w-6 h-6 rounded-full"
        />
        <span>个人中心</span>
      </MenuButton>

      <MenuItems
        isOpen={isOpen}
        referenceElement={buttonRef}
        onClose={() => setIsOpen(false)}
      >
        <MenuItem icon={User}>个人资料</MenuItem>
        <MenuItem icon={Settings}>账号设置</MenuItem>
        <MenuItem icon={Users}>团队管理</MenuItem>
        <MenuItem icon={UserPlus}>邀请用户</MenuItem>
        <MenuSeparator />
        <MenuItem icon={Heart}>我的收藏</MenuItem>
        <MenuItem icon={LifeBuoy}>帮助中心</MenuItem>
        <MenuSeparator />
        <MenuItem icon={LogOut} isDanger>退出登录</MenuItem>
      </MenuItems>
    </div>
  );
}

// 设置菜单示例
function SettingsMenuExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center justify-center">
      <MenuButton 
        ref={setButtonRef} 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        <span>设置</span>
      </MenuButton>

      <MenuItems
        isOpen={isOpen}
        referenceElement={buttonRef}
        onClose={() => setIsOpen(false)}
      >
        <MenuItem icon={User}>个人设置</MenuItem>
        <MenuItem icon={Mail}>通知设置</MenuItem>
        <MenuItem icon={MessageSquare}>消息设置</MenuItem>
        <MenuItem icon={PlusCircle}>添加集成</MenuItem>
        <MenuSeparator />
        <MenuItem icon={Settings}>高级设置</MenuItem>
      </MenuItems>
    </div>
  );
}

// 项目管理菜单示例
function ProjectMenuExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center justify-center">
      <MenuButton 
        ref={setButtonRef} 
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Folder className="w-4 h-4" />
        <span>AI 助手项目</span>
      </MenuButton>

      <MenuItems
        isOpen={isOpen}
        referenceElement={buttonRef}
        onClose={() => setIsOpen(false)}
      >
        <div className="px-2 py-1.5">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            最近访问的项目
          </div>
        </div>
        <MenuItem icon={Bot} shortcut="当前">AI 助手项目</MenuItem>
        <MenuItem icon={Brush}>UI 设计系统</MenuItem>
        <MenuItem icon={Code2}>后端服务</MenuItem>
        
        <MenuSeparator />
        
        <div className="px-2 py-1.5">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            项目管理
          </div>
        </div>
        <MenuItem icon={Settings}>项目设置</MenuItem>
        <MenuItem icon={Users}>成员管理</MenuItem>
        <MenuItem icon={History}>访问记录</MenuItem>
        <MenuItem icon={Lock}>权限设置</MenuItem>
        
        <MenuSeparator />
        
        <MenuItem icon={PlusCircle}>创建新项目</MenuItem>
        <MenuItem icon={FolderSearch}>浏览所有项目</MenuItem>
      </MenuItems>
    </div>
  );
}

// 分享菜单示例
function ShareMenuExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center justify-center">
      <MenuButton 
        ref={setButtonRef} 
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <Share className="w-4 h-4" />
        <span>分享</span>
      </MenuButton>

      <MenuItems
        isOpen={isOpen}
        referenceElement={buttonRef}
        onClose={() => setIsOpen(false)}
      >
        <div className="p-2">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <Link className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              readOnly
              value="https://ai.example.com/share/xyz"
              className="flex-1 text-xs bg-transparent border-none outline-none"
            />
            <button className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
              复制
            </button>
          </div>
        </div>

        <MenuSeparator />

        <MenuItem icon={Users}>
          <div>
            <div>邀请成员</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">直接添加项目成员</div>
          </div>
        </MenuItem>
        
        <MenuItem icon={Mail}>
          <div>
            <div>通过邮件分享</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">发送邀请邮件</div>
          </div>
        </MenuItem>

        <MenuSeparator />
        
        <div className="px-2 py-1.5">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            社交分享
          </div>
        </div>
        <MenuItem icon={Twitter}>分享到 Twitter</MenuItem>
        <MenuItem icon={Facebook}>分享到 Facebook</MenuItem>
        <MenuItem icon={Linkedin}>分享到 LinkedIn</MenuItem>
      </MenuItems>
    </div>
  );
}

// 状态切换菜单示例
function StatusMenuExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const [status, setStatus] = useState<'online' | 'busy' | 'away' | 'offline'>('online');

  const statusConfig = {
    online: { label: '在线', color: 'text-green-500', bg: 'bg-green-500' },
    busy: { label: '忙碌', color: 'text-red-500', bg: 'bg-red-500' },
    away: { label: '离开', color: 'text-yellow-500', bg: 'bg-yellow-500' },
    offline: { label: '离线', color: 'text-gray-500', bg: 'bg-gray-500' }
  };

  return (
    <div className="flex items-center justify-center">
      <MenuButton 
        ref={setButtonRef} 
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <div className={cn(
          "w-2.5 h-2.5 rounded-full",
          statusConfig[status].bg
        )} />
        <span className={statusConfig[status].color}>
          {statusConfig[status].label}
        </span>
      </MenuButton>

      <MenuItems
        isOpen={isOpen}
        referenceElement={buttonRef}
        onClose={() => setIsOpen(false)}
      >
        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(key => (
          <MenuItem
            key={key}
            onClick={() => {
              setStatus(key);
              setIsOpen(false);
            }}
            className={cn(status === key && "bg-gray-100 dark:bg-gray-800")}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full",
                statusConfig[key].bg
              )} />
              <span className={statusConfig[key].color}>
                {statusConfig[key].label}
              </span>
            </div>
          </MenuItem>
        ))}
        
        <MenuSeparator />
        
        <MenuItem icon={Clock}>
          <div>
            <div>设置自定义状态</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">添加状态消息</div>
          </div>
        </MenuItem>
        <MenuItem icon={Timer}>自动切换状态</MenuItem>
      </MenuItems>
    </div>
  );
}

// AI 助手高级设置菜单示例
function AISettingsExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const [model, setModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState('中文');

  return (
    <div className="flex items-center justify-center">
      <MenuButton 
        ref={setButtonRef} 
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
        noDisplayChevronIcon={true}
      >
        <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
        <span>AI 助手设置</span>
      </MenuButton>
  
      <MenuItems
        isOpen={isOpen}
        referenceElement={buttonRef}
        onClose={() => setIsOpen(false)}
        className="w-[340px] backdrop-blur-sm bg-white/95 dark:bg-zinc-900/95"
      >
        {/* 模型选择 */}
        <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-t-md">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span className="font-medium text-gray-800 dark:text-gray-200">语言模型</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded">
              当前: {model}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'Blur Flex', name: 'Blur Flex', desc: '最平衡', icon: Zap },
              { id: 'Blur Pro', name: 'Blur Pro', desc: '更快速', icon: Cpu },
              { id: 'Blur Intellect', name: 'Blur Intellect', desc: '最聪明', icon: Gauge },
              { id: 'Blur Search', name: 'Blur Search', desc: '最丰富', icon: Sliders },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setModel(item.id)}
                className={cn(
                  "flex flex-col items-center p-2 rounded-md transition-all duration-200",
                  "border border-transparent",
                  model === item.id
                    ? "bg-white dark:bg-zinc-800 border-purple-200/70 dark:border-purple-700/30 shadow-sm dark:shadow-purple-900/20"
                    : "hover:bg-white/80 dark:hover:bg-zinc-800/50 hover:border-purple-100 dark:hover:border-purple-800/20"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 mb-1 transition-colors",
                  model === item.id ? "text-purple-500 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"
                )} />
                <div className="text-sm text-gray-700 dark:text-gray-200">{item.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
  
        <MenuSeparator className="bg-gray-200/70 dark:bg-white/[0.06]" />
  
        {/* 温度滑块 */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-sm text-gray-700 dark:text-gray-200">回答温度</div>
            <div className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {temperature}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className={cn(
              "w-full h-1.5 rounded-full appearance-none cursor-pointer",
              "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3",
              "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500",
              "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-zinc-900",
              "[&::-webkit-slider-thumb]:shadow-sm"
            )}
          />
          <div className="flex justify-between mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span>精确</span>
            <span>发散</span>
          </div>
        </div>
  
        <MenuSeparator className="bg-gray-200/70 dark:bg-white/[0.06]" />
  
        {/* 语音设置 */}
        <div className="px-2 py-1.5">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            语音交互
          </div>
        </div>
        <MenuItem
          icon={voiceEnabled ? Volume2 : VolumeX}
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="group"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-gray-700 dark:text-gray-200">语音功能</span>
            <div className={cn(
              "w-8 h-4 rounded-full transition-colors duration-200",
              voiceEnabled 
                ? "bg-purple-500 dark:bg-purple-600" 
                : "bg-gray-300 dark:bg-gray-700"
            )}>
              <div className={cn(
                "w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 mt-0.5",
                "group-hover:shadow-md",
                voiceEnabled ? "translate-x-4" : "translate-x-1"
              )} />
            </div>
          </div>
        </MenuItem>
        <MenuItem 
          icon={Mic} 
          disabled={!voiceEnabled}
          className={!voiceEnabled ? "opacity-50" : ""}
        >
          <span className="text-gray-700 dark:text-gray-200">语音输入设置</span>
        </MenuItem>
        <MenuItem 
          icon={SpeakerIcon} 
          disabled={!voiceEnabled}
          className={!voiceEnabled ? "opacity-50" : ""}
        >
          <span className="text-gray-700 dark:text-gray-200">语音输出设置</span>
        </MenuItem>
  
        <MenuSeparator className="bg-gray-200/70 dark:bg-white/[0.06]" />
  
        {/* 其他设置 */}
        <MenuItem icon={Languages}>
          <div className="flex items-center justify-between w-full">
            <span className="text-gray-700 dark:text-gray-200">界面语言</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm bg-transparent border-none outline-none text-gray-600 dark:text-gray-300"
            >
              <option>中文</option>
              <option>English</option>
              <option>日本語</option>
            </select>
          </div>
        </MenuItem>
        <MenuItem icon={Keyboard}>
          <span className="text-gray-700 dark:text-gray-200">快捷键设置</span>
        </MenuItem>
        <MenuItem icon={RefreshCw}>
          <span className="text-gray-700 dark:text-gray-200">重置设置</span>
        </MenuItem>
  
        <MenuSeparator className="bg-gray-200/70 dark:bg-white/[0.06]" />
  
        <div className="p-2">
          <div className="flex items-center gap-2 p-2 rounded-md text-xs bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <div className="text-amber-700 dark:text-amber-400">
              部分高级功能需要订阅专业版才能使用
            </div>
          </div>
        </div>
      </MenuItems>
    </div>
  );
}