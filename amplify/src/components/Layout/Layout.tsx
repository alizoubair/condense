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
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-lg p-6 bg-white">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}