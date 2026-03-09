import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { productService } from '../../services/productService';
import { downloadCSV } from '../../utils/exportUtils';
import DataTable from '../../components/Dashboard/DataTable';
import SearchBar from '../../components/Dashboard/SearchBar';
import AddButton from '../../components/Dashboard/AddButton';

export default function Inventory() {
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    if (businessData?.id) {
      loadProducts();
    }
  }, [businessData]);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await productService.getAll(businessData.id);
      setProducts(data);
    } catch (err) {
      console.error('[Inventory] Load error:', err);
      setError(`Failed to load products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await productService.delete(id);
      loadProducts();
    }
  };

  const handleExport = () => {
    const dataToExport = products.map(p => ({
      Product_Name: p.name,
      SKU: p.sku || 'N/A',
      Category: p.category || 'N/A',
      Price: p.price || 0,
      Stock_Quantity: p.stockQuantity || 0,
      Status: p.stockQuantity > 10 ? 'Normal' : 'Low Stock'
    }));
    downloadCSV(dataToExport, 'Inventory_Products');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const stockA = a.stockQuantity || 0;
    const stockB = b.stockQuantity || 0;

    if (sortOrder === 'asc') {
      return stockA - stockB;
    } else {
      return stockB - stockA;
    }
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const columns = [
    {
      header: t('Product Name'),
      accessor: 'name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-surface-900">{row.name}</span>
          <span className="text-[10px] text-surface-400 font-mono tracking-tighter">SKU: {row.sku || 'N/A'}</span>
        </div>
      )
    },
    { header: t('Category'), accessor: 'category' },
    {
      header: t('Price'),
      accessor: 'price',
      render: (row) => <span className="font-bold text-surface-700">₹{row.price.toLocaleString()}</span>
    },
    {
      header: t('Stock'),
      accessor: 'stockQuantity',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`font-black ${row.stockQuantity <= 10 ? 'text-red-600' : 'text-surface-900'}`}>{row.stockQuantity}</span>
          <span className="text-surface-300 text-[10px] font-bold">{t('units')}</span>
        </div>
      )
    },
    {
      header: t('Status'),
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${row.stockQuantity > 10
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
          : 'bg-red-50 text-red-700 border-red-100 animate-pulse'
          }`}>
          {row.stockQuantity > 10 ? t('Normal') : t('Low Stock')}
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
          <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Inventory')}</h1>
          <p className="text-surface-500 font-medium">{t('Track stock levels and manage your catalog.')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={products.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-surface-100 px-6 py-3 text-sm font-bold text-surface-700 shadow-sm hover:bg-surface-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <AddButton to="/dashboard/inventory/add" label={t('Add Product')} />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-surface-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="w-full sm:w-auto">
              <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={t('Search products...')} />
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="w-full sm:w-auto whitespace-nowrap flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-surface-200 bg-white font-bold text-sm text-surface-700 hover:bg-surface-50 transition-all shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={sortOrder === 'asc' ? "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" : "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"} />
              </svg>
              {t('Sort')} <span className="text-primary-600 font-black">{sortOrder === 'asc' ? '' : ''}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full lg:w-auto">
            <span className="text-[10px] font-black uppercase text-surface-300 mr-2 flex-shrink-0">{t('Filter:')}</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${categoryFilter === cat ? 'bg-primary-600 text-white shadow-md' : 'bg-surface-50 text-surface-500 hover:bg-surface-100'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredProducts}
          loading={loading}
          emptyMessage={t('No products match your criteria. Add your first item to get started.')}
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
