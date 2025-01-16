// 样式常量
export const CARD_STYLES = {
  base: "rounded-xl bg-white dark:bg-gray-900/90 shadow-lg px-4 py-3.5",
  ring: "ring-1 ring-gray-100 dark:ring-white/[0.05]",
  hover: "hover:bg-gray-50 dark:hover:bg-gray-800/90 transition-colors",
  error: "bg-red-50 dark:bg-red-900/20 ring-1 ring-red-100 dark:ring-red-500/20",
  info: "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-500/20",
  success: "bg-green-50 dark:bg-green-900/20 ring-1 ring-green-100 dark:ring-green-500/20",
} as const;

export const TEXT_STYLES = {
  title: "text-base font-medium tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-white",
  subtitle: "text-sm text-gray-600 dark:text-gray-300",
  label: "text-xs font-medium text-gray-500 dark:text-gray-400",
  link: "text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors",
} as const;

export const ICON_STYLES = {
  base: "h-4 w-4 text-gray-400 dark:text-gray-500",
  state: "h-4 w-4 shrink-0",
} as const;

// 状态颜色
export const STATE_STYLES = {
  open: "text-green-500 dark:text-green-400",
  closed: "text-purple-500 dark:text-purple-400",
  private: "text-gray-400 dark:text-gray-500",
  public: "text-gray-400 dark:text-gray-500",
} as const;