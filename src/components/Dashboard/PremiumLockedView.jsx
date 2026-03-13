import { useLanguage } from '../../context/LanguageContext';

export default function PremiumLockedView({ featureName, description }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-[3rem] border border-surface-200 shadow-sm anime-fade-in">
      <div className="w-24 h-24 bg-primary-50 rounded-[2rem] flex items-center justify-center text-4xl mb-8 border border-primary-100 shadow-inner">
        🔒
      </div>
      
      <h2 className="text-3xl font-black text-surface-900 tracking-tight mb-4">
        {featureName || t('Premium Feature')}
      </h2>
      
      <p className="text-surface-500 font-medium max-w-sm leading-relaxed mb-10">
        {description || t('This advanced capability is exclusively available for our Premium members. Upgrade today to unlock your business potential.')}
      </p>

      <button
        onClick={() => alert(t('Upgrade flow coming soon!'))}
        className="px-10 py-5 rounded-2xl bg-primary-600 text-white font-black shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95"
      >
        {t('Upgrade to Premium')}
      </button>

      <div className="mt-12 flex gap-4">
        {['Advanced Charts', 'Excel Export', 'AI Insights'].map((tag) => (
          <span key={tag} className="px-4 py-2 rounded-full bg-surface-50 text-surface-400 text-[10px] font-black uppercase tracking-wider">
            {t(tag)}
          </span>
        ))}
      </div>
    </div>
  );
}
