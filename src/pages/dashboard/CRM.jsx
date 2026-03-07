import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import DataTable from '../../components/Dashboard/DataTable';
import SearchBar from '../../components/Dashboard/SearchBar';
import AddButton from '../../components/Dashboard/AddButton';

export default function CRM() {
  const { businessData } = useAuth();
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

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'Customer Name', 
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-surface-50 flex items-center justify-center font-bold text-surface-400 border border-surface-100 uppercase">
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-surface-900">{row.name}</span>
            <span className="text-[10px] text-surface-400 font-medium truncate max-w-[150px]">{row.email || 'No email provided'}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Contact Info', 
      render: (row) => (
        <div className="flex flex-col text-xs space-y-0.5">
          <span className="text-surface-700 font-bold">{row.phone || 'No phone'}</span>
          <span className="text-surface-400 font-medium truncate max-w-[150px]">{row.address || 'No address'}</span>
        </div>
      )
    },
    { 
      header: 'Total Purchases', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-black text-primary-600">₹{(row.totalPurchases || 0).toLocaleString()}</span>
          <span className="text-[10px] text-surface-400 font-bold uppercase tracking-tighter">
            {row.recentInvoices?.length || 0} Invoices
          </span>
        </div>
      )
    },
    { 
      header: 'Customer Type', 
      render: (row) => (
        <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
          (row.totalPurchases || 0) > 50000 ? 'bg-purple-50 text-purple-700' : 'bg-surface-50 text-surface-400'
        }`}>
          {(row.totalPurchases || 0) > 50000 ? 'VIP' : 'Standard'}
        </span>
      )
    },
    {
      header: 'Actions',
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
          <h1 className="text-3xl font-black text-surface-900 tracking-tight">CRM & Customers</h1>
          <p className="text-surface-500 font-medium">Maintain client relationships and purchase history.</p>
        </div>
        <AddButton to="/dashboard/crm/add" label="Add Customer" />
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-surface-100">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search customers by name or phone..." />
        </div>

        <DataTable 
          columns={columns} 
          data={filteredCustomers} 
          loading={loading} 
          emptyMessage="No customers found. Database is currently empty."
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
