import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getBusinessUsers, updateUserProfile, uploadFile, setDocument } from '../../services/dbService';
import { getCurrentLocation, reverseGeocode } from '../../services/locationService';

export default function BusinessProfile() {
  const { t } = useLanguage();
  const { userData, businessData } = useAuth();
  const isOwner = userData?.role === 'owner';

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [ownerData, setOwnerData] = useState(null);
  const [loadingOwner, setLoadingOwner] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [shopImageUrl, setShopImageUrl] = useState(null);
  const imageInputRef = useRef(null);

  // Sync local image url from businessData
  useEffect(() => {
    setShopImageUrl(businessData?.shopImageUrl || businessData?.shopImage || null);
  }, [businessData]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userData?.businessId) return;
    setImageUploading(true);
    try {
      const url = await uploadFile(`businesses/${userData.businessId}/shop_photo`, file);
      await setDocument('businesses', userData.businessId, { shopImageUrl: url });
      setShopImageUrl(url);
    } catch (err) {
      console.error('[BusinessProfile] Image upload failed:', err);
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  // Edit form state (only used by owner)
  const [form, setForm] = useState({ 
    fullName: '', 
    phone: '', 
    whatsappNumber: '',
    location: '',
    businessName: '',
    latitude: null,
    longitude: null
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Fetch the owner user doc from the `users` collection
  useEffect(() => {
    async function fetchOwner() {
      if (!userData?.businessId) return;
      try {
        const members = await getBusinessUsers(userData.businessId);
        const owner = members.find((m) => m.role === 'owner');
        if (owner) {
          setOwnerData(owner);
          setForm({
            fullName: owner.fullName || owner.name || '',
            phone: owner.phone || '',
            whatsappNumber: owner.whatsappNumber || '',
            location: businessData?.location || '',
            businessName: businessData?.businessName || '',
            latitude: businessData?.latitude || null,
            longitude: businessData?.longitude || null,
          });
        }
      } catch (err) {
        console.error('[BusinessProfile] Failed to fetch owner:', err);
      } finally {
        setLoadingOwner(false);
      }
    }
    fetchOwner();
  }, [userData?.businessId, businessData?.location, businessData?.latitude, businessData?.longitude]);

  const handleCopy = () => {
    if (userData?.businessId) {
      navigator.clipboard.writeText(userData.businessId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── Location Detection ───
  async function handleDetectLocation() {
    setLocationError('');
    setDetectingLocation(true);
    try {
      const coords = await getCurrentLocation();
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      setForm((prev) => ({
        ...prev,
        location: address,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    } catch (err) {
      console.error('[BusinessProfile] Location detection failed:', err);
      setLocationError(err.message || 'Failed to detect location. Please enter manually.');
    } finally {
      setDetectingLocation(false);
    }
  }

  const handleSave = async () => {
    if (!ownerData?.id || !userData?.businessId) return;
    setSaving(true);
    try {
      await updateUserProfile(ownerData.id, {
        fullName: form.fullName,
        phone: form.phone,
        whatsappNumber: form.whatsappNumber,
      });

      await setDocument('businesses', userData.businessId, {
        businessName: form.businessName,
        location: form.location,
        latitude: form.latitude,
        longitude: form.longitude,
      });
      setOwnerData((prev) => ({ ...prev, ...form }));
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('[BusinessProfile] Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!businessData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  // ── Reusable Field Components ──────────────────────────────────────────────

  function ReadOnlyField({ label, value }) {
    return (
      <div>
        <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-1">{t(label)}</h3>
        <p className="text-base font-semibold text-surface-900">{value || '-'}</p>
      </div>
    );
  }

  function EditableField({ label, fieldKey, type = 'text' }) {
    return (
      <div>
        <label className="block text-sm font-bold text-surface-500 uppercase tracking-wider mb-1">
          {t(label)}
        </label>
        <input
          type={type}
          value={form[fieldKey]}
          onChange={(e) => setForm((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
          className="w-full rounded-lg border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm font-medium text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
        />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6 anime-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-surface-900">{t('Business Profile')}</h1>
          <p className="text-surface-500 text-sm mt-0.5">{t('View and manage your business information.')}</p>
        </div>
        <div className="flex items-center gap-3">
          {isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-100 text-surface-700 text-sm font-bold hover:bg-surface-200 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {t('Edit Profile')}
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (ownerData) {
                    setForm({
                      fullName: ownerData.fullName || ownerData.name || '',
                      phone: ownerData.phone || '',
                      whatsappNumber: ownerData.whatsappNumber || '',
                      location: businessData?.location || '',
                      businessName: businessData?.businessName || '',
                      latitude: businessData?.latitude || null,
                      longitude: businessData?.longitude || null,
                    });
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-surface-100 text-surface-600 text-sm font-bold hover:bg-surface-200 transition-all"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 disabled:opacity-60 transition-all"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    {t('Saving...')}
                  </>
                ) : saved ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('Saved!')}
                  </>
                ) : (
                  t('Save Changes')
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-surface-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">

          {/* ── Row 1: Business Name + Business ID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isEditing ? (
              <EditableField label="Business Name" fieldKey="businessName" />
            ) : (
              <ReadOnlyField label="Business Name" value={businessData.businessName} />
            )}

            {/* Business ID with copy */}
            <div>
              <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-1">{t('Business ID')}</h3>
              <p className="text-xs text-surface-400 mb-2">{t('Share this ID with staff so they can request to join.')}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-surface-100 px-4 py-2.5 text-sm font-mono text-surface-700 select-all border border-surface-200 truncate">
                  {userData?.businessId || '-'}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-50 text-primary-700 font-bold text-sm hover:bg-primary-100 transition-colors w-24 flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {t('Copied!')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {t('Copy')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-surface-100" />

          {/* ── Row 2: Location ── */}
          <div>
            <h2 className="text-base font-black text-surface-700 uppercase tracking-wider mb-4">{t('Business Location')}</h2>
            {isEditing ? (
              <div className="max-w-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="location" className="block text-sm font-bold text-surface-500 uppercase tracking-wider">
                    {t('Location')}
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    {detectingLocation ? (
                      <>
                        <span className="h-3 w-3 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
                        {t('Detecting...')}
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t('Detect Location')}
                      </>
                    )}
                  </button>
                </div>
                <input
                  id="location"
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder={t('Enter shop address or area')}
                  className="w-full rounded-lg border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm font-medium text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                />
                {locationError && <p className="mt-1.5 text-xs text-red-500 font-medium">{locationError}</p>}
              </div>
            ) : (
              <ReadOnlyField label="Location" value={businessData.location} />
            )}
          </div>

          <div className="border-t border-surface-100" />

          {/* ── Row 3: Owner Contact Info ── */}
          <div>
            <h2 className="text-base font-black text-surface-700 uppercase tracking-wider mb-4">{t('Owner Contact')}</h2>

            {loadingOwner ? (
              <div className="flex items-center gap-3 text-surface-400 text-sm">
                <span className="h-4 w-4 rounded-full border-2 border-surface-300 border-t-primary-500 animate-spin" />
                {t('Loading owner details...')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isEditing ? (
                  <>
                    <EditableField label="Owner Name" fieldKey="fullName" />
                    <EditableField label="Phone Number" fieldKey="phone" type="tel" />
                    <EditableField label="WhatsApp Number" fieldKey="whatsappNumber" type="tel" />
                  </>
                ) : (
                  <>
                    <ReadOnlyField label="Owner Name" value={ownerData?.fullName || ownerData?.name} />
                    <ReadOnlyField label="Phone Number" value={ownerData?.phone} />
                    <ReadOnlyField label="WhatsApp Number" value={ownerData?.whatsappNumber} />
                  </>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-surface-100" />

          {/* ── Row 4: Shop Image ── */}
          <div>
            <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-3">{t('Shop Image')}</h3>

            {/* Hidden file input */}
            {isEditing && (
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            )}

            {shopImageUrl ? (
              <div
                className={`relative aspect-video max-w-sm rounded-xl overflow-hidden border border-surface-200 bg-surface-50 ${isEditing ? 'cursor-pointer group' : ''}`}
                onClick={() => isEditing && imageInputRef.current?.click()}
              >
                <img
                  src={shopImageUrl}
                  alt={businessData.businessName || 'Shop'}
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {imageUploading ? (
                      <span className="h-7 w-7 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    ) : (
                      <>
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-sm font-bold">{t('Change Image')}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`aspect-video max-w-sm rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 flex flex-col items-center justify-center text-surface-400 ${isEditing ? 'cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors' : ''}`}
                onClick={() => isEditing && imageInputRef.current?.click()}
              >
                {imageUploading ? (
                  <span className="h-8 w-8 rounded-full border-[3px] border-surface-200 border-t-primary-500 animate-spin" />
                ) : (
                  <>
                    <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="text-sm font-medium">{isEditing ? t('Click to upload image') : t('No image uploaded')}</span>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
