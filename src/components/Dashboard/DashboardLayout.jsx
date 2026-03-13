import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Sidebar from './Sidebar';
import FloatingChatbot from './FloatingChatbot';


export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { userData } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (userData && userData.setupCompleted === false) {
      if (location.pathname !== '/dashboard/onboarding') {
        navigate('/dashboard/onboarding', { replace: true });
      }
    } else if (userData && userData.setupCompleted) {
      if (location.pathname === '/dashboard/onboarding') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [userData, location.pathname, navigate]);

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
            
            {/* Language Switcher */}
            <select 
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-surface-50 border border-surface-200 text-surface-700 text-sm font-bold rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2 cursor-pointer outline-none"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="hi">🇮🇳 HI</option>
              <option value="ta">🇮🇳 TA</option>
            </select>

            <button className="relative rounded-xl p-2 text-surface-500 hover:bg-surface-50 hover:text-primary-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <Link
              to="/dashboard/business"
              className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-100 bg-primary-50 hover:ring-2 hover:ring-primary-400 transition-all"
              title="Business Profile"
            >
              {/* User Avatar */}
              <div className="h-full w-full flex items-center justify-center font-bold text-primary-700 capitalize">
                {userData?.name?.charAt(0) || userData?.fullName?.charAt(0) || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Module Content */}
        <main className="flex-1 p-6 lg:p-8">
          {location.pathname === '/dashboard/onboarding' ? (
             <Outlet />
          ) : (
             <Outlet />
          )}
        </main>
      </div>
      
      {/* Global Dashboard Chatbot */}
      <FloatingChatbot />
    </div>
  );
}
