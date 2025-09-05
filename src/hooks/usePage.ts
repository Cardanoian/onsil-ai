import { useContext } from 'react';
import { PageContext } from '../contexts/PageContext';

export function usePage() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('use Page must be used within a PageProvider');
  }
  return context;
}
