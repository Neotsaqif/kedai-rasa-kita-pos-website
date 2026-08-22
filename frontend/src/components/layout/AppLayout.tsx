import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { ToastContainer } from '../ui/Toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] font-sans antialiased overflow-hidden text-zinc-900">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpenOnMobile={isMobileNavOpen} 
        onCloseMobile={() => setIsMobileNavOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />
        
        {/* Page Content with safe padding for mobile bottom bar */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 pb-24 lg:pb-6 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenMoreMenu={() => setIsMobileNavOpen(true)} />

      {/* Toast Feedback */}
      <ToastContainer />
    </div>
  );
};
