import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { invoiceService } from '../../services/invoiceService';
import { purchaseService } from '../../services/purchaseService';
import { vendorService } from '../../services/vendorService';
import { customerService } from '../../services/customerService';

export default function TransactionHistory() {
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [activeFilter, setActiveFilter] = useState('All'); // Transaction Type
  const [selectedEntityId, setSelectedEntityId] = useState(''); // Customer or Vendor ID
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (businessData?.id) {
      loadTransactions();
    }
  }, [businessData]);

  async function loadTransactions() {
    try {
      setLoading(true);
      
      const [invoices, purchases, vendorsData, customersData] = await Promise.all([
        invoiceService.getAll(businessData.id),
        purchaseService.getAll(businessData.id),
        vendorService.getAll(businessData.id),
        customerService.getAll(businessData.id)
      ]);

      setVendors(vendorsData);
      setCustomers(customersData);

      const formattedInvoices = invoices.map(inv => ({
        id: inv.id,
        date: inv.date || inv.invoiceDate || inv.quotationDate || 'N/A',
        type: 'Sale',
        entity: inv.customerName || 'Walk-in Customer',
        entityId: inv.customerId || null,
        amount: inv.totalAmount || 0,
        status: inv.status || 'Paid',
        rawDate: (inv.date || inv.invoiceDate || inv.quotationDate) ? new Date(inv.date || inv.invoiceDate || inv.quotationDate).getTime() : 0
      }));

      const formattedPurchases = purchases.map(pur => ({
        id: pur.id,
        date: pur.date || pur.purchaseDate || 'N/A',
        type: 'Purchase',
        entity: pur.vendorName || 'Unknown Vendor',
        entityId: pur.vendorId || null,
        amount: pur.price * pur.quantity,
        status: 'Completed',
        rawDate: (pur.date || pur.purchaseDate) ? new Date(pur.date || pur.purchaseDate).getTime() : 0
      }));

      const combined = [...formattedInvoices, ...formattedPurchases].sort((a, b) => b.rawDate - a.rawDate);
      setAllTransactions(combined);
    } catch (err) {
      console.error('[TransactionHistory] Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let result = allTransactions;

    // 1. Transaction Type Filter
    if (activeFilter !== 'All') {
      result = result.filter(tx => tx.type === activeFilter);
    }

    // 2. Entity Filter
    if (selectedEntityId) {
      result = result.filter(tx => tx.entityId === selectedEntityId);
    }

    // 3. Date Range Filter
    const filterStartTime = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
    const filterEndTime = endDate ? new Date(endDate).setHours(23,59,59,999) : null;

    if (filterStartTime || filterEndTime) {
      result = result.filter(tx => {
        const txTime = new Date(tx.date).setHours(0,0,0,0);
        if (filterStartTime && txTime < filterStartTime) return false;
        if (filterEndTime && txTime > filterEndTime) return false;
        return true;
      });
    }

    setFilteredTransactions(result);
  }, [allTransactions, activeFilter, selectedEntityId, startDate, endDate]);

  const handleClearFilters = () => {
    setActiveFilter('All');
    setSelectedEntityId('');
    setStartDate('');
    setEndDate('');
  };

  // Determine what entities to show in the dropdown based on activeType
  const entityOptions = activeFilter === 'Sale' ? customers : activeFilter === 'Purchase' ? vendors : [];
  const entityLabel = activeFilter === 'Sale' ? 'Customer' : activeFilter === 'Purchase' ? 'Vendor' : 'Customer/Vendor';

  const filters = ['All', 'Sale', 'Purchase'];

  return (
    <div className="max-w-6xl mx-auto anime-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-surface-900 tracking-tight mb-2">{t('Transaction History')}</h1>
        <p className="text-surface-500 font-medium">{t('Unified view of all sales and purchase activities.')}</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-lg font-black text-surface-900">{t('Filter Transactions')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-surface-500 mb-1.5">{t('Transaction Type')}</label>
            <div className="flex bg-surface-100 rounded-xl p-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setSelectedEntityId(''); // Reset entity when type changes
                  }}
                  className={`
                    flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all
                    ${activeFilter === filter 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-surface-500 hover:text-surface-900 hover:bg-white/50'}
                  `}
                >
                  {t(filter === 'Sale' ? 'Sales' : filter === 'Purchase' ? 'Purchases' : filter)}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-surface-500 mb-1.5">{t(entityLabel)}</label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              disabled={activeFilter === 'All'}
              className="w-full rounded-xl border-surface-200 bg-surface-50 p-3 text-sm font-bold text-surface-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{activeFilter === 'All' ? t('Select Type First') : t(`All ${entityLabel}s`)}</option>
              {entityOptions.map(ent => (
                <option key={ent.id} value={ent.id}>{ent.name}</option>
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
            { (activeFilter !== 'All' || selectedEntityId || startDate || endDate) && (
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

      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400 border-b border-surface-100">{t('Date')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400 border-b border-surface-100">{t('Type')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400 border-b border-surface-100">{t('Customer / Vendor')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400 border-b border-surface-100 text-right">{t('Amount')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400 border-b border-surface-100">{t('Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-surface-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-surface-400 font-bold">{t('No records found.')}</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-surface-600">
                      {tx.date || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        tx.type === 'Sale' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {t(tx.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-surface-900">{tx.entity}</td>
                    <td className="px-6 py-4 text-sm font-black text-surface-900 text-right">₹{tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        tx.status === 'Paid' || tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {t(tx.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
