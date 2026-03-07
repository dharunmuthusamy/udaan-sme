import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';

export default function AddCustomer() {
  const { businessData, user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      return setError('Name and Phone are required.');
    }

    setSaving(true);
    try {
      await customerService.create(businessData.id, {
        ...form,
        createdBy: user.uid
      });
      navigate('/dashboard/crm');
    } catch (err) {
      console.error('[AddCustomer] Error:', err);
      setError(`Failed to create customer: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto anime-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/crm" className="p-3 rounded-2xl bg-white border border-surface-200 text-surface-400 hover:text-primary-600 transition-all shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">Add Customer</h1>
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Customer Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="John Doe..."
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Email (Optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="123 Street Name, City, PIN"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Internal Notes (Optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="Preferred payment mode, best time to call..."
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold px-2">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 mt-6 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Register Customer to CRM →'}
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
