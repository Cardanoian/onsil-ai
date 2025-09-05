import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className='p-2 rounded-lg text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:opacity-60 transition'
      title={`${theme === 'light' ? '다크' : '라이트'} 모드로 전환`}
    >
      {theme === 'light' ? (
        <Sun className='w-5 h-5' />
      ) : (
        <Moon className='w-5 h-5' />
      )}
    </button>
  );
};
