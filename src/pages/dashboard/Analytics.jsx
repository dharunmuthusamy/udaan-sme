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

  const result = data || { metrics: {}, charts: {} };
  const metrics = result.metrics || {};
  const charts = result.charts || {
    salesTrend: [],
    topProducts: [],
    purchaseDist: [],
    inventoryStatus: [],
    revenueVsExpenses: [],
    salesByCategory: []
  };
  const isOwner = userData?.role === 'owner';
  const isAccountant = userData?.role === 'accountant';
  const isStorekeeper = userData?.role === 'storekeeper';
  const isStaff = userData?.role === 'staff' || (!isOwner && !isAccountant && !isStorekeeper);

  // RBAC Filter: Staff only see Top Selling Products and Inventory Status
  const showAllCharts = isOwner || isAccountant;
  const showInventoryOnly = isStorekeeper;
  
  return (
    <div className="space-y-8 pb-20 anime-fade-in font-sans">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/70 p-6 rounded-[2.5rem] border border-white/40 shadow-xl backdrop-blur-xl sticky top-4 z-20 mx-1">
        <div>
          <h1 className="text-3xl font-black text-surface-950 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 8v8m-4-5v5m-4-2v2" /></svg>
            </div>
            {t('Business Analytics')}
          </h1>
          <p className="text-surface-500 text-sm font-bold mt-2 ml-13 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {t('Live performance data tracking')}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-surface-400 ml-1">{t('Time Period')}</label>
            <div className="flex items-center gap-2 p-1 bg-surface-100/50 rounded-2xl border border-surface-200/50">
              <input 
                type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange}
                className="text-xs font-bold p-2 bg-transparent focus:outline-none"
              />
              <span className="text-surface-300">/</span>
              <input 
                type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange}
                className="text-xs font-bold p-2 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-surface-400 ml-1">{t('Inventory')}</label>
            <select 
              name="productId" value={filters.productId} onChange={handleFilterChange}
              className="text-xs font-bold px-4 py-3 bg-surface-100/50 border border-surface-200/50 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none appearance-none min-w-[160px]"
            >
              <option value="">{t('All Products')}</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {metrics && (
        <div className="px-1 space-y-8">
          {/* ROW 1: KPI Summary Cards (Full for Owner/Accountant) */}
          {showAllCharts && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard 
                title={t('Total Sales')} 
                value={formatCurrency(metrics.totalSales)} 
                trend="+12%" // Mock trend as per example
                icon="revenue" 
                color="indigo" 
              />
              <KPICard 
                title={t('Total Purchases')} 
                value={formatCurrency(metrics.totalPurchases)} 
                trend="+8%"
                icon="purchase" 
                color="rose" 
              />
              <KPICard 
                title={t('Total Customers')} 
                value={metrics.totalCustomers?.toLocaleString() || '0'} 
                trend="+5%"
                icon="customers" 
                color="emerald" 
              />
              <KPICard 
                title={t('Low Stock Items')} 
                value={metrics.lowStockProducts} 
                icon="warning" 
                color="amber" 
                hasWarning={metrics.lowStockProducts > 0}
              />
            </div>
          )}

          {/* ROW 2: Primary Business Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sales Trend (Visible to Owner/Accountant) */}
            {showAllCharts && (
              <ChartContainer title={t('Sales Trend')} subtitle={t('Monthly revenue insights')}>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} tickFormatter={v => `₹${v>=1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                      <Tooltip content={<CustomTooltip currency />} />
                      <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={4} dot={{ r: 5, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>
            )}

            {/* Top Selling Products (Visible to Everyone) */}
            <ChartContainer title={t('Top Selling Products')} subtitle={t('Most profitable items')}>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.topProducts} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#475569', fontWeight: 700}} width={90} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(79, 70, 229, 0.05)'}} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[0, 8, 8, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>

            {/* Inventory Status (Visible to Everyone) */}
            <ChartContainer title={t('Inventory Status')} subtitle={t('Stock health overview')}>
              <div className="h-[300px] flex flex-col justify-center gap-6 px-4">
                {charts.inventoryStatus.map((status, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white border border-surface-200 shadow-sm`} style={{ color: status.color }}>
                        {t(status.name)}
                      </span>
                      <span className="text-xl font-black text-surface-900">{status.value}</span>
                    </div>
                    <div className="h-6 w-full bg-surface-100 rounded-xl overflow-hidden shadow-inner border border-surface-200">
                      <div 
                        className="h-full transition-all duration-700 ease-out flex items-center px-4"
                        style={{ 
                          width: `${Math.max(15, (status.value / (metrics.totalProducts || 1)) * 100)}%`, 
                          backgroundColor: status.color,
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
                        }}
                      >
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>

          {/* ROW 3: Supporting Analytics (Full for Owner/Accountant) */}
          {showAllCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
              {/* Purchase by Vendor */}
              <ChartContainer title={t('Purchase by Vendors')} subtitle={t('Major supply distribution')}>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.purchaseDist} margin={{ bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} angle={-15} textAnchor="end" />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} hide />
                      <Tooltip content={<CustomTooltip currency />} />
                      <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40}>
                         {charts.purchaseDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'][index % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>

              {/* Revenue vs Expenses */}
              <ChartContainer title={t('Revenue vs Expenses')} subtitle={t('Monthly financial health')}>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.revenueVsExpenses} margin={{ bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip currency />} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 12, fontWeight: 700 }} />
                      <Bar name={t('Revenue')} dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar name={t('Expenses')} dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>

              {/* Sales by Category */}
              <ChartContainer title={t('Sales by Category')} subtitle={t('Revenue contribution')}>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.salesByCategory}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {charts.salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip currency />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend for Pie */}
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {charts.salesByCategory.slice(0, 4).map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        <span className="text-[10px] font-black text-surface-600 uppercase tracking-tighter">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, icon, color, trend, hasWarning }) {
  const themes = {
    indigo: 'bg-indigo-600 shadow-indigo-200',
    rose: 'bg-rose-600 shadow-rose-200',
    emerald: 'bg-emerald-600 shadow-emerald-200',
    amber: 'bg-amber-500 shadow-amber-200',
  };

  const iconBg = {
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-400',
  };

  return (
    <div className={`relative overflow-hidden bg-white p-6 rounded-[2rem] border border-surface-200 shadow-xl shadow-surface-200/50 hover:-translate-y-1 transition-all duration-300 group`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg[color]} text-white shadow-lg transition-transform group-hover:scale-110 duration-500`}>
          <MetricIcon type={icon} />
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-50 border border-surface-100 shadow-sm">
            <svg className={`w-3 h-3 ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d={trend.startsWith('+') ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
            <span className={`text-[11px] font-black ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{trend}</span>
          </div>
        )}
        {hasWarning && (
          <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 animate-bounce">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-surface-400 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-surface-950 tracking-tight">{value}</h3>
      </div>
      
      {/* Decorative Gradient Background */}
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-5 blur-3xl ${color === 'rose' ? 'bg-red-500' : 'bg-primary-500'}`}></div>
    </div>
  );
}

function ChartContainer({ title, subtitle, children }) {
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-surface-200 shadow-xl shadow-surface-200/40 flex flex-col h-full relative group transition-all duration-300 hover:border-primary-100">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1.5 h-6 bg-primary-600 rounded-full shadow-lg shadow-primary-500/50 transition-all duration-500 group-hover:h-8"></div>
          <h2 className="text-base font-black text-surface-950 uppercase tracking-widest leading-none">
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-xs font-bold text-surface-400 ml-4.5">{subtitle}</p>}
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, currency }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-surface-200 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-xs font-bold text-surface-600 uppercase tracking-tighter">{entry.name}:</span>
              <span className="text-sm font-black text-surface-950">
                {currency ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function MetricIcon({ type }) {
  switch (type) {
    case 'revenue': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'purchase': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
    case 'customers': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    case 'warning': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
    default: return null;
  }
}
