import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';

export default function AddProduct() {
  const { businessData, user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    sku: ''
  });

  const categories = ['Electronics', 'Office Supplies', 'Furniture', 'Services', 'Raw Materials', 'Software', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stockQuantity) {
      return setError('Please fill in all required fields.');
    }

    setSaving(true);
    try {
      await productService.create(businessData.id, {
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
        createdBy: user.uid
      });
      navigate('/dashboard/inventory');
    } catch (err) {
      console.error('[AddProduct] Error:', err);
      setError(`Failed to create product: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto anime-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/inventory" className="p-3 rounded-2xl bg-white border border-surface-200 text-surface-400 hover:text-primary-600 transition-all shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">Add Product</h1>
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="MacBook Pro M3..."
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all cursor-pointer"
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">SKU (Optional)</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="LAP-MBP-001"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Unit Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full pl-8 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Opening Stock *</label>
              <input
                type="number"
                required
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="100"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold px-2">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 mt-6 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Product to Inventory →'}
          </button>

          <div className="mt-4 p-4 rounded-xl bg-surface-50 border border-surface-100">
            <p className="text-[10px] font-black uppercase text-surface-300 mb-1">Debug Info</p>
            <p className="text-[10px] text-surface-400 font-mono">Business ID: {businessData?.id || 'Not Found'}</p>
          </div>
        </form>
      </div>
    </div>
  );
}
