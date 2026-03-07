import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Shell */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white/80 px-6 backdrop-blur-md border-b border-surface-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-xl p-2 text-surface-600 hover:bg-surface-50 lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 lg:pl-4">
            {/* Search/Breadcrumb placeholder */}
            <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-surface-400">
              <span className="hover:text-surface-900 cursor-pointer">Dashboard</span>
              <span className="text-surface-300">/</span>
              <span className="text-surface-900">Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-xl p-2 text-surface-500 hover:bg-surface-50 hover:text-primary-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-100 bg-primary-50">
              {/* User Avatar Placeholder */}
              <div className="h-full w-full flex items-center justify-center font-bold text-primary-700">U</div>
            </div>
          </div>
        </header>

        {/* Dynamic Module Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
