import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { orderService } from '../../services/orderService';
import StatCard from '../../components/Dashboard/StatCard';
import OrderTable from '../../components/Dashboard/OrderTable';

export default function Orders() {
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (businessData?.id) {
      loadOrders();
    }
  }, [businessData]);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await orderService.getAll(businessData.id);
      setOrders(data);
    } catch (err) {
      console.error('[Orders] Failed to load:', err);
      setError(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const totalOrderValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <div className="max-w-6xl mx-auto anime-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Sales Orders')}</h1>
          <p className="text-surface-500 font-medium">{t('Manage and fulfill your customer orders.')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title={t('Total Order Value')} 
          value={`₹${totalOrderValue.toLocaleString()}`} 
          label={t('Cumulative potential revenue')} 
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        <StatCard 
          title={t('Orders')} 
          value={orders.length.toString()} 
          label={t('Total created')} 
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
        <StatCard 
          title={t('Pending Fulfillment')} 
          value={pendingCount.toString()} 
          label={t('Action required')} 
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-black text-surface-900 text-lg">{t('Sales Orders List')}</h2>
          <div className="flex bg-surface-50 p-1 rounded-xl">
            {['All', 'Pending', 'Processing', 'Completed'].map((opt) => (
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
          <OrderTable orders={filteredOrders} loading={loading} />
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
