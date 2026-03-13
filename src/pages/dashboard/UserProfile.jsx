import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function UserProfile() {
  const { userData, businessData } = useAuth();
  const { t } = useLanguage();

  if (!userData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  // Format date safely
  const joinedDate = userData.createdAt 
    ? new Date(userData.createdAt.toDate ? userData.createdAt.toDate() : userData.createdAt).toLocaleDateString() 
    : '-';

  return (
    <div className="max-w-4xl mx-auto space-y-6 anime-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-surface-900 tracking-tight">{t('My Profile')}</h1>
          <p className="text-surface-500 text-sm mt-0.5">{t('Manage your personal details.')}</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-surface-200 bg-white shadow-sm overflow-hidden p-8 flex flex-col items-center md:flex-row md:items-start gap-8">
        <div className="flex-shrink-0">
          <div className="h-32 w-32 rounded-full bg-primary-50 border-4 border-primary-100 flex items-center justify-center text-primary-600 font-black text-5xl shadow-inner">
            {userData.fullName?.[0] || userData.name?.[0] || 'U'}
          </div>
        </div>

        <div className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <ProfileField label="Full Name" value={userData.fullName || userData.name} />
            <ProfileField 
              label="Role" 
              value={
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary-50 text-primary-700">
                  {userData.role}
                </span>
              } 
            />
            <ProfileField label="Email Address" value={userData.email} />
            <ProfileField label="Phone Number" value={userData.phone} />
            <ProfileField label="WhatsApp Number" value={userData.whatsappNumber} />
            <ProfileField label="Status" value={
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${userData.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {userData.status || 'active'}
              </span>
            } />
            <ProfileField label="Joined Date" value={joinedDate} />
            <ProfileField label="Business" value={businessData?.businessName || 'N/A'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  const { t } = useLanguage();
  return (
    <div>
      <h3 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-1.5">{t(label)}</h3>
      <div className="text-base font-bold text-surface-900">{value || '-'}</div>
    </div>
  );
}
