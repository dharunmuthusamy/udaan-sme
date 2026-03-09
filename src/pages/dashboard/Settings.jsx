import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { t } = useLanguage();
  const { userData } = useAuth();
  const isOwner = userData?.role === 'owner';

  return (
    <div className="max-w-6xl mx-auto anime-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-surface-900">{t('Business Settings')}</h1>
          <p className="text-surface-500 font-medium mt-1">{t('Manage your business profile, subscription, and team.')}</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Debug block - Temporary */}
        <pre className="text-[10px] bg-slate-900 text-green-400 p-4 rounded-xl overflow-auto max-w-full">
          {JSON.stringify({ userData, isOwner }, null, 2)}
        </pre>

        {/* Owner-only: Management */}
        {isOwner && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Business Profile */}
            <Link
              to="/dashboard/settings/business"
              className="rounded-2xl border border-surface-200 bg-white p-6 hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 group-hover:text-primary-700 transition-colors">Business Profile</h3>
                  <p className="text-xs text-surface-500 mt-0.5">View your business details and copy your Business ID</p>
                </div>
              </div>
            </Link>

            <Link
              to="/dashboard/settings/requests"
              className="rounded-2xl border border-surface-200 bg-white p-6 hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 group-hover:text-primary-700 transition-colors">Join Requests</h3>
                  <p className="text-xs text-surface-500 mt-0.5">Review and approve people wanting to join your business</p>
                </div>
              </div>
            </Link>

            <Link
              to="/dashboard/settings/users"
              className="rounded-2xl border border-surface-200 bg-white p-6 hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-900 group-hover:text-primary-700 transition-colors">User Management</h3>
                  <p className="text-xs text-surface-500 mt-0.5">Manage team roles and deactivate users</p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* The Business ID inline display was moved to /dashboard/settings/business */}
      </div>
    </div>
  );
}
