import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Showcase from "../showcase"
import { createCategory, createVariant } from "../utils"

const AVATAR_URL = "https://fiverr-res.cloudinary.com/t_profile_thumb,q_auto,f_auto/attachments/profile/photo/99669b14d250a852abfa112f137521ae-1728376924869/058d2bfa-dbe5-4dee-902f-4840f54d991a.jpg"

export default function AvatarShowcase() {
  const categories = [
    createCategory("sizes", "尺寸变体", "展示不同尺寸的头像", [
      createVariant("Small", "sm", "小尺寸头像",
        <Avatar size="sm">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      ),
      createVariant("Medium", "md", "默认中等尺寸",
        <Avatar size="md">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      ),
      createVariant("Large", "lg", "大尺寸头像",
        <Avatar size="lg">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      ),
      createVariant("Extra Large", "xl", "超大尺寸头像",
        <Avatar size="xl">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      )
    ]),

    createCategory("status", "状态头像", "带有不同状态标识的头像", [
      createVariant("Online", "online", "在线状态",
        <Avatar status="online">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      ),
      createVariant("Offline", "offline", "离线状态",
        <Avatar status="offline">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      ),
      createVariant("Busy", "busy", "忙碌状态",
        <Avatar status="busy">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      ),
      createVariant("Away", "away", "离开状态",
        <Avatar status="away">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      )
    ]),

    createCategory("status-position", "状态位置", "自定义状态标识的位置", [
      createVariant("Top Right", "top-right", "右上角",
        <Avatar status="online" statusPosition="top-right">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      ),
      createVariant("Top Left", "top-left", "左上角",
        <Avatar status="online" statusPosition="top-left">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      ),
      createVariant("Bottom Right", "bottom-right", "右下角（默认）",
        <Avatar status="online" statusPosition="bottom-right">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      ),
      createVariant("Bottom Left", "bottom-left", "左下角",
        <Avatar status="online" statusPosition="bottom-left">
          <AvatarImage src={AVATAR_URL} alt="@blur" />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      )
    ]),

    createCategory("loading", "加载状态", "展示图片加载的不同状态", [
      createVariant("With Loading Status", "loading-status", "显示加载状态回调",
        <Avatar>
          <AvatarImage 
            src={AVATAR_URL} 
            alt="@blur"
            onLoadingStatusChange={(status) => {
              console.log('Avatar loading status:', status)
            }} 
          />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      ),
      createVariant("Error Fallback", "error", "加载失败时显示备用内容",
        <Avatar>
          <AvatarImage 
            src="invalid-url.jpg" 
            alt="@blur" 
          />
          <AvatarFallback>BL</AvatarFallback>
        </Avatar>
      )
    ])
  ]

  return <Showcase title="Avatar Variants" categories={categories} />
}