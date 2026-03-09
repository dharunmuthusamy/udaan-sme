import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { purchaseService } from '../../services/purchaseService';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import PurchaseTable from '../../components/Dashboard/PurchaseTable';

export default function Purchases() {
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (businessData?.id) {
      loadData();
    }
  }, [businessData]);

  async function loadData() {
    try {
      setLoading(true);
      const [purchasesData, vendorsData, productsData] = await Promise.all([
        purchaseService.getAll(businessData.id),
        vendorService.getAll(businessData.id),
        productService.getAll(businessData.id)
      ]);
      const sorted = purchasesData.sort((a, b) => {
        const dateA = new Date(a.date || a.purchaseDate).getTime();
        const dateB = new Date(b.date || b.purchaseDate).getTime();
        return dateB - dateA;
      });
      setPurchases(sorted);
      setVendors(vendorsData);
      setProducts(productsData);
    } catch (err) {
      console.error('[Purchases] Load error:', err);
      setError('Failed to load purchase records.');
    } finally {
      setLoading(false);
    }
  }

  const handleClearFilters = () => {
    setSelectedVendorId('');
    setSelectedProductId('');
    setStartDate('');
    setEndDate('');
  };

  const filteredPurchases = purchases.filter(p => {
    const purchaseDateStr = p.date || p.purchaseDate;
    const purchaseTime = new Date(purchaseDateStr).setHours(0,0,0,0);
    const filterStartTime = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
    const filterEndTime = endDate ? new Date(endDate).setHours(23,59,59,999) : null;
    
    // Vendor Match
    if (selectedVendorId && p.vendorId !== selectedVendorId) return false;
    
    // Product Match
    if (selectedProductId) {
       const hasProduct = p.productId === selectedProductId || (p.items && p.items.some(i => i.productId === selectedProductId));
       if (!hasProduct) return false;
    }

    // Date Range Match
    if (filterStartTime && purchaseTime < filterStartTime) return false;
    if (filterEndTime && purchaseTime > filterEndTime) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Link
          to="/dashboard/purchases/records/record"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {t('Record Purchase')}
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-lg font-black text-surface-900">{t('Filter Records')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-surface-500 mb-1.5">{t('Vendor')}</label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full rounded-xl border-surface-200 bg-surface-50 p-3 text-sm font-bold text-surface-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
            >
              <option value="">{t('All Vendors')}</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-surface-500 mb-1.5">{t('Product')}</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl border-surface-200 bg-surface-50 p-3 text-sm font-bold text-surface-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
            >
              <option value="">{t('All Products')}</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-surface-500 mb-1.5">{t('Start Date')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border-surface-200 bg-surface-50 p-3 text-sm font-bold text-surface-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-surface-500 mb-1.5">{t('End Date')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border-surface-200 bg-surface-50 p-3 text-sm font-bold text-surface-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              />
            </div>
            { (selectedVendorId || selectedProductId || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="p-3 rounded-xl bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-surface-900 transition-all font-bold text-sm"
                title={t('Clear Filters')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="p-12 text-center animate-pulse text-surface-400 font-bold">Loading records...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 font-bold">{t(error)}</div>
        ) : (
          <PurchaseTable purchases={filteredPurchases} />
        )}
      </div>
    </div>
  );
}
