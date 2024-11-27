import { Button } from "@/components/ui/button"
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverDivider
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Settings, User, FileText, MoreHorizontal, Copy, Database, AlertTriangle, Info, History, Save, Play, GitBranch, GitPullRequest, Activity, Terminal } from "lucide-react"
import Showcase from "../showcase"
import { createCategory, createVariant } from "../utils"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function PopoverShowcase() {
  const categories = [
    createCategory("basic", "基础弹出框", "基础的 Popover 弹出框示例", [
      createVariant("Default", "default", "默认弹出框",
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">基础弹出框</Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <PopoverHeader>
              <h3 className="text-sm font-medium">弹出框标题</h3>
              <p className="text-xs text-gray-500">这是一个基础的弹出框示例</p>
            </PopoverHeader>
            <PopoverBody>
              <p className="text-sm">这里是弹出框的主要内容区域</p>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ),

      createVariant("With Status", "with-status", "带状态指示的弹出框",
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">服务器状态</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <PopoverHeader>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">运行正常</span>
              </div>
            </PopoverHeader>
            <PopoverBody>
              <div className="space-y-3">
                {[
                  { label: "CPU 使用率", value: "45%" },
                  { label: "内存使用", value: "2.1GB" },
                  { label: "网络流量", value: "12MB/s" }
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className="text-xs font-medium">{item.value}</span>
                    </div>
                    <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: item.value }} />
                    </div>
                  </div>
                ))}
              </div>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ),

      createVariant("With Footer", "with-footer", "带脚部的弹出框",
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">带脚部的弹出框</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <PopoverHeader>
              <h3 className="text-sm font-medium">带脚部的弹出框标题</h3>
            </PopoverHeader>
            <PopoverBody>
              <p className="text-sm">这里是弹出框的主要内容区域</p>
            </PopoverBody>
            <PopoverFooter>
              <p className="text-xs text-gray-500">这是一个带脚部的弹出框示例</p>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      ),
    ]),

    createCategory("advanced", "高级示例", "复杂交互的弹出框示例", [
      createVariant("User Profile", "user-profile", "用户资料卡片",
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="https://avatars.githubusercontent.com/Shuakami" />
                <AvatarFallback>SK</AvatarFallback>
              </Avatar>
              <span>用户资料</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <PopoverHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarImage src="https://avatars.githubusercontent.com/Shuakami" />
                  <AvatarFallback>SK</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold truncate">Shuakami</h3>
                  </div>
                  <p className="text-xs text-gray-500 truncate">Designer & Developer</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> 328 关注者
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" /> 56 项目
                    </span>
                  </div>
                </div>
              </div>
            </PopoverHeader>
            <PopoverDivider />
            <PopoverBody>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-2">
                    <div className="font-medium">1.2k</div>
                    <div className="text-gray-500">贡献</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-2">
                    <div className="font-medium">328</div>
                    <div className="text-gray-500">Stars</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-2">
                    <div className="font-medium">56</div>
                    <div className="text-gray-500">Repos</div>
                  </div>
                </div>
              </div>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ),

      createVariant("Notification Center", "notification", "通知中心",
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <div className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[480px]">
            <PopoverHeader className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-sm font-medium">通知中心</h3>
                <p className="text-xs text-gray-500">最近 7 天的通知</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverHeader>
            <PopoverBody className="max-h-[380px] mt-0.5 overflow-y-auto -mx-1.5 px-1.5">
              {[
                {
                  avatar: "https://avatars.githubusercontent.com/Shuakami",
                  name: "Shuakami",
                  action: "回复了你的评论",
                  content: "确实如此，这个想法很有创意！",
                  time: "10 分钟前",
                  unread: true
                },
                {
                  avatar: "https://avatars.githubusercontent.com/u/1234567",
                  name: "Alex",
                  action: "提到了你",
                  content: "@你 这个问题你怎么看？",
                  time: "2 小时前",
                  unread: true
                },
                {
                  avatar: "https://avatars.githubusercontent.com/u/7654321",
                  name: "Sarah",
                  action: "分享了你的文章",
                  content: "《构建现代化前端框架》",
                  time: "昨天",
                  unread: false
                }
              ].map((notification, index) => (
                <div
                  key={index}
                  className={cn(
                    "mt-1 group relative flex items-start gap-3 rounded-lg p-3 transition-colors",
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    notification.unread && "bg-gray-50 dark:bg-gray-800/50"
                  )}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={notification.avatar} />
                    <AvatarFallback>
                      {notification.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">
                      <span className="font-medium">{notification.name}</span>
                      {" "}
                      <span className="text-gray-500">{notification.action}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{notification.content}</p>
                    <p className="mt-1.5 text-xs text-gray-400">{notification.time}</p>
                  </div>
                  {notification.unread && (
                    <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-gray-400" />
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </PopoverBody>
            <PopoverDivider />
            <PopoverFooter className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                标记全部已读
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                查看全部
              </Button>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      ),

      createVariant("API Documentation", "api-docs", "API 文档预览",
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="font-mono text-xs">
              GET /api/users/:id
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[480px]">
            <PopoverHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-600 dark:text-green-400">GET</span>
                  <code className="text-sm font-mono">/api/users/:id</code>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="font-mono text-xs">v1.0</Badge>
                  <Badge variant="outline" className="font-mono text-xs">Stable</Badge>
                </div>
              </div>
            </PopoverHeader>
            <PopoverBody className="space-y-4">
              {/* 请求参数 */}
              <div className="space-y-2">
                <div className="text-xs font-medium">Path Parameters</div>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="px-3 py-2 text-left font-medium">Parameter</th>
                        <th className="px-3 py-2 text-left font-medium">Type</th>
                        <th className="px-3 py-2 text-left font-medium">Required</th>
                        <th className="px-3 py-2 text-left font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr>
                        <td className="px-3 py-2 font-mono">id</td>
                        <td className="px-3 py-2 text-gray-500">string</td>
                        <td className="px-3 py-2">
                          <span className="text-red-500">Required</span>
                        </td>
                        <td className="px-3 py-2 text-gray-500">用户唯一标识符</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
    
              {/* 响应示例 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium">Response Example</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                      200 OK
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 font-mono text-xs">
                  <pre className="text-gray-700 dark:text-gray-300">
    {`{
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "created_at": "2024-01-20T08:30:00Z",
      "metadata": {
        "last_login": "2024-01-19T15:45:00Z",
        "login_count": 42
      }
    }`}
                  </pre>
                </div>
              </div>
    
              {/* 错误码 */}
              <div className="space-y-2">
                <div className="text-xs font-medium">Error Codes</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { code: 401, desc: "Unauthorized" },
                    { code: 403, desc: "Forbidden" },
                    { code: 404, desc: "Not Found" },
                    { code: 429, desc: "Too Many Requests" }
                  ].map((error) => (
                    <div key={error.code} className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2">
                      <span className="font-mono text-red-500">{error.code}</span>
                      <span className="text-gray-500">{error.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverBody>
            <PopoverDivider />
            <PopoverFooter className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <Copy className="h-3 w-3" />
                  复制 cURL
                </Button>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <FileText className="h-3 w-3" />
                  完整文档
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Last updated:</span>
                <time>2024-01-20</time>
              </div>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      ),

      createVariant("Query Analyzer", "query-analyzer", "SQL查询分析器",
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="font-mono text-xs gap-2">
              <Database className="h-4 w-4" />
              SELECT * FROM users
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[530px]">
            <PopoverHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-gray-600 dark:text-gray-400">
                    SELECT * FROM users WHERE status = 'active'
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">执行时间:</span>
                  <span className="font-mono text-xs text-orange-500">324ms</span>
                </div>
              </div>
            </PopoverHeader>
            <PopoverBody className="space-y-4">
              {/* 查询计划 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium">查询执行计划</div>
                  <Badge variant="outline" className="text-xs">Index Scan</Badge>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="px-3 py-2 text-left font-medium">Operation</th>
                        <th className="px-3 py-2 text-left font-medium">Cost</th>
                        <th className="px-3 py-2 text-left font-medium">Rows</th>
                        <th className="px-3 py-2 text-left font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {[
                        { op: "→ Index Scan", index: "idx_status", cost: "0.42..1.45", rows: 285, time: "0.242ms" },
                        { op: "  ↳ Filter", pred: "status = 'active'", cost: "0.00..0.32", rows: 158, time: "0.082ms" }
                      ].map((step, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-3 py-2 font-mono">
                            <div className="flex items-center gap-2">
                              <span>{step.op}</span>
                              {step.index && (
                                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                  {step.index}
                                </span>
                              )}
                              {step.pred && (
                                <span className="text-gray-500">({step.pred})</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-500">{step.cost}</td>
                          <td className="px-3 py-2 font-mono text-gray-500">{step.rows}</td>
                          <td className="px-3 py-2 font-mono text-gray-500">{step.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 性能指标 */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "扫描行数", value: "285", desc: "实际扫描的数据行数" },
                  { label: "返回行数", value: "158", desc: "符合条件的结果行数" },
                  { label: "索引使用率", value: "94%", desc: "查询命中索引的比率" }
                ].map((metric, i) => (
                  <div key={i} className="space-y-1 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                    <div className="text-xs text-gray-500">{metric.label}</div>
                    <div className="font-mono text-lg font-medium">{metric.value}</div>
                    <div className="text-xs text-gray-500">{metric.desc}</div>
                  </div>
                ))}
              </div>

              {/* 优化建议 */}
              <div className="space-y-2">
                <div className="text-xs font-medium">优化建议</div>
                <div className="space-y-2">
                  {[
                    { type: "warning", msg: "考虑添加复合索引 (status, created_at)" },
                    { type: "info", msg: "可以使用 LIMIT 限制返回行数" }
                  ].map((tip, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2 rounded-lg px-3 py-2",
                        tip.type === "warning" ? "bg-yellow-500/10" : "bg-blue-500/10"
                      )}
                    >
                      {tip.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <span className="text-xs">{tip.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverBody>
            <PopoverDivider />
            <PopoverFooter className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <History className="h-3 w-3" />
                  查询历史
                </Button>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <Save className="h-3 w-3" />
                  保存查询
                </Button>
              </div>
              <Button size="sm" className="text-xs gap-1">
                <Play className="h-3 w-3" />
                重新执行
              </Button>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      ),

      createVariant("Code Diff Viewer", "code-diff", "代码差异对比",
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <GitBranch className="h-4 w-4" />
              查看变更 <Badge variant="secondary" className="ml-1">+8 -3</Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[580px]">
            <PopoverHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">feat/user-auth</Badge>
                  <span className="text-xs text-gray-500">→</span>
                  <Badge variant="outline" className="font-mono text-xs">main</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>提交于</span>
                  <time>2小时前</time>
                </div>
              </div>
            </PopoverHeader>
            <PopoverBody className="space-y-3">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden font-mono text-xs">
                {[
                  { type: "header", content: "@@ -15,7 +15,12 @@ class AuthController {" },
                  { type: "unchanged", content: "  async login(req: Request, res: Response) {" },
                  { type: "unchanged", content: "    const { username, password } = req.body;" },
                  { type: "removed", content: "    const user = await User.findOne({ username });" },
                  { type: "added", content: "    const user = await User.findOne({" },
                  { type: "added", content: "      where: { username }," },
                  { type: "added", content: "      select: ['id', 'password', 'role']" },
                  { type: "added", content: "    });" },
                  { type: "unchanged", content: "" },
                  { type: "removed", content: "    if (!user) throw new Error('User not found');" },
                  { type: "added", content: "    if (!user) {" },
                  { type: "added", content: "      throw new AuthError('Invalid credentials');" },
                  { type: "added", content: "    }" },
                ].map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "px-4 py-0.5 flex items-center",
                      line.type === "header" && "bg-gray-50 dark:bg-gray-800/50 text-gray-500",
                      line.type === "added" && "bg-green-500/5 text-green-600 dark:text-green-400",
                      line.type === "removed" && "bg-red-500/5 text-red-600 dark:text-red-400"
                    )}
                  >
                    <span className="w-8 text-gray-400">
                      {line.type === "added" && "+"}
                      {line.type === "removed" && "-"}
                    </span>
                    <span className="flex-1">{line.content}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>8 additions</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span>3 deletions</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <Copy className="h-3 w-3" />
                    复制变更
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <GitPullRequest className="h-3 w-3" />
                    创建PR
                  </Button>
                </div>
              </div>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ),

      createVariant("System Monitor", "system-monitor", "系统资源监控",
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Activity className="h-4 w-4" />
              系统状态
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[480px]">
            <PopoverHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                    <Activity className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">生产环境</h3>
                    <p className="text-xs text-gray-500">最后更新于 30秒前</p>
                  </div>
                </div>
                <Badge variant="outline" className="animate-pulse">实时</Badge>
              </div>
            </PopoverHeader>
            <PopoverBody className="space-y-4">
              {/* 关键指标 */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "CPU", value: "45%", status: "normal" },
                  { label: "内存", value: "6.2GB", status: "warning" },
                  { label: "网络 I/O", value: "12MB/s", status: "normal" },
                  { label: "磁盘使用", value: "78%", status: "critical" },
                ].map((metric) => (
                  <div key={metric.label} 
                    className={cn(
                      "rounded-lg border p-3 space-y-1",
                      metric.status === "normal" && "border-gray-200 dark:border-gray-800",
                      metric.status === "warning" && "border-yellow-500/50 bg-yellow-500/5",
                      metric.status === "critical" && "border-red-500/50 bg-red-500/5"
                    )}
                  >
                    <div className="text-xs text-gray-500">{metric.label}</div>
                    <div className="text-lg font-medium font-mono">{metric.value}</div>
                  </div>
                ))}
              </div>

              {/* 实时图表 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">CPU 使用率 (24h)</span>
                    <div className="flex items-center gap-2">
                      {["用户态", "系统态", "IO等待"].map((type) => (
                        <span key={type} className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="h-2 w-2 rounded-full bg-blue-500/50" />
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="h-24 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    {/* 这里可以放真实的图表组件 */}
                    <div className="h-full w-full flex items-end px-2">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 mx-0.5"
                          style={{
                            height: `${Math.random() * 100}%`,
                            background: `rgba(59, 130, 246, ${0.2 + Math.random() * 0.3})`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 活跃进程 */}
              <div className="space-y-2">
                <div className="text-xs font-medium">活跃进程 (Top 3)</div>
                <div className="space-y-2">
                  {[
                    { name: "nginx", pid: 1234, cpu: "2.5%", mem: "120MB" },
                    { name: "node", pid: 5678, cpu: "1.8%", mem: "380MB" },
                    { name: "postgres", pid: 9012, cpu: "1.2%", mem: "250MB" }
                  ].map((process) => (
                    <div
                      key={process.pid}
                      className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-mono text-xs">{process.pid}</div>
                        <div className="font-medium text-sm">{process.name}</div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>CPU: {process.cpu}</span>
                        <span>内存: {process.mem}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverBody>
            <PopoverDivider />
            <PopoverFooter className="flex justify-between">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <Terminal className="h-3 w-3" />
                终端
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <History className="h-3 w-3" />
                  历史记录
                </Button>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <Settings className="h-3 w-3" />
                  设置
                </Button>
              </div>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      ),
    ]),
  ]

  return <Showcase title="Popover 弹出框" categories={categories} />
}