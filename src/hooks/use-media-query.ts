import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    
    // 初始化匹配状态
    setMatches(media.matches)
    
    // 监听变化
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }
    
    media.addEventListener('change', listener)
    
    return () => {
      media.removeEventListener('change', listener)
    }
  }, [query])
  
  return matches
}