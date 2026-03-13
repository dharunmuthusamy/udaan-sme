import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { customerService } from '../../services/customerService';
import BackButton from '../../components/Common/BackButton';
import UpgradeModal from '../../components/Dashboard/UpgradeModal';
import { incrementCounter } from '../../services/dbService';

export default function AddCustomer() {
  const { businessData, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { checkFeatureLimit } = useAuth();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const validateEmail = (email) => {
    if (!email) return true; // Optional field, only validate if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Core info validation
    if (!form.name || !form.phone) {
      return setError('Name and Phone are required.');
    }

    // Phone validation (exactly 10 digits)
    if (!/^\d{10}$/.test(form.phone)) {
      return setError('Invalid phone number. Please enter a 10-digit phone number.');
    }

    // Email validation
    if (form.email && !validateEmail(form.email)) {
      return setError('Invalid email address. Please enter a valid email.');
    }

    if (checkFeatureLimit('customers', businessData?.activeCustomers || 0)) {
      setShowUpgradeModal(true);
      return;
    }

    setSaving(true);
    try {
      const newItem = await customerService.create(businessData.id, {
        ...form,
        createdBy: user.uid
      });
      
      // Increment counter
      await incrementCounter('businesses', businessData.id, 'activeCustomers', 1);
      
      if (redirect) {
        const decodedRedirect = decodeURIComponent(redirect);
        const separator = decodedRedirect.includes('?') ? '&' : '?';
        const finalUrl = `${decodedRedirect}${separator}newCustomerId=${newItem.id}`;
        navigate(finalUrl);
      } else {
        navigate('/dashboard/crm');
      }
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
        <BackButton />
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Add Customer')}</h1>
      </div>

      <div className="bg-white rounded-[2rem] border border-surface-200 p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Customer Name')} *</label>
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
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Phone Number')} *</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setForm({ ...form, phone: val });
                }}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="1234567890"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Email (Optional)')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="customer@email.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Address')}</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
                placeholder="Full address here..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Internal Notes (Optional)')}</label>
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
            {saving ? t('Creating...') : t('Register Customer to CRM →')}
          </button>
          
        </form>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        message={t('You have reached the limit of 50 customers on the Free plan. Upgrade to Premium to add unlimited customers.')}
      />
    </div>
  );
}
