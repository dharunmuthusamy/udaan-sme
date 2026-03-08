import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { quotationService } from '../../services/quotationService';
import StatCard from '../../components/Dashboard/StatCard';
import QuotationTable from '../../components/Dashboard/QuotationTable';

export default function Quotations() {
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (businessData?.id) {
      loadQuotations();
    }
  }, [businessData]);

  async function loadQuotations() {
    try {
      setLoading(true);
      const data = await quotationService.getAll(businessData.id);
      setQuotations(data);
    } catch (err) {
      console.error('[Quotations] Failed to load:', err);
      setError(`Failed to load quotations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const filteredQuotations = filter === 'All' 
    ? quotations 
    : quotations.filter(q => q.status === filter);

  const totalQuoted = quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const draftCount = quotations.filter(q => q.status === 'Draft').length;

  return (
    <div className="max-w-6xl mx-auto anime-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Quotations')}</h1>
          <p className="text-surface-500 font-medium">{t('Manage and track your business quotations.')}</p>
        </div>
        <Link 
          to="/dashboard/sales/create-quotation"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('New Quotation')}
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title={t('Total Quoted')} 
          value={`₹${totalQuoted.toLocaleString()}`} 
          label={t('Estimated value')} 
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        <StatCard 
          title={t('Quotations')} 
          value={quotations.length.toString()} 
          label={t('Total created')} 
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <StatCard 
          title={t('Drafts')} 
          value={draftCount.toString()} 
          label={t('Awaiting finalization')} 
          icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-black text-surface-900 text-lg">{t('Quotation List')}</h2>
          <div className="flex bg-surface-50 p-1 rounded-xl">
            {['All', 'Draft', 'Sent'].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === opt ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                {t(opt)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-2">
          <QuotationTable quotations={filteredQuotations} loading={loading} />
        </div>

        {error && (
          <div className="p-8 text-center border-t border-surface-100">
            <div className="inline-block px-6 py-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
