'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageTitleContextType {
  title: string;
  subtitle: string;
  setPageTitle: (title: string, subtitle?: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

interface PageTitleProviderProps {
  children: ReactNode;
}

export const PageTitleProvider: React.FC<PageTitleProviderProps> = ({ children }) => {
  const [title, setTitle] = useState('Dashboard');
  const [subtitle, setSubtitle] = useState('');

  const setPageTitle = (newTitle: string, newSubtitle = '') => {
    setTitle(newTitle);
    setSubtitle(newSubtitle);
  };

  return (
    <PageTitleContext.Provider value={{ title, subtitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};

export const useSetPageTitle = (title: string, subtitle = '') => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error('useSetPageTitle must be used within a PageTitleProvider');
  }

  React.useEffect(() => {
    context.setPageTitle(title, subtitle);
  }, [title, subtitle, context]);
};

export const usePageTitle = () => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }
  return context;
};
