import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function BusinessProfile() {
  const { t } = useLanguage();
  const { userData, businessData } = useAuth();
  const [copied, setCopied] = useState(false);

  // Fallback if not loaded yet
  if (!businessData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const handleCopy = () => {
    if (userData?.businessId) {
      navigator.clipboard.writeText(userData.businessId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-surface-900">{t('Business Profile')}</h1>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden shadow-sm p-6 space-y-8">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-2">{t('Business Name')}</h3>
              <p className="text-lg font-bold text-surface-900">{businessData.name || '-'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-2">{t('Location')}</h3>
              <p className="text-base text-surface-900">{businessData.location || '-'}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-2">{t('Business ID')}</h3>
              <p className="text-xs text-surface-500 mb-2">{t('Share this ID with staff so they can request to join.')}</p>
              <div className="flex items-center gap-2">
                <code className="block flex-1 rounded-lg bg-surface-100 px-4 py-3 text-sm font-mono text-surface-700 select-all border border-surface-200">
                  {userData?.businessId || '-'}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-50 text-primary-700 font-bold hover:bg-primary-100 transition-colors w-28"
                >
                  {copied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {t('Copied!')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {t('Copy')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Shop Image */}
          <div>
            <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-2">{t('Shop Image')}</h3>
            {businessData.shopImageUrl ? (
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-surface-200 bg-surface-50">
                <img 
                  src={businessData.shopImageUrl} 
                  alt={businessData.name || 'Shop'} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 flex flex-col items-center justify-center text-surface-400">
                <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-sm font-medium">{t('No image uploaded')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
