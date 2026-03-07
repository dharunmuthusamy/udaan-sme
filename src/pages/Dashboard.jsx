import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { invoiceService } from '../services/invoiceService';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import StatCard from '../components/Dashboard/StatCard';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, businessData } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    activeCustomers: 0,
    inventoryCount: 0,
    lowStockCount: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessData?.id) {
      loadDashboardStats();
    }
  }, [businessData]);

  async function loadDashboardStats() {
    try {
      setLoading(true);
      const [invoices, customers, products] = await Promise.all([
        invoiceService.getAll(businessData.id),
        customerService.getAll(businessData.id),
        productService.getAll(businessData.id)
      ]);

      const totalSales = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const lowStock = products.filter(p => p.stockQuantity <= 10);

      setStats({
        totalSales,
        activeCustomers: customers.length,
        inventoryCount: products.length,
        lowStockCount: lowStock.length
      });
      setLowStockProducts(lowStock);
    } catch (err) {
      console.error('[Dashboard] Stats error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 anime-fade-in">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-surface-100">
        <div>
          <span className="inline-block px-3 py-1 rounded-lg bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-3">
            Business Overview
          </span>
          <h1 className="text-4xl font-black text-surface-900 tracking-tight flex items-center gap-3">
            Hello, {profile?.firstName || 'Business Owner'} 
            <span className="hidden md:inline animate-wave">👋</span>
          </h1>
          <p className="text-surface-500 font-medium mt-1">Here's what's happening at <span className="font-bold text-surface-700 italic">{businessData?.businessName}</span> today.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            to="/dashboard/sales/create" 
            className="px-6 py-3 rounded-2xl bg-primary-600 text-white text-sm font-black shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            + New Invoice
          </Link>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          value={`₹${stats.totalSales.toLocaleString()}`} 
          label="This month" 
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard 
          title="Active Customers" 
          value={stats.activeCustomers.toString()} 
          label="Recurring clients" 
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <StatCard 
          title="Stock Items" 
          value={stats.inventoryCount.toString()} 
          label="Unique SKUs" 
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats.lowStockCount.toString()} 
          label={stats.lowStockCount > 0 ? "Immediate action needed" : "Inventory healthy"} 
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          trend={stats.lowStockCount > 0 ? "Critical" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Widget */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-surface-100 bg-red-50/10">
            <h3 className="font-black text-surface-900 text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Low Stock Products
            </h3>
            <p className="text-xs text-surface-400 font-bold mt-0.5">Below threshold of 10 units</p>
          </div>
          
          <div className="p-4 flex-1">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map(p => (
                  <Link 
                    key={p.id}
                    to="/dashboard/inventory"
                    className="flex items-center justify-between p-4 rounded-2xl bg-surface-50 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 group"
                  >
                    <div>
                      <p className="font-bold text-surface-900 text-sm group-hover:text-red-700 transition-colors uppercase">{p.name}</p>
                      <p className="text-[10px] text-surface-400 font-bold tracking-tighter">STOCK: {p.stockQuantity} UNITS</p>
                    </div>
                    <div className="text-red-600 font-black text-xs animate-pulse">Restock →</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-2xl mb-4">✅</div>
                <p className="text-surface-500 font-bold text-sm px-6">Your inventory levels are looking healthy!</p>
              </div>
            )}
          </div>
          
          <Link 
            to="/dashboard/inventory"
            className="p-5 border-t border-surface-100 text-center text-xs font-black text-surface-400 hover:text-primary-600 transition-colors"
          >
            VIEW ENTIRE INVENTORY
          </Link>
        </div>

        {/* Quick Actions / Recommendations */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black mb-2">Smart Recommendations</h3>
            <p className="text-white/60 font-medium mb-8 max-w-md italic">"Based on your assessment, focuses on Sales & Inventory automation to increase efficiency by up to 30%."</p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard/sales" className="px-6 py-3 rounded-xl bg-white text-surface-900 text-xs font-black hover:bg-primary-50 transition-all">Setup Invoicing</Link>
              <Link to="/dashboard/inventory" className="px-6 py-3 rounded-xl bg-white/10 text-white text-xs font-black hover:bg-white/20 transition-all border border-white/10">Manage Stock</Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-surface-200 shadow-sm">
              <div className="h-12 w-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-xl mb-6 italic">CRM</div>
              <h4 className="font-black text-surface-900 mb-2">Build Relations</h4>
              <p className="text-surface-500 text-xs font-medium leading-relaxed mb-6">Track customer lifetime value and purchase history to provide personalized service.</p>
              <Link to="/dashboard/crm" className="text-primary-600 font-bold text-xs hover:underline decoration-2">Manage Customers →</Link>
            </div>
            <div className="bg-white rounded-[2.5rem] p-8 border border-surface-200 shadow-sm">
              <div className="h-12 w-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-xl mb-6 italic">Task</div>
              <h4 className="font-black text-surface-900 mb-2">Stay Organized</h4>
              <p className="text-surface-500 text-xs font-medium leading-relaxed mb-6">Create follow-ups for unpaid invoices or low-stock items automatically.</p>
              <Link to="/dashboard/tasks" className="text-primary-600 font-bold text-xs hover:underline decoration-2">Open Task List →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
