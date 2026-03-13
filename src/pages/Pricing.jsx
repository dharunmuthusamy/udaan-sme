import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Pricing() {
  const { t } = useLanguage();

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: t('forever'),
      description: t('Perfect for small businesses starting their digital journey.'),
      features: [
        t('Up to 50 Invoices/month'),
        t('Up to 50 Products'),
        t('Up to 50 CRM Customers'),
        t('Up to 3 Staff Members'),
        t('Basic Sales & Inventory'),
        t('Download Invoice PDFs')
      ],
      buttonText: t('Get Started'),
      buttonLink: '/signup',
      highlight: false
    },
    {
      name: 'Premium',
      price: '₹199',
      period: t('per month'),
      description: t('Advanced features to scale your business efficiency.'),
      features: [
        t('Unlimited Invoices'),
        t('Unlimited Products'),
        t('Unlimited Customers'),
        t('Unlimited Staff Members'),
        t('Advanced Business Analytics'),
        t('AI Recommendations'),
        t('Priority Support'),
        t('Data Export (Excel/CSV)')
      ],
      buttonText: t('Upgrade Now'),
      buttonLink: '/signup',
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 bg-surface-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-100/30 rounded-full blur-3xl -z-10 mt-[-300px]"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20 animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-black uppercase tracking-widest mb-6 border border-primary-100">
            {t('Fair Pricing')}
          </span>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-surface-900 mb-6">
            {t('Simple Plans for')} <span className="text-primary-600 font-black">{t('Growth')}</span>
          </h1>
          <p className="mt-4 text-xl text-surface-500 font-medium max-w-2xl mx-auto leading-relaxed">
            {t('Start for free and upgrade as you scale. No hidden fees, cancel anytime.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={plan.name}
              className={`relative rounded-[3rem] p-10 transition-all duration-500 hover:-translate-y-2 group ${
                plan.highlight 
                  ? 'bg-surface-900 text-white shadow-2xl shadow-primary-500/20 ring-4 ring-primary-500/10 scale-105 z-10' 
                  : 'bg-white border border-surface-200 shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  {t('Most Popular')}
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-2xl font-black mb-2 ${plan.highlight ? 'text-white' : 'text-surface-900'}`}>{plan.name}</h3>
                <p className={`text-sm font-medium ${plan.highlight ? 'text-white/60' : 'text-surface-500'}`}>{plan.description}</p>
              </div>

              <div className="mb-10 flex items-baseline gap-1">
                <span className={`text-5xl font-black ${plan.highlight ? 'text-white' : 'text-surface-900'}`}>{plan.price}</span>
                <span className={`text-sm font-bold ${plan.highlight ? 'text-white/40' : 'text-surface-400'}`}>{plan.period}</span>
              </div>

              <ul className="mb-10 space-y-4">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm font-bold ${plan.highlight ? 'text-white/80' : 'text-surface-600'}`}>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.buttonLink}
                className={`block w-full py-5 rounded-2xl text-center font-black transition-all active:scale-95 ${
                  plan.highlight 
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 hover:bg-primary-500' 
                    : 'bg-surface-50 text-surface-900 hover:bg-surface-100'
                }`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-black text-surface-400 hover:text-primary-600 transition-colors uppercase tracking-widest gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('Back to Home')}
          </Link>
        </div>
      </div>
    </div>
  );
}

