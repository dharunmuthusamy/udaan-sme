import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { purchaseService } from '../../services/purchaseService';
import PurchaseTable from '../../components/Dashboard/PurchaseTable';

export default function Purchases() {
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (businessData?.id) {
      loadPurchases();
    }
  }, [businessData]);

  async function loadPurchases() {
    try {
      setError('');
      const data = await purchaseService.getAll(businessData.id);
      setPurchases(data);
    } catch (err) {
      console.error('[Purchases] Load error:', err);
      // Check for index error
      if (err.message.includes('index')) {
        setError('Missing Firestore Index. Please deploy the provided indexes.');
      } else {
        setError('Failed to load purchases. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }

  const totalSpent = purchases.reduce((sum, p) => sum + (p.quantity * p.price), 0);

  return (
    <div className="space-y-8 anime-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Purchases')}</h1>
          <p className="text-surface-500 mt-1 font-medium">{t('Record and track your inventory purchases.')}</p>
        </div>
        <Link
          to="/dashboard/purchases/record"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('Record Purchase')}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Total Spent')}</p>
              <h3 className="text-2xl font-black text-surface-900">₹{totalSpent.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Total Items')}</p>
              <h3 className="text-2xl font-black text-surface-900">{purchases.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center animate-pulse">
          <div className="h-4 w-48 bg-surface-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-surface-100 rounded mx-auto"></div>
        </div>
      ) : error ? (
        <div className="p-12 text-center bg-red-50 rounded-[2rem] border-2 border-dashed border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-bold">{error}</p>
          <button 
            onClick={loadPurchases}
            className="mt-4 text-sm font-black text-primary-600 hover:underline"
          >
            {t('Try Again')}
          </button>
        </div>
      ) : (
        <PurchaseTable purchases={purchases} />
      )}
    </div>
  );
}
