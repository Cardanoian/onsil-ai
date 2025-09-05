import { ThemeToggle } from './ThemeToggle';
import { Trash } from 'lucide-react';
import { ChatController } from '../../controllers/ChatController';
import { useTheme } from '../../hooks/useTheme';

export const Header = () => {
  const { theme } = useTheme();
  const handleReset = () => {
    ChatController.getInstance().resetMessages();
  };
  return (
    <div className='flex-none bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 '>
      <div className='mx-auto flex items-center justify-between'>
        <div></div>
        <div className='flex items-center gap-2'>
          <img
            src='/gbept.png'
            alt='ChatG1PT'
            className={`h-10 w-10 cursor-pointer ${
              theme === 'dark' ? 'neon-image' : ''
            }`}
          />
          <h1 className='text-[30px] font-bold text-gray-900 dark:text-white cursor-pointer'>
            온실이AI
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <button
            className='ml-2 p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 transition'
            title='채팅 초기화'
            onClick={handleReset}
          >
            <Trash className='w-5 h-5 text-red-500' />
          </button>
        </div>
      </div>
    </div>
  );
};
