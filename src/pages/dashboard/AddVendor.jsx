import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vendorService } from '../../services/vendorService';

export default function AddVendor() {
  const { businessData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return setError('Vendor name is required');
    
    setLoading(true);
    setError('');

    try {
      await vendorService.create(businessData.id, formData);
      navigate('/dashboard/vendors');
    } catch (err) {
      console.error('[AddVendor] Create error:', err);
      setError('Failed to create vendor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto anime-fade-in pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/vendors" className="p-2 lg:p-3 rounded-2xl bg-white border border-surface-200 text-surface-400 hover:text-primary-600 transition-all shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">Add New Vendor</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2rem] border border-surface-200 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Vendor Name</label>
            <input
              type="text"
              required
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
              placeholder="e.g. Acme Corp"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Phone Number</label>
              <input
                type="tel"
                className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">Address</label>
            <textarea
              rows={3}
              className="w-full rounded-2xl border-surface-200 bg-surface-50 p-4 font-bold text-surface-900 focus:border-primary-500 focus:ring-primary-500"
              placeholder="Full office address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
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
            {loading ? 'Creating Vendor...' : 'Create Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
}
