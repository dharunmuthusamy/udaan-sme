import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { customerService } from '../../services/customerService';
import { downloadCSV } from '../../utils/exportUtils';
import DataTable from '../../components/Dashboard/DataTable';
import SearchBar from '../../components/Dashboard/SearchBar';
import AddButton from '../../components/Dashboard/AddButton';

export default function CRM() {
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (businessData?.id) {
      loadCustomers();
    }
  }, [businessData]);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await customerService.getAll(businessData.id);
      setCustomers(data);
    } catch (err) {
      console.error('[CRM] Load error:', err);
      setError(`Failed to load customers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await customerService.delete(id);
      loadCustomers();
    }
  };

  const handleExport = () => {
    const dataToExport = customers.map(c => ({
      Customer_Name: c.name,
      Email: c.email || 'N/A',
      Phone: c.phone || 'N/A',
      Address: c.address || 'N/A',
      Total_Purchases: c.totalPurchases || 0,
      Invoices_Count: c.recentInvoices?.length || 0,
      Type: (c.totalPurchases || 0) > 50000 ? 'VIP' : 'Standard'
    }));
    downloadCSV(dataToExport, 'CRM_Customers');
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: t('Customer Name'), 
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-surface-50 flex items-center justify-center font-bold text-surface-400 border border-surface-100 uppercase">
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-surface-900">{row.name}</span>
            <span className="text-[10px] text-surface-400 font-medium truncate max-w-[150px]">{row.email || t('No email provided')}</span>
          </div>
        </div>
      )
    },
    { 
      header: t('Contact Info'), 
      render: (row) => (
        <div className="flex flex-col text-xs space-y-0.5">
          <span className="text-surface-700 font-bold">{row.phone || t('No phone')}</span>
          <span className="text-surface-400 font-medium truncate max-w-[150px]">{row.address || t('No address')}</span>
        </div>
      )
    },
    { 
      header: t('Total Purchases'), 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-black text-primary-600">₹{(row.totalPurchases || 0).toLocaleString()}</span>
          <span className="text-[10px] text-surface-400 font-bold uppercase tracking-tighter">
            {row.recentInvoices?.length || 0} {t('Invoices')}
          </span>
        </div>
      )
    },
    { 
      header: t('Customer Type'), 
      render: (row) => (
        <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
          (row.totalPurchases || 0) > 50000 ? 'bg-purple-50 text-purple-700' : 'bg-surface-50 text-surface-400'
        }`}>
          {(row.totalPurchases || 0) > 50000 ? t('VIP') : t('Standard')}
        </span>
      )
    },
    {
      header: t('Actions'),
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-2 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto anime-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('CRM & Customers')}</h1>
          <p className="text-surface-500 font-medium">{t('Maintain client relationships and purchase history.')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            disabled={customers.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-surface-100 px-6 py-3 text-sm font-bold text-surface-700 shadow-sm hover:bg-surface-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <AddButton to="/dashboard/crm/add" label={t('Add Customer')} />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-surface-100">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={t('Search customers by name or phone...')} />
        </div>

        <DataTable 
          columns={columns} 
          data={filteredCustomers} 
          loading={loading} 
          emptyMessage={t('No customers found. Database is currently empty.')}
        />

        {error && (
          <div className="p-8 text-center">
            <div className="inline-block px-6 py-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
