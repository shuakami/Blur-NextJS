import { Button } from "@/components/ui/button"
import { toast } from '../../hooks/ui/use-toast'
import Showcase from "../showcase"
import { createCategory, createVariant } from "../utils"

export default function ToastShowcase() {
  const categories = [
    createCategory("basic", "基础提示", "基础的 Toast 提示示例", [
      createVariant("Default", "default", "默认提示",
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "默认提示",
              description: "这是一条默认的提示消息",
            })
          }}
        >
          显示默认提示
        </Button>
      ),

      createVariant("With Action", "with-action", "带操作按钮的提示",
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "新消息",
              description: "您收到了一条新消息",
              action: (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log("点击了操作按钮")}
                >
                  查看
                </Button>
              ),
            })
          }}
        >
          显示带操作的提示
        </Button>
      ),
    ]),

    createCategory("variants", "提示类型", "不同类型的 Toast 提示", [
      createVariant("Success", "success", "成功提示",
        <Button
          variant="outline"
          onClick={() => {
            toast({
              variant: "success",
              title: "操作成功",
              description: "您的操作已成功完成",
            })
          }}
        >
          显示成功提示
        </Button>
      ),

      createVariant("Destructive", "destructive", "危险提示",
        <Button
          variant="outline"
          onClick={() => {
            toast({
              variant: "destructive",
              title: "删除失败",
              description: "无法删除该项目，请稍后重试",
            })
          }}
        >
          显示错误提示
        </Button>
      ),

      createVariant("Info", "info", "信息提示",
        <Button
          variant="outline"
          onClick={() => {
            toast({
              variant: "info",
              title: "系统提示",
              description: "系统将在 5 分钟后进行维护",
            })
          }}
        >
          显示信息提示
        </Button>
      ),

      createVariant("Warning", "warning", "警告提示",
        <Button
          variant="outline"
          onClick={() => {
            toast({
              variant: "warning",
              title: "注意",
              description: "您的存储空间即将用完",
            })
          }}
        >
          显示警告提示
        </Button>
      ),
    ]),

    createCategory("custom", "自定义提示", "自定义样式的 Toast 提示", [
      createVariant("Custom Style", "custom", "自定义样式的提示",
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "自定义提示",
              description: "这是一个自定义样式的提示消息",
              className: "bg-gradient-to-r from-purple-500 to-blue-500 text-white",
            })
          }}
        >
          显示自定义提示
        </Button>
      ),

      createVariant("With Buttons", "with-buttons", "带确认和取消按钮的提示",
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "确认操作",
              description: "您确定要执行此操作吗？",
              acceptButton: {
                label: "确认",
                onClick: () => console.log("确认操作"),
              },
              quitButton: {
                label: "取消",
                onClick: () => console.log("取消操作"),
              },
            })
          }}
        >
          显示带按钮的提示
        </Button>
      ),
    ]),

    createCategory("custom", "单条标题", "单条标题的提示", [
      createVariant("Single Title", "single-title", "单条标题的提示",
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "单条标题的提示",
            })
          }}
        >
          显示单条标题的提示
        </Button>
      ),
    ]),

  ]

  return <Showcase title="Toast 提示" categories={categories} />
}