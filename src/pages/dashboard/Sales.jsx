import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { invoiceService } from '../../services/invoiceService';
import StatCard from '../../components/Dashboard/StatCard';
import InvoiceTable from '../../components/Dashboard/InvoiceTable';

export default function Sales() {
  const { businessData } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (businessData?.id) {
      loadInvoices();
    }
  }, [businessData]);

  async function loadInvoices() {
    try {
      setLoading(true);
      const data = await invoiceService.getAll(businessData.id);
      setInvoices(data);
    } catch (err) {
      console.error('[Sales] Failed to load:', err);
      setError(`Failed to load invoices: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const filteredInvoices = filter === 'All' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  const totalSales = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const pendingSales = invoices.filter(inv => inv.status !== 'Paid').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const paidCount = invoices.filter(inv => inv.status === 'Paid').length;

  return (
    <div className="max-w-6xl mx-auto anime-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-surface-900 tracking-tight">Sales & Invoicing</h1>
          <p className="text-surface-500 font-medium">Manage your invoices and track payments.</p>
        </div>
        <Link 
          to="/dashboard/sales/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Invoice
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Total Sales" 
          value={`₹${totalSales.toLocaleString()}`} 
          label="Cumulative revenue" 
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          trend="+0%"
        />
        <StatCard 
          title="Paid Invoices" 
          value={paidCount.toString()} 
          label={`${invoices.length} total generated`} 
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard 
          title="Pending Payments" 
          value={`₹${pendingSales.toLocaleString()}`} 
          label="Outstanding collections" 
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-black text-surface-900 text-lg">Invoices</h2>
          <div className="flex bg-surface-50 p-1 rounded-xl">
            {['All', 'Paid', 'Pending'].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === opt ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-2">
          <InvoiceTable invoices={filteredInvoices} loading={loading} />
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
