
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const navItems = [
  { name: 'Overview', path: '/dashboard', roles: ['owner', 'accountant', 'storekeeper', 'staff'], icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Sales', path: '/dashboard/sales', roles: ['owner', 'accountant'], icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { name: 'Inventory', path: '/dashboard/inventory', roles: ['owner', 'storekeeper'], icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { name: 'Purchases', path: '/dashboard/purchases', roles: ['owner', 'storekeeper', 'accountant'], icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { name: 'Transactions', path: '/dashboard/transactions', roles: ['owner', 'accountant', 'storekeeper'], icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { name: 'CRM', path: '/dashboard/crm', roles: ['owner', 'accountant', 'storekeeper'], icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { name: 'Staffs', path: '/dashboard/staffs', roles: ['owner', 'accountant', 'storekeeper', 'staff'], icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { name: 'Analytics', path: '/dashboard/analytics', roles: ['owner', 'accountant'], icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { name: 'Business Profile', path: '/dashboard/business', roles: ['owner', 'accountant', 'storekeeper', 'staff'], icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { name: 'Help Center', path: '/dashboard/help', roles: ['owner', 'accountant', 'storekeeper', 'staff'], icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout, businessData, userData } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-surface-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-surface-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full uppercase">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-20 border-b border-surface-100">
            <div className="h-9 w-9 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              U
            </div>
            <span className="text-xl font-black text-surface-900 tracking-tighter">UDAAN-SME</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems
              .filter(item => {
                if (!item.roles) return true;
                if (!userData) return false;
                const userRole = userData.role?.toLowerCase()?.trim();
                return item.roles.some(r => r.toLowerCase().trim() === userRole);
              })
              .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                  ${isActive || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'}
                `}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {t(item.name)}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Profile */}
          <div className="p-4 border-t border-surface-100">
            <Link 
              to="/dashboard/business"
              className="flex items-center gap-3 p-3 mb-3 bg-surface-50 rounded-2xl hover:bg-surface-100 transition-all cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold group-hover:scale-110 transition-transform">
                {userData?.fullName?.[0] || userData?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-surface-900 truncate group-hover:text-primary-600 transition-colors">
                  {businessData?.businessName || 'Your Business'}
                </p>
                <p className="text-xs text-surface-500 truncate capitalize">
                  {businessData?.subscriptionPlan || 'Starter'}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('Logout')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
