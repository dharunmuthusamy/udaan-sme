import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const JOIN_ROLES = [
  { value: 'accountant', label: 'Accountant' },
  { value: 'storekeeper', label: 'Storekeeper' },
  { value: 'staff', label: 'Staff' },
];

export default function Signup() {
  const { signup, joinBusiness } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Two signup modes
  const [mode, setMode] = useState('create'); // 'create' | 'join'

  // ─── Owner / Create form state ───
  const [form, setForm] = useState({
    fullName: '',
    businessName: '',
    location: '',
    phone: '',
    whatsappNumber: '',
    password: '',
  });
  const [shopPhoto, setShopPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // ─── Join form state ───
  const [joinForm, setJoinForm] = useState({
    phone: '',
    whatsappNumber: '',
    password: '',
    businessId: '',
  });
  const [joinRole, setJoinRole] = useState('accountant');
  const [joinRoleOpen, setJoinRoleOpen] = useState(false);
  const joinRoleRef = useRef(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (joinRoleRef.current && !joinRoleRef.current.contains(e.target)) setJoinRoleOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reset errors/success when switching modes
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [mode]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleJoinChange(e) {
    setJoinForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Shop photo must be less than 5 MB.');
      return;
    }
    setShopPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setShopPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ─── Create Business Submit ───
  async function handleCreateSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) return setError('Full name is required.');
    if (!form.businessName.trim()) return setError('Business name is required.');
    if (!form.location.trim()) return setError('Business location is required.');
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length !== 10) return setError('Please enter a valid 10-digit phone number.');
    const waDigits = form.whatsappNumber.replace(/\D/g, '');
    if (waDigits.length !== 10) return setError('Please enter a valid 10-digit WhatsApp number.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      const { user, businessId, isNewBusiness } = await signup(
        digits, form.password, form.fullName, form.businessName,
        waDigits, form.location, shopPhoto, 'owner'
      );

      if (isNewBusiness) {
        try {
          const { demoDataService } = await import('../services/demoDataService');
          await demoDataService.generateDemoContent(businessId);
        } catch (demoError) {
          console.warn('Demo data generation failed, skipping...', demoError);
        }
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('[Signup]', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this phone number already exists.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  // ─── Join Business Submit ───
  async function handleJoinSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const digits = joinForm.phone.replace(/\D/g, '');
    if (digits.length !== 10) return setError('Please enter a valid 10-digit phone number.');
    const waDigits = joinForm.whatsappNumber.replace(/\D/g, '');
    if (waDigits.length !== 10) return setError('Please enter a valid 10-digit WhatsApp number.');
    if (!joinForm.businessId.trim()) return setError('Business ID is required.');
    if (joinForm.password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      await joinBusiness(digits, joinForm.password, waDigits, joinRole, joinForm.businessId.trim());
      setSuccess('Your join request has been submitted! The business owner will review and approve your request.');
      setJoinForm({ phone: '', whatsappNumber: '', password: '', businessId: '' });
      setJoinRole('accountant');
      // Optionally navigate out or wait
      setTimeout(() => navigate('/dashboard/onboarding'), 2000);
    } catch (err) {
      console.error('[JoinRequest]', err);
      setError(err.message || 'Failed to submit join request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-surface-200 bg-surface-50 px-3.5 py-2.5 text-sm text-surface-900 placeholder-surface-700/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 transition";

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 pt-16 pb-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-white font-bold shadow-md">
              U
            </span>
            <span className="text-xl font-bold text-surface-900 tracking-tight">
              UDAAN<span className="text-primary-600">-SME</span>
            </span>
          </div>

          <h1 className="text-xl font-bold text-surface-900 text-center">Create your account</h1>
          <p className="mt-1 text-sm text-surface-700/60 text-center">
            Start digitizing your business in minutes
          </p>

          {/* ─── Mode Tabs ─── */}
          <div className="mt-6 flex rounded-xl bg-surface-100 p-1 gap-1">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'create'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              Create New Business
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'join'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              Join Existing Business
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* ════════════════════════════════════════════ */}
          {/* CREATE NEW BUSINESS FORM                     */}
          {/* ════════════════════════════════════════════ */}
          {mode === 'create' && (
            <form className="mt-5 space-y-4" onSubmit={handleCreateSubmit}>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
                <input id="fullName" name="fullName" type="text" value={form.fullName} onChange={handleChange} placeholder="Ramesh Kumar" className={inputClass} />
              </div>

              {/* Business section */}
              <div className="rounded-xl border border-primary-100 bg-primary-50/30 p-4 space-y-4">
                <p className="text-xs font-bold text-primary-600 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  Business Details
                </p>
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-surface-700 mb-1.5">Business Name</label>
                  <input id="businessName" name="businessName" type="text" value={form.businessName} onChange={handleChange} placeholder="Kumar Enterprises" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-surface-700 mb-1.5">Location</label>
                  <input id="location" name="location" type="text" value={form.location} onChange={handleChange} placeholder="T. Nagar, Chennai" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Shop Photo <span className="text-surface-400 font-normal">(optional)</span>
                  </label>
                  {photoPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-surface-200">
                      <img src={photoPreview} alt="Shop preview" className="w-full h-36 object-cover" />
                      <button type="button" onClick={removePhoto} className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 py-6 flex flex-col items-center gap-2 hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer group">
                      <svg className="w-8 h-8 text-surface-300 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs font-medium text-surface-400 group-hover:text-primary-500">Upload shop photo</span>
                      <span className="text-[10px] text-surface-300">Max 5 MB · JPG, PNG</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-surface-700 mb-1.5">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-surface-200 bg-surface-100 px-3 text-sm text-surface-500 font-medium select-none">+91</span>
                  <input id="phone" name="phone" type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={handleChange} placeholder="9876543210" className={`${inputClass} rounded-l-none`} />
                </div>
              </div>
              <div>
                <label htmlFor="whatsappNumber" className="block text-sm font-medium text-surface-700 mb-1.5">WhatsApp Number</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-surface-200 bg-surface-100 px-3 text-sm text-surface-500 font-medium select-none">+91</span>
                  <input id="whatsappNumber" name="whatsappNumber" type="tel" inputMode="numeric" maxLength={10} value={form.whatsappNumber} onChange={handleChange} placeholder="9876543210" className={`${inputClass} rounded-l-none`} />
                </div>
                <p className="mt-1 text-xs text-surface-700/40">Used for notifications & communication</p>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className={inputClass} />
                <p className="mt-1 text-xs text-surface-700/40">Minimum 6 characters</p>
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-accent-500 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Creating account…
                  </span>
                ) : 'Create Account & Business'}
              </button>
            </form>
          )}

          {/* ════════════════════════════════════════════ */}
          {/* JOIN EXISTING BUSINESS FORM                  */}
          {/* ════════════════════════════════════════════ */}
          {mode === 'join' && (
            <form className="mt-5 space-y-4" onSubmit={handleJoinSubmit}>
              {/* Phone */}
              <div>
                <label htmlFor="joinPhone" className="block text-sm font-medium text-surface-700 mb-1.5">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-surface-200 bg-surface-100 px-3 text-sm text-surface-500 font-medium select-none">+91</span>
                  <input id="joinPhone" name="phone" type="tel" inputMode="numeric" maxLength={10} value={joinForm.phone} onChange={handleJoinChange} placeholder="9876543210" className={`${inputClass} rounded-l-none`} />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label htmlFor="joinWhatsapp" className="block text-sm font-medium text-surface-700 mb-1.5">WhatsApp Number</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-surface-200 bg-surface-100 px-3 text-sm text-surface-500 font-medium select-none">+91</span>
                  <input id="joinWhatsapp" name="whatsappNumber" type="tel" inputMode="numeric" maxLength={10} value={joinForm.whatsappNumber} onChange={handleJoinChange} placeholder="9876543210" className={`${inputClass} rounded-l-none`} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="joinPassword" className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
                <input id="joinPassword" name="password" type="password" value={joinForm.password} onChange={handleJoinChange} placeholder="••••••••" className={inputClass} />
                <p className="mt-1 text-xs text-surface-700/40">Minimum 6 characters</p>
              </div>

              {/* Business ID */}
              <div>
                <label htmlFor="businessId" className="block text-sm font-medium text-surface-700 mb-1.5">Business ID</label>
                <input id="businessId" name="businessId" type="text" value={joinForm.businessId} onChange={handleJoinChange} placeholder="Enter the business ID from your owner" className={inputClass} />
                <p className="mt-1 text-xs text-surface-700/40">Ask the business owner for this ID</p>
              </div>

              {/* Role Dropdown */}
              <div ref={joinRoleRef} className="relative">
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Role</label>
                <button
                  type="button"
                  onClick={() => setJoinRoleOpen(!joinRoleOpen)}
                  className={`w-full flex items-center justify-between rounded-lg border bg-surface-50 px-3.5 py-2.5 text-sm text-left transition ${joinRoleOpen
                    ? 'border-primary-400 ring-2 ring-primary-500/50'
                    : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <span className="font-semibold text-surface-900">{JOIN_ROLES.find(r => r.value === joinRole)?.label}</span>
                  <svg className={`w-4 h-4 text-surface-400 transition-transform ${joinRoleOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {joinRoleOpen && (
                  <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-surface-200 bg-white shadow-xl overflow-hidden anime-fade-in">
                    {JOIN_ROLES.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => { setJoinRole(role.value); setJoinRoleOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${joinRole === role.value ? 'bg-primary-50' : 'hover:bg-surface-50'}`}
                      >
                        <span className={`text-sm font-semibold ${joinRole === role.value ? 'text-primary-700' : 'text-surface-900'}`}>{role.label}</span>
                        {joinRole === role.value && (
                          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-primary-600 to-accent-500 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Submitting request…
                  </span>
                ) : 'Submit Join Request'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-surface-700/60">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">Sign in</Link>
          </p>
        </div>

        <Link to="/" className="mt-6 flex items-center justify-center text-sm font-medium text-surface-700/50 hover:text-primary-600 transition-colors">
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
