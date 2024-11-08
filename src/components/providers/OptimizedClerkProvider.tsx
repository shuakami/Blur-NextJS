import { ClerkProvider } from "@clerk/nextjs";
import { memo } from "react";
import type { PropsWithChildren } from "react";

/**
 * 优化的 ClerkProvider 组件，使用 memo 来减少不必要的重渲染。
 * 
 * @param {PropsWithChildren} props - 组件的属性，包含子组件。
 * @returns {JSX.Element} 返回包含子组件的 ClerkProvider。
 */
export const OptimizedClerkProvider = memo(function OptimizedClerkProvider({
  children,
}: PropsWithChildren) {
  return <ClerkProvider>{children}</ClerkProvider>;
}); 