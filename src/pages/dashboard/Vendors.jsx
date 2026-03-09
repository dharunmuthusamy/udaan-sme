import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { vendorService } from '../../services/vendorService';
import { purchaseService } from '../../services/purchaseService';
import VendorTable from '../../components/Dashboard/VendorTable';

export default function Vendors() {
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [purchasedVendorIds, setPurchasedVendorIds] = useState(new Set());

  useEffect(() => {
    if (businessData?.id) {
      loadData();
    }
  }, [businessData]);

  async function loadData() {
    try {
      setLoading(true);
      const [vendorData, purchaseData] = await Promise.all([
        vendorService.getAll(businessData.id),
        purchaseService.getAll(businessData.id)
      ]);
      
      const pIds = new Set(purchaseData.map(p => p.vendorId));
      setPurchasedVendorIds(pIds);
      setVendors(vendorData);
    } catch (err) {
      console.error('[Vendors] Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredVendors = vendors.filter(v => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = v.name?.toLowerCase().includes(search) || v.phone?.includes(searchTerm);
    
    if (filter === 'With Purchases') return matchesSearch && purchasedVendorIds.has(v.id);
    if (filter === 'Without Purchases') return matchesSearch && !purchasedVendorIds.has(v.id);
    return matchesSearch;
  });

  return (
    <div className="space-y-8 anime-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Vendors')}</h1>
          <p className="text-surface-500 mt-1 font-medium">{t('Manage your suppliers and service providers.')}</p>
        </div>
        <Link
          to="/dashboard/purchases/vendors/add"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('Add Vendor')}
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder={t('Search by name or phone...')}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-surface-200 bg-white font-bold text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-1 p-1 bg-surface-100 rounded-2xl">
          {['All', 'With Purchases', 'Without Purchases'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                filter === f ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              {t(f)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Total Vendors')}</p>
              <h3 className="text-2xl font-black text-surface-900">{vendors.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center animate-pulse">
          <div className="h-4 w-48 bg-surface-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-surface-100 rounded mx-auto"></div>
        </div>
      ) : (
        <VendorTable vendors={filteredVendors} />
      )}
    </div>
  );
}
