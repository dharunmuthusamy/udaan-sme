import { NavLink, Outlet } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';

export default function StaffsLayout() {
  const { t } = useLanguage();
  const { userData } = useAuth();

  const tabs = [
    { name: 'User Management', path: 'users', roles: ['owner'] },
    { name: 'Join Requests', path: 'join-requests', roles: ['owner'] },
    { name: 'Tasks', path: 'tasks' },
    { name: 'Attendance', path: 'attendance' },
  ];

  const visibleTabs = tabs.filter(tab => {
    if (tab.roles && (!userData || !tab.roles.includes(userData.role))) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto anime-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-surface-900 tracking-tight mb-2">{t('Staff Management')}</h1>
        <p className="text-surface-500 font-medium">{t('Manage your team, approve join requests, and track operational tasks.')}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface-100 rounded-2xl mb-8 w-fit overflow-x-auto">
        {visibleTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `
              px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
              ${isActive 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-surface-500 hover:text-surface-900 hover:bg-white/50'}
            `}
          >
            {t(tab.name)}
          </NavLink>
        ))}
      </div>

      {/* Content */}
      <Outlet />
    </div>
  );
}
