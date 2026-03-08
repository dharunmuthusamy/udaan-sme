import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { analyticsService } from '../../services/analyticsService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export default function Analytics() {
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState({ metrics: null, charts: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  useEffect(() => {
    if (businessData?.id) {
      loadData();
    }
  }, [businessData]);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const result = await analyticsService.getDashboardMetrics(businessData.id);
      setData(result);
    } catch (err) {
      console.error('[Analytics] Load error:', err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 anime-fade-in animate-pulse">
        <div className="h-10 w-64 bg-surface-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-surface-100 rounded-[2rem]"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-surface-100 rounded-[2rem]"></div>
          <div className="h-96 bg-surface-100 rounded-[2rem]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-red-50 rounded-[2rem] border-2 border-dashed border-red-200">
        <p className="text-red-600 font-bold mb-4">{error}</p>
        <button onClick={loadData} className="text-sm font-black text-primary-600 hover:underline">
          {t('Try Again')}
        </button>
      </div>
    );
  }

  const { metrics, charts } = data;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 anime-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Analytics Overview')}</h1>
        <p className="text-surface-500 mt-1 font-medium">{t('Business performance at a glance.')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Total Sales')}</p>
              <h3 className="text-2xl font-black text-surface-900">{formatCurrency(metrics.totalSales)}</h3>
            </div>
          </div>
        </div>
        
        {/* Total Customers */}
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Total Customers')}</p>
              <h3 className="text-2xl font-black text-surface-900">{metrics.totalCustomers}</h3>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Total Products')}</p>
              <h3 className="text-2xl font-black text-surface-900">{metrics.totalProducts}</h3>
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${metrics.lowStockProducts > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} group-hover:scale-110 transition-transform`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Low Stock Items')}</p>
              <h3 className={`text-2xl font-black ${metrics.lowStockProducts > 0 ? 'text-red-600' : 'text-surface-900'}`}>{metrics.lowStockProducts}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Sales Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-surface-200 shadow-sm">
          <h2 className="text-lg font-black text-surface-900 mb-6">{t('Monthly Sales')}</h2>
          {charts.monthlySales.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(1)+'k' : value}`}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [formatCurrency(value), 'Sales']}
                  />
                  <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-surface-50 rounded-2xl border-2 border-dashed border-surface-200">
              <p className="text-surface-500 font-bold">{t('No sales data available yet.')}</p>
            </div>
          )}
        </div>

        {/* Top Products Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-surface-200 shadow-sm">
          <h2 className="text-lg font-black text-surface-900 mb-6">{t('Top Selling Products')}</h2>
          {charts.topProducts.length > 0 ? (
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.topProducts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {charts.topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [value, 'Units Sold']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-48 ml-4 hidden sm:block">
                <ul className="space-y-3">
                  {charts.topProducts.map((item, index) => (
                    <li key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-bold text-surface-700 truncate" title={item.name}>{item.name}</span>
                      <span className="ml-auto font-medium text-surface-500">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-surface-50 rounded-2xl border-2 border-dashed border-surface-200">
              <p className="text-surface-500 font-bold">{t('No product data available yet.')}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
