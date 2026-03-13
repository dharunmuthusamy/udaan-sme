import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function UpgradeBanner() {
  const { businessData, isPremium } = useAuth();
  const { t } = useLanguage();

  if (isPremium) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-surface-900 to-surface-800 rounded-[2rem] p-6 text-white shadow-xl anime-fade-in group">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-110 duration-700"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-2xl transition-transform group-hover:scale-110 duration-700"></div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/5">
            💎
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">{t('Unlock Your Full Potential')}</h3>
            <p className="text-white/60 text-xs font-medium mt-1">
              {t('Upgrade to Premium to unlock advanced analytics, unlimited invoices, and smart business insights.')}
            </p>
          </div>
        </div>

        <button
          onClick={() => alert(t('Upgrade flow coming soon!'))}
          className="whitespace-nowrap px-8 py-3.5 rounded-xl bg-white text-surface-900 text-sm font-black shadow-lg shadow-white/5 hover:bg-primary-50 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          {t('Upgrade Now')} — ₹199/mo
        </button>
      </div>

      {/* Usage Indicators (Optional) */}
      <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-8">
        <UsageItem 
          label={t('Invoices')} 
          current={businessData?.invoiceCountThisMonth || 0} 
          limit={50} 
        />
        <UsageItem 
          label={t('Products')} 
          current={businessData?.productCount || 0} 
          limit={50} 
        />
        <UsageItem 
          label={t('Staff')} 
          current={businessData?.staffCount || 0} 
          limit={3} 
        />
      </div>
    </div>
  );
}

function UsageItem({ label, current, limit }) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;

  return (
    <div className="flex flex-col gap-1.5 min-w-[120px]">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-white/40">{label}</span>
        <span className={isNearLimit ? 'text-primary-400' : 'text-white/60'}>
          {current}/{limit}
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${
            isNearLimit ? 'bg-primary-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-white/20'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
