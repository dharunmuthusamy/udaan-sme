import { useState, useRef, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { vendorService } from '../../services/vendorService';
import { customerService } from '../../services/customerService';
import { productService } from '../../services/productService';

export default function SearchableDropdown({ 
  type, 
  label, 
  value, 
  onChange, 
  onAddSuccess,
  options, 
  businessId, 
  placeholder = "Select...",
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [modalError, setModalError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => {
    const search = searchQuery.toLowerCase();
    if (type === 'customer' || type === 'staff') {
      return opt.name?.toLowerCase().includes(search) || opt.phone?.includes(search);
    }
    return opt.name?.toLowerCase().includes(search);
  });

  const selectedOption = options.find(opt => opt.id === value);

  const validateField = (name, val) => {
    const errors = { ...validationErrors };
    if (!val || !val.toString().trim()) {
      errors[name] = true;
    } else {
      delete errors[name];
    }
    setValidationErrors(errors);
  };

  const isModalValid = (() => {
    if (type === 'vendor') return modalData.name?.trim() && modalData.phone?.trim() && modalData.address?.trim();
    if (type === 'customer') return modalData.name?.trim() && modalData.phone?.trim() && modalData.address?.trim();
    if (type === 'product') return modalData.name?.trim() && modalData.price && modalData.stockQuantity;
    return false;
  })();

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!isModalValid) return;

    setSubmitting(true);
    setModalError('');
    try {
      // Uniqueness validation
      if (type === 'vendor' || type === 'customer') {
        const colName = type === 'vendor' ? 'vendors' : 'customers';
        const colRef = collection(db, colName);
        
        const nameQuery = query(colRef, where('businessId', '==', businessId), where('name', '==', modalData.name.trim()));
        const phoneQuery = query(colRef, where('businessId', '==', businessId), where('phone', '==', modalData.phone.trim()));
        
        const [nameSnap, phoneSnap] = await Promise.all([getDocs(nameQuery), getDocs(phoneQuery)]);
        
        if (!nameSnap.empty) {
          setSubmitting(false);
          return setModalError(`${type.charAt(0).toUpperCase() + type.slice(1)} with this name already exists.`);
        }
        if (!phoneSnap.empty) {
          setSubmitting(false);
          return setModalError(`${type.charAt(0).toUpperCase() + type.slice(1)} with this phone number already exists.`);
        }
      }

      let newItem;
      if (type === 'vendor') {
        newItem = await vendorService.create(businessId, modalData);
      } else if (type === 'customer') {
        newItem = await customerService.create(businessId, modalData);
      } else if (type === 'product') {
        newItem = await productService.create(businessId, {
          ...modalData,
          price: Number(modalData.price),
          stockQuantity: Number(modalData.stockQuantity)
        });
      }
      
      const id = newItem.id || newItem._id;
      if (onAddSuccess) {
        onAddSuccess(newItem);
      }
      onChange(id);
      setShowModal(false);
      setModalData({});
      setValidationErrors({});
      setIsOpen(false);
    } catch (err) {
      console.error(`[QuickAdd] ${type} error:`, err);
      setModalError(`Failed to add ${type}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs font-black uppercase text-surface-400 mb-2 block ml-1">{label}</label>
      <input
        tabIndex={-1}
        autoComplete="off"
        style={{ opacity: 0, height: 0, width: '100%', position: 'absolute', bottom: 0, pointerEvents: 'none' }}
        value={value || ''}
        required={required}
        onChange={() => {}}
        onFocus={() => setIsOpen(true)}
      />
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-2xl border bg-surface-50 p-4 font-bold cursor-pointer flex justify-between items-center transition-all ${
          isOpen ? 'border-primary-500 ring-2 ring-primary-500/10' : 'border-surface-200 hover:border-surface-300'
        }`}
      >
        <span className={selectedOption ? 'text-surface-900' : 'text-surface-400 font-medium'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[60] mt-2 w-full bg-white rounded-2xl border border-surface-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-surface-100">
            <input
              type="text"
              className="w-full bg-surface-50 border-none rounded-xl px-4 py-2.5 font-bold text-sm focus:ring-2 focus:ring-primary-500"
              placeholder={`Search ${type}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {type !== 'staff' && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                  setIsOpen(false);
                }}
                className="px-4 py-3 text-sm font-black text-primary-600 cursor-pointer hover:bg-primary-50 border-b border-surface-50 flex items-center gap-2"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary-100 text-[10px]">+</span>
                Add New {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-xs font-bold text-surface-400 text-center">
                No results found.
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors hover:bg-primary-50 hover:text-primary-600 ${
                    value === opt.id ? 'bg-primary-50 text-primary-600' : 'text-surface-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{opt.name}</span>
                    {type === 'product' && <span className="text-[10px] bg-surface-100 px-2 py-0.5 rounded-full">Stock: {opt.stockQuantity}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-surface-100 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-surface-50">
              <h3 className="text-2xl font-black text-surface-900 tracking-tight">Add New {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            </div>
            <div className="p-8 space-y-5">
              {type === 'vendor' && (
                <>
                  <input
                    required
                    className={`w-full rounded-2xl border bg-surface-50 p-4 font-bold transition-all ${validationErrors.name ? 'border-red-500 bg-red-50/50' : 'border-surface-200 focus:border-primary-500'}`}
                    placeholder="Vendor Name *"
                    value={modalData.name || ''}
                    onChange={e => {
                      setModalData({...modalData, name: e.target.value});
                      validateField('name', e.target.value);
                    }}
                  />
                  <input
                    required
                    className={`w-full rounded-2xl border bg-surface-50 p-4 font-bold transition-all ${validationErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-surface-200 focus:border-primary-500'}`}
                    placeholder="Phone *"
                    value={modalData.phone || ''}
                    onChange={e => {
                      setModalData({...modalData, phone: e.target.value});
                      validateField('phone', e.target.value);
                    }}
                  />
                  <input
                    required
                    className={`w-full rounded-2xl border bg-surface-50 p-4 font-bold transition-all ${validationErrors.address ? 'border-red-500 bg-red-50/50' : 'border-surface-200 focus:border-primary-500'}`}
                    placeholder="Address *"
                    value={modalData.address || ''}
                    onChange={e => {
                      setModalData({...modalData, address: e.target.value});
                      validateField('address', e.target.value);
                    }}
                  />
                </>
              )}
              {type === 'customer' && (
                <>
                  <input
                    required
                    className={`w-full rounded-2xl border bg-surface-50 p-4 font-bold transition-all ${validationErrors.name ? 'border-red-500 bg-red-50/50' : 'border-surface-200 focus:border-primary-500'}`}
                    placeholder="Customer Name *"
                    value={modalData.name || ''}
                    onChange={e => {
                      setModalData({...modalData, name: e.target.value});
                      validateField('name', e.target.value);
                    }}
                  />
                  <input
                    required
                    className={`w-full rounded-2xl border bg-surface-50 p-4 font-bold transition-all ${validationErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-surface-200 focus:border-primary-500'}`}
                    placeholder="Phone *"
                    value={modalData.phone || ''}
                    onChange={e => {
                      setModalData({...modalData, phone: e.target.value});
                      validateField('phone', e.target.value);
                    }}
                  />
                  <input
                    required
                    className={`w-full rounded-2xl border bg-surface-50 p-4 font-bold transition-all ${validationErrors.address ? 'border-red-500 bg-red-50/50' : 'border-surface-200 focus:border-primary-500'}`}
                    placeholder="Address *"
                    value={modalData.address || ''}
                    onChange={e => {
                      setModalData({...modalData, address: e.target.value});
                      validateField('address', e.target.value);
                    }}
                  />
                </>
              )}
              {type === 'product' && (
                <>
                  <input
                    required
                    className={`w-full rounded-2xl border bg-surface-50 p-4 font-bold transition-all ${validationErrors.name ? 'border-red-500 bg-red-50/50' : 'border-surface-200 focus:border-primary-500'}`}
                    placeholder="Product Name *"
                    value={modalData.name || ''}
                    onChange={e => {
                      setModalData({...modalData, name: e.target.value});
                      validateField('name', e.target.value);
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      required
                      type="number"
                      className={`w-full rounded-2xl border bg-surface-50 p-4 font-bold transition-all ${validationErrors.price ? 'border-red-500 bg-red-50/50' : 'border-surface-200 focus:border-primary-500'}`}
                      placeholder="Price *"
                      value={modalData.price || ''}
                      onChange={e => {
                        setModalData({...modalData, price: e.target.value});
                        validateField('price', e.target.value);
                      }}
                    />
                    <input
                      required
                      type="number"
                      className={`w-full rounded-2xl border bg-surface-50 p-4 font-bold transition-all ${validationErrors.stockQuantity ? 'border-red-500 bg-red-50/50' : 'border-surface-200 focus:border-primary-500'}`}
                      placeholder="Stock Qty *"
                      value={modalData.stockQuantity || ''}
                      onChange={e => {
                        setModalData({...modalData, stockQuantity: e.target.value});
                        validateField('stockQuantity', e.target.value);
                      }}
                    />
                  </div>
                </>
              )}
              
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-black uppercase text-center animate-shake">
                  {modalError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setModalError('');
                    setModalData({});
                    setValidationErrors({});
                  }}
                  className="flex-1 rounded-2xl border border-surface-200 py-4 font-bold text-surface-600 hover:bg-surface-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={submitting || !isModalValid}
                  className="flex-1 rounded-2xl bg-primary-600 py-4 font-black text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 disabled:opacity-50 transition-all disabled:translate-y-0"
                >
                  {submitting ? 'Adding...' : 'Add & Select'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
