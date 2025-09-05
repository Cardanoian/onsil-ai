import { createContext } from 'react';

export type Page = 'splash' | 'info' | 'chat';

interface PageContextType {
  currentPage: Page;
  setPage: (page: Page) => void;
}

export const PageContext = createContext<PageContextType | undefined>(
  undefined
);
