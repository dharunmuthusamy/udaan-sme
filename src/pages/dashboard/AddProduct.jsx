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

  const [validationErrors, setValidationErrors] = useState({});

  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    if (!value && name !== 'sku' && name !== 'category') {
      errors[name] = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    } else if (name === 'category' && !value) {
      errors[name] = 'Category is required';
    } else {
      delete errors[name];
    }
    setValidationErrors(errors);
  };

  const isFormValid = form.name && form.category && form.price && form.stockQuantity && Object.keys(validationErrors).length === 0;

  const categories = ['Electronics', 'Office Supplies', 'Furniture', 'Services', 'Raw Materials', 'Software', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      return setError('Please fill in all required fields.');
    }

    setSaving(true);
    setError('');
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
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  validateField('name', e.target.value);
                }}
                className={`w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all ${validationErrors.name ? 'border-red-500 bg-red-50/50' : ''}`}
                placeholder="MacBook Pro M3..."
              />
              {validationErrors.name && <p className="mt-1 ml-1 text-[10px] font-bold text-red-500">{validationErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value });
                  validateField('category', e.target.value);
                }}
                className={`w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all cursor-pointer ${validationErrors.category ? 'border-red-500 bg-red-50/50' : ''}`}
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {validationErrors.category && <p className="mt-1 ml-1 text-[10px] font-bold text-red-500">{validationErrors.category}</p>}
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
                  onChange={(e) => {
                    setForm({ ...form, price: e.target.value });
                    validateField('price', e.target.value);
                  }}
                  className={`w-full pl-8 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all ${validationErrors.price ? 'border-red-500 bg-red-50/50' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {validationErrors.price && <p className="mt-1 ml-1 text-[10px] font-bold text-red-500">{validationErrors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Opening Stock *</label>
              <input
                type="number"
                required
                value={form.stockQuantity}
                onChange={(e) => {
                  setForm({ ...form, stockQuantity: e.target.value });
                  validateField('stockQuantity', e.target.value);
                }}
                className={`w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all ${validationErrors.stockQuantity ? 'border-red-500 bg-red-50/50' : ''}`}
                placeholder="100"
              />
              {validationErrors.stockQuantity && <p className="mt-1 ml-1 text-[10px] font-bold text-red-500">{validationErrors.stockQuantity}</p>}
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold px-2">{error}</p>}

          <button
            type="submit"
            disabled={saving || !isFormValid}
            className="w-full py-4 mt-6 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0"
          >
            {saving ? 'Saving...' : 'Add Product to Inventory →'}
          </button>


        </form>
      </div>
    </div>
  );
}
