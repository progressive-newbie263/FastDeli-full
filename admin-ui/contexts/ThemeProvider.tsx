
'use client';

import React, { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// default khi login sẽ là font sáng / light
// toggle để bật/tắt
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [initialized, setInitialized] = useState(false);

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    root.classList.remove('dark');

    if (newTheme === 'dark') {
      root.classList.add('dark');
    }
    if (newTheme === 'light' && root.classList.contains('dark')) {
      root.classList.remove('dark');
    }
  };

  // đặt 2 tầng effect cho layout như sau.
  // với mỗi lần toggle, state theme sẽ thay đổi luân phiên giữa 'light' và 'dark'
  // kiểm tra nó với classList.contains (như vanilla js).
  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') as Theme | null;
    const initialTheme = (savedTheme === 'dark' || savedTheme === 'light')
      ? savedTheme
      : (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    
    applyTheme(initialTheme);
    setTheme(initialTheme);
    setInitialized(true);
  }, []);

  // mỗi lần theme thay đổi, áp dụng lại và lưu vào localStorage
  useLayoutEffect(() => {
    if (!initialized) return;
    applyTheme(theme);
    localStorage.setItem('admin-theme', theme);
  }, [theme, initialized]);

  // toggle chuyển đổi theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);

    localStorage.setItem('admin-theme', newTheme);
    setTheme(newTheme);
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}