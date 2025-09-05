import { useEffect, useState } from 'react';
import { Theme, ThemeContext } from '../contexts/ThemeContext';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Theme State 관리
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      // localStorage에서 테마 확인
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) return savedTheme;

      // 시스템 테마 확인
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  // 테마 변경 시 localStorage에 저장하고, HTML 클래스 업데이트
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
