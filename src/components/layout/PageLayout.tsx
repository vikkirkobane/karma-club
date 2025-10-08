
import React from 'react';
import { Navigation } from './Navigation';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Navigation title={title} />
      
      {/* Main Content with bottom padding for mobile navigation */}
      <main className="flex-1 p-4 pb-20 md:pb-4">
        {children}
      </main>
    </div>
  );
};
