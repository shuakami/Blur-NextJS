import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface LayoutContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const LayoutContext = createContext<LayoutContextType>({
  isSidebarOpen: false,
  toggleSidebar: () => {},
  isMobile: false,
});

export const useLayout = () => useContext(LayoutContext);

interface LayoutProviderProps {
  children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => 
    typeof window !== 'undefined' ? Cookies.get('isSidebarOpen') === 'true' : false
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    const debouncedResize = debounce(checkMobile, 100);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const newState = !prev;
      if (!isMobile) {
        Cookies.set('isSidebarOpen', String(newState));
      }
      return newState;
    });
  };

  return (
    <LayoutContext.Provider value={{ isSidebarOpen, toggleSidebar, isMobile }}>
      {children}
    </LayoutContext.Provider>
  );
}

type DebouncedFunction = (...args: any[]) => void;

// 防抖函数
function debounce(fn: DebouncedFunction, ms: number): DebouncedFunction {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}