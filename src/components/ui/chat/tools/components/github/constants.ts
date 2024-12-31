// 样式常量
export const CARD_STYLES = {
  base: "rounded-xl bg-white dark:from-gray-900/20 dark:to-gray-800/20 shadow-lg px-4 py-3.5",
  ring: "ring-1 ring-gray-100 dark:ring-white/[0.05]",
  hover: "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
  error: "bg-red-50 dark:from-red-900/20 dark:to-red-800/20",
  info: "bg-blue-50 dark:from-blue-900/20 dark:to-blue-800/20",
  success: "bg-green-50 dark:from-green-900/20 dark:to-green-800/20",
} as const;

export const TEXT_STYLES = {
  title: "text-base font-medium tracking-tight text-gray-900 dark:text-gray-100",
  subtitle: "text-sm text-gray-600 dark:text-gray-300",
  label: "text-xs font-medium text-gray-500 dark:text-gray-400",
  link: "text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors",
} as const;

export const ICON_STYLES = {
  base: "h-4 w-4 text-gray-400",
  state: "h-4 w-4 shrink-0",
} as const;

// 状态颜色
export const STATE_STYLES = {
  open: "text-green-500",
  closed: "text-purple-500",
  private: "text-gray-400",
  public: "text-gray-400",
} as const; 