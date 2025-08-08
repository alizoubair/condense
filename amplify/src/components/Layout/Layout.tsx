import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}
      >
        <Header
          onMenuClick={() => {
            // On mobile, open the overlay sidebar
            if (window.innerWidth < 1024) {
              setSidebarOpen(true);
            } else {
              // On desktop, toggle the sidebar collapse
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
              <div className="h-full rounded-lg bg-white">
                <div className="h-full p-6">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}