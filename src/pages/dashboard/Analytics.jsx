import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { analyticsService } from '../../services/analyticsService';
import { getCollection } from '../../services/dbService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

export default function Analytics() {
  const { businessData, userData } = useAuth();
  const { t } = useLanguage();
  
  const [data, setData] = useState({ metrics: null, charts: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    productId: '',
    vendorId: ''
  });

  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

  useEffect(() => {
    if (businessData?.id) {
      loadInitialData();
    }
  }, [businessData]);

  useEffect(() => {
    if (businessData?.id) {
      loadDashboardData();
    }
  }, [businessData, filters]);

  async function loadInitialData() {
    try {
      const prods = await getCollection('products');
      const filteredProds = prods.filter(p => p.businessId === businessData.id);
      setProducts(filteredProds);

      const purchases = await getCollection('purchases');
      const bizPurchases = purchases.filter(p => p.businessId === businessData.id);
      const uniqueVendors = [];
      const vendorIds = new Set();
      bizPurchases.forEach(p => {
        if (p.vendorId && !vendorIds.has(p.vendorId)) {
          vendorIds.add(p.vendorId);
          uniqueVendors.push({ id: p.vendorId, name: p.vendorName });
        }
      });
      setVendors(uniqueVendors);
    } catch (err) {
      console.error('[Analytics] Initial load error:', err);
    }
  }

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(''); // Clear previous error
      const result = await analyticsService.getDashboardMetrics(businessData.id, filters);
      setData(result);
    } catch (err) {
      console.error('[Analytics] metrics error:', err);
      // More descriptive error
      if (err.message?.includes('index')) {
        setError('Database index is being created. Please wait a few minutes.');
      } else {
        setError('Failed to load dashboard data. ' + (err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading && !data.metrics) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-10 w-64 bg-surface-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-surface-100 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-surface-100 rounded-3xl"></div>
          <div className="h-80 bg-surface-100 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-red-50 rounded-[2rem] border-2 border-dashed border-red-200 anime-fade-in">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-red-900 font-black text-xl mb-2">{t('Oops! Something went wrong')}</p>
        <p className="text-red-600 font-medium mb-6 max-w-md mx-auto">{error}</p>
        <button 
          onClick={loadDashboardData} 
          className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
        >
          {t('Retry Connection')}
        </button>
      </div>
    );
  }

  const { metrics, charts } = data;
  const isOwnerOrAccountant = userData?.role === 'owner' || userData?.role === 'accountant';
  const isManager = isOwnerOrAccountant || userData?.role === 'storekeeper';

  return (
    <div className="space-y-6 pb-20 anime-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div>
          <h1 className="text-2xl font-black text-surface-900 tracking-tight">{t('Business Intelligence')}</h1>
          <p className="text-surface-500 text-sm font-medium">{t('Real-time analytics & performance tracking')}</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-surface-400 ml-2">{t('Dates')}</label>
            <div className="flex gap-1">
              <input 
                type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange}
                className="text-xs p-2 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <input 
                type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange}
                className="text-xs p-2 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-surface-400 ml-2">{t('Product')}</label>
            <select 
              name="productId" value={filters.productId} onChange={handleFilterChange}
              className="text-xs p-2 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">{t('All Products')}</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-surface-400 ml-2">{t('Vendor')}</label>
            <select 
              name="vendorId" value={filters.vendorId} onChange={handleFilterChange}
              className="text-xs p-2 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">{t('All Vendors')}</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {metrics && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {isOwnerOrAccountant && <KPICard title={t('Total Revenue')} value={formatCurrency(metrics.totalSales)} icon="revenue" color="indigo" />}
            {isManager && <KPICard title={t('Total Purchases')} value={formatCurrency(metrics.totalPurchases)} icon="purchase" color="orange" />}
            {isOwnerOrAccountant && (
              <KPICard 
                title={t('Net Profit')} 
                value={formatCurrency(metrics.netProfit)} 
                icon="profit" 
                color={metrics.netProfit >= 0 ? 'emerald' : 'rose'} 
              />
            )}
            <KPICard title={t('Low Stock')} value={metrics.lowStockProducts} icon="stock" color="amber" subText={t('Items under threshold')} />
            <KPICard title={t('Pending Tasks')} value={metrics.pendingTasks} icon="tasks" color="blue" />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            {isOwnerOrAccountant && (
              <ChartContainer title={t('Sales Trend')}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={charts.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={v => `₹${v>=1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                    <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}

            {/* Top Products */}
            <ChartContainer title={t('Top Selling Products')}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.topProducts} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} width={80} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Purchase Distribution */}
            {isManager && (
              <ChartContainer title={t('Purchase by Vendor')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={charts.purchaseDist}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {charts.purchaseDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="flex flex-col justify-center max-h-[300px] overflow-y-auto">
                    <div className="space-y-3 pr-2">
                       {charts.purchaseDist.map((vendor, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-100 hover:bg-surface-100 transition-colors">
                            <div className="flex items-center gap-3 truncate">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              <span className="font-bold text-sm text-surface-700 truncate">{vendor.name}</span>
                            </div>
                            <span className="font-black text-sm text-surface-900 ml-4 flex-shrink-0">{formatCurrency(vendor.value)}</span>
                          </div>
                      ))}
                      {charts.purchaseDist.length === 0 && (
                        <p className="text-center text-surface-400 font-medium italic py-4">{t('No Purchase Data')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </ChartContainer>
            )}

            {/* Inventory Levels */}
            <ChartContainer title={t('Inventory Stock Levels')}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.inventoryStock}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="stock" radius={[4, 4, 0, 0]} barBarSize={30}>
                    {charts.inventoryStock.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.stock < 10 ? '#ef4444' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Sales by Customers */}
            {isOwnerOrAccountant && (
              <ChartContainer title={t('Sales by Customers')}>
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={charts.salesByCustomer} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={v => `₹${v>=1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="totalSales" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="overflow-x-auto rounded-2xl border border-surface-100">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-surface-50">
                        <th className="p-3 font-black text-surface-400 uppercase tracking-wider">{t('Customer Name')}</th>
                        <th className="p-3 font-black text-surface-400 uppercase tracking-wider text-right">{t('Total Sales')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-50">
                      {charts.salesByCustomer.map((c, i) => (
                        <tr key={i} className="hover:bg-surface-50 transition-colors">
                          <td className="p-3 font-bold text-surface-700">{c.name}</td>
                          <td className="p-3 font-black text-primary-600 text-right">{formatCurrency(c.totalSales)}</td>
                        </tr>
                      ))}
                      {charts.salesByCustomer.length === 0 && (
                        <tr>
                          <td colSpan="2" className="p-8 text-center text-surface-400 font-medium italic">
                            {t('No customer data found')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              </ChartContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({ title, value, icon, color, subText }) {
  const themes = {
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white p-5 rounded-[1.5rem] border border-surface-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themes[color] || themes.indigo} group-hover:scale-110 transition-transform`}>
          <MetricIcon type={icon} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-wider text-surface-400">{title}</p>
      </div>
      <h3 className="text-xl font-black text-surface-900 truncate">{value}</h3>
      {subText && <p className="text-[10px] font-medium text-surface-400 mt-1">{subText}</p>}
    </div>
  );
}

function ChartContainer({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm flex flex-col">
      <h2 className="text-sm font-black text-surface-900 mb-6 uppercase tracking-wider flex items-center gap-2">
        <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
        {title}
      </h2>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}

function MetricIcon({ type }) {
  switch (type) {
    case 'revenue': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'purchase': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
    case 'profit': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
    case 'stock': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    case 'tasks': return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
    default: return null;
  }
}
