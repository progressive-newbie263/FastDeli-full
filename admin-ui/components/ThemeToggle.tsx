'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        {theme === 'light' ? (
          <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-600 transition-colors" />
        ) : (
          <Moon className="w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors" />
        )}
      </div>
      <span className="font-medium">
        {theme === 'light' ? 'Giao diện sáng' : 'Giao diện tối'}
      </span>
    </button>
  );
}