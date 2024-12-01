import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Showcase from "../showcase"
import { createCategory, createVariant } from "../utils"

export default function DialogShowcase() {
  const categories = [
    createCategory("basic", "基础对话框", "基础的对话框示例", [
      createVariant("Basic", "basic", "最基础的对话框",
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">打开对话框</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>这是一个对话框</DialogTitle>
              <DialogDescription className="mt-2">
                这是一个基础的对话框示例，展示了最基本的对话框结构。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>关闭</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
      createVariant("With Footer", "with-footer", "带有底部按钮的对话框",
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">带操作按钮</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认操作</DialogTitle>
              <DialogDescription className="mt-2">
                这个操作无法撤销，请确认是否继续？
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-2">
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>确认</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    ]),

    createCategory("forms", "表单对话框", "包含表单的对话框", [
      createVariant("Login Form", "login", "登录表单对话框",
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">登录</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>账号登录</DialogTitle>
              <DialogDescription className="mt-2">
                请输入您的账号和密码。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="email">邮箱</label>
                <input
                  id="email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="请输入邮箱"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password">密码</label>
                <input
                  id="password"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="请输入密码"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <Button type="submit" onClick={() => {
                // 这里添加登录逻辑
                console.log('登录处理')
              }}>登录</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    ]),

    createCategory("alerts", "提示对话框", "用于显示提示信息的对话框", [
      createVariant("Success", "success", "成功提示",
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">显示成功</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-green-500">操作成功</DialogTitle>
              <DialogDescription className="mt-2">
                您的操作已经成功完成！
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>确定</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
      createVariant("Error", "error", "错误提示",
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">显示错误</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-500">操作失败</DialogTitle>
              <DialogDescription className="mt-2">
                抱歉，操作过程中出现了错误，请稍后重试。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="error" onClick={() => {
                  // 这里添加重试逻辑
                  console.log('重试操作')
                }}>重试</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    ])
  ]

  return <Showcase title="Dialog Variants" categories={categories} />
}