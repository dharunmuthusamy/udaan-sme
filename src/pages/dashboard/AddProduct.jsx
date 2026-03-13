import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { productService } from '../../services/productService';
import BackButton from '../../components/Common/BackButton';
import UpgradeModal from '../../components/Dashboard/UpgradeModal';
import { incrementCounter } from '../../services/dbService';

export default function AddProduct() {
  const { businessData, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect');
  const rowIndex = queryParams.get('rowIndex');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { checkFeatureLimit } = useAuth();

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
    } else if (name === 'price') {
      const priceVal = parseFloat(value);
      if (isNaN(priceVal) || priceVal <= 0) {
        errors[name] = 'Invalid amount. Price must be greater than ₹0.';
      } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        errors[name] = 'Price can have up to 2 decimal places';
      } else {
        delete errors[name];
      }
    } else if (name === 'stockQuantity') {
      const stockVal = Number(value);
      if (isNaN(stockVal) || !Number.isInteger(stockVal) || stockVal <= 0) {
        errors[name] = 'Invalid quantity. Please enter a value greater than 0.';
      } else {
        delete errors[name];
      }
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

    if (checkFeatureLimit('products', businessData?.productCount || 0)) {
      setShowUpgradeModal(true);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const newItem = await productService.create(businessData.id, {
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
        createdBy: user.uid
      });
      
      // Increment counter
      await incrementCounter('businesses', businessData.id, 'productCount', 1);
      
      if (redirect) {
        const decodedRedirect = decodeURIComponent(redirect);
        const separator = decodedRedirect.includes('?') ? '&' : '?';
        const finalUrl = `${decodedRedirect}${separator}newProductId=${newItem.id}${rowIndex !== null ? `&rowIndex=${rowIndex}` : ''}`;
        navigate(finalUrl);
      } else {
        navigate('/dashboard/inventory');
      }
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
        <BackButton />
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Add Product')}</h1>
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Product Name')} *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  validateField('name', e.target.value);
                }}
                className={`w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all ${validationErrors.name ? 'border-red-500 bg-red-50/50' : ''}`}
                placeholder="Enter product name..."
              />
              {validationErrors.name && <p className="mt-1 ml-1 text-[10px] font-bold text-red-500">{validationErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Category')} *</label>
              <select
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value });
                  validateField('category', e.target.value);
                }}
                className={`w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all cursor-pointer ${validationErrors.category ? 'border-red-500 bg-red-50/50' : ''}`}
              >
                <option value="">{t('Select category')}</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {validationErrors.category && <p className="mt-1 ml-1 text-[10px] font-bold text-red-500">{validationErrors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('SKU (Optional)')}</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="LAP-MBP-001"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Unit Price')} *</label>
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
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Opening Stock')} *</label>
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
            {saving ? t('Saving...') : t('Add Product to Inventory →')}
          </button>


        </form>
      </div>
      
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        message={t('You have reached the limit of 50 products on the Free plan. Upgrade to Premium to add unlimited products.')}
      />
    </div>
  );
}
