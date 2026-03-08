import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { purchaseService } from '../../services/purchaseService';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';

export default function RecordPurchase() {
  const { businessData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    vendorId: '',
    productId: '',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (businessData?.id) {
      loadInitialData();
    }
  }, [businessData]);

  async function loadInitialData() {
    try {
      const [vData, pData] = await Promise.all([
        vendorService.getAll(businessData.id),
        productService.getAll(businessData.id)
      ]);
      setVendors(vData);
      setProducts(pData);
    } catch (err) {
      console.error('[RecordPurchase] Load error:', err);
      setError('Failed to load vendors or products.');
    } finally {
      setFetching(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendorId || !formData.productId || !formData.quantity || !formData.price) {
      return setError('All fields are required');
    }
    
    setLoading(true);
    setError('');

    try {
      const selectedVendor = vendors.find(v => v.id === formData.vendorId);
      const selectedProduct = products.find(p => p.id === formData.productId);

      await purchaseService.create(businessData.id, {
        ...formData,
        vendorName: selectedVendor.name,
        productName: selectedProduct.name,
        quantity: Number(formData.quantity),
        price: Number(formData.price)
      });
      navigate('/dashboard/purchases');
    } catch (err) {
      console.error('[RecordPurchase] Create error:', err);
      setError('Failed to record purchase. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center animate-pulse text-surface-400 font-bold">Loading form data...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto anime-fade-in pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/purchases" className="p-2 lg:p-3 rounded-2xl bg-white border border-surface-200 text-surface-400 hover:text-primary-600 transition-all shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">Record Purchase</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2rem] border border-surface-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Vendor</label>
            <select
              required
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
              value={formData.vendorId}
              onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
            >
              <option value="">Select Vendor</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Product</label>
            <select
              required
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            >
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Quantity</label>
            <input
              type="number"
              required
              min="1"
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Purchase Price (per unit)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Date</label>
          <input
            type="date"
            required
            className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 animate-shake">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Recording Purchase...' : 'Confirm Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
}
