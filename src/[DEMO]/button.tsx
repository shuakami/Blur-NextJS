import { Button } from "@/components/ui/button"
import { 
  Popover,
  PopoverTrigger, 
  PopoverContent,
  PopoverBody,
  PopoverDivider
} from "@/components/ui/popover"
import Showcase from "./showcase"
import { createCategory, createVariant } from "./utils"
import { 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  ChevronDown,
  Trash2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Shuffle,
  Send,
  PlusCircle,
  Image as ImageIcon,
  Smile,
  Share2,
  Eye,
  MoreVertical,
  Upload,
  Music2,
  MessageCircle,
  FolderKanban
} from "lucide-react"

export default function ButtonShowcase() {
  const buttonCategories = [
    createCategory("variants", "按钮类型", "基础的按钮样式变体", [
      createVariant("Default", "default", "默认按钮样式",
        <Button variant="default">Default</Button>
      ),
      createVariant("Outline", "outline", "轮廓按钮",
        <Button variant="outline">Outline</Button>
      ),
      createVariant("Ghost", "ghost", "幽灵按钮",
        <Button variant="ghost">Ghost</Button>
      ),
      createVariant("Warning", "warning", "警告按钮",
        <Button variant="warning">Warning</Button>
      ),
      createVariant("Error", "error", "错误按钮",
        <Button variant="error">Error</Button>
      ),
    ]),
    
    createCategory("sizes", "按钮尺寸", "不同大小的按钮", [
      createVariant("Small", "sm", "小型按钮",
        <Button size="sm">Small</Button>
      ),
      createVariant("Medium", "md", "中等按钮",
        <Button size="md">Medium</Button>
      ),
      createVariant("Large", "lg", "大型按钮",
        <Button size="lg">Large</Button>
      ),
    ]),

    createCategory("icons", "图标按钮", "带有图标的按钮", [
      createVariant("Left Icon", "left-icon", "左侧图标",
        <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
      ),
      createVariant("Right Icon", "right-icon", "右侧图标",
        <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
          Next
        </Button>
      ),
      createVariant("Both Icons", "both-icons", "双侧图标",
        <Button 
          leftIcon={<Download className="h-4 w-4" />}
          rightIcon={<ChevronDown className="h-4 w-4" />}
        >
          Download
        </Button>
      ),
    ]),

    createCategory("states", "按钮状态", "不同状态的按钮", [
      createVariant("Loading", "loading", "加载状态",
        <Button loading>Loading</Button>
      ),
      createVariant("Disabled", "disabled", "禁用状态",
        <Button disabled>Disabled</Button>
      ),
    ]),

    createCategory("rounded", "圆角样式", "不同圆角的按钮", [
      createVariant("Default", "default", "默认圆角",
        <Button rounded="default">Default Rounded</Button>
      ),
      createVariant("Full", "full", "完全圆角",
        <Button rounded="full">Full Rounded</Button>
      ),
    ]),

    createCategory("examples", "组合示例", "按钮的实际使用场景", [
      createVariant("Primary Action with Tooltip", "primary-tooltip", "带提示按钮",
        <Button 
          size="lg"
          rightIcon={<ArrowRight className="h-5 w-5" />}
          tooltip="开始使用"
        >
          Get Started
        </Button>
      ),
      createVariant("Danger Action", "danger", "危险操作按钮",
        <Button 
          variant="error"
          leftIcon={<Trash2 className="h-4 w-4" />}
        >
          Delete Item
        </Button>
      ),
      createVariant("Save Action", "save", "保存操作按钮",
        <Button 
          variant="outline"
          loading
        >
          Saving Changes
        </Button>
      ),
    ]),

    createCategory("complex-scenarios", "复杂场景", "实际应用场景中的按钮组合", [
      createVariant("Music Player", "music-player", "音乐播放器界面",
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              leftIcon={<Music2 className="h-4 w-4" />}
            >
              Music Player
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-screen max-w-md" 
            mobileHeader={{ title: "Music Player" }}
          >
            <PopoverBody>
              <div className="space-y-6">
                {/* Album Info */}
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold truncate">Album Title - Special Edition</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Artist Name</p>
                      </div>
                      <Button variant="ghost" size="sm" rounded="full" tooltip="More Options">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" rounded="full">
                        <PlusCircle className="h-3.5 w-3.5 mr-1" />
                        Add to Playlist
                      </Button>
                      <Button variant="outline" size="sm" rounded="full">
                        <Share2 className="h-3.5 w-3.5 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div className="h-full w-1/3 bg-primary rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1:23</span>
                    <span>3:45</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" rounded="full" tooltip="Shuffle">
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" rounded="full" tooltip="Previous">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="default" 
                      size="lg" 
                      rounded="full"
                      className="h-12 w-12 flex items-center justify-center"
                      tooltip="Play"
                    >
                      <Play className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" rounded="full" tooltip="Next">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" rounded="full" tooltip="Repeat">
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ),

      createVariant("Chat Interface", "chat-interface", "聊天界面",
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              leftIcon={<MessageCircle className="h-4 w-4" />}
            >
              Chat Interface
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-screen max-w-md" 
            mobileHeader={{ title: "Chat" }}
          >
            <PopoverBody>
              <div className="space-y-4">
                {/* Chat Messages */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full shrink-0" />
                    <div className="flex-1">
                      <div className="inline-block bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                        <p className="text-sm">Hey, how's it going?</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 text-left block">John • 2m ago</span>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1">
                      <div className="inline-block bg-primary text-primary-foreground rounded-2xl px-4 py-2 float-right">
                        <p className="text-sm">Pretty good! Working on some new designs.</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 text-right block">You • 1m ago</span>
                    </div>
                  </div>
                </div>

                <PopoverDivider />

                {/* Input Area */}
                <div className="flex items-end gap-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" rounded="full" tooltip="Add Image">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" rounded="full" tooltip="Add Emoji">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5">
                    <p className="text-sm text-gray-400">Type a message...</p>
                  </div>
                  <Button variant="default" size="sm" rounded="full" tooltip="Send">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ),

      createVariant("File Manager", "file-manager", "文件管理界面",
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              leftIcon={<FolderKanban className="h-4 w-4" />}
            >
              File Manager
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-screen max-w-md" 
            mobileHeader={{ title: "File Manager" }}
          >
            <PopoverBody>
              <div className="space-y-4">
                {/* File List */}
                <div className="space-y-2">
                  {/* File Item 1 */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">Project_Preview.png</h4>
                      <p className="text-xs text-gray-500">2.4 MB · Just now</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" rounded="full" tooltip="Preview">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" rounded="full" tooltip="Share">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" rounded="full" tooltip="More">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* File Item 2 */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Download className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">Design_Assets.zip</h4>
                      <p className="text-xs text-gray-500">12.8 MB · Updated yesterday</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" rounded="full" tooltip="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" rounded="full" tooltip="Share">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" rounded="full" tooltip="More">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <PopoverDivider />

                {/* Upload Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  leftIcon={<Upload className="h-4 w-4" />}
                >
                  Upload New File
                </Button>
              </div>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ),
    ]),
  ]

  return (
    <Showcase 
      title="Button Variants" 
      categories={buttonCategories} 
    />
  )
}