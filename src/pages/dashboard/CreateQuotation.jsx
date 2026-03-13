import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { customerService } from '../../services/customerService';
import { productService } from '../../services/productService';
import { quotationService } from '../../services/quotationService';
import SearchableDropdown from '../../components/Common/SearchableDropdown';
import ProductRow from '../../components/Dashboard/ProductRow';

export default function CreateQuotation() {
  const { businessData, user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem('create_quotation_form');
    return saved ? JSON.parse(saved) : {
      customerId: '',
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      taxRate: 0,
      status: 'Draft',
      rows: [{ productId: '', name: '', quantity: 1, unitPrice: 0, subtotal: 0 }]
    };
  });

  // Persist form changes
  useEffect(() => {
    sessionStorage.setItem('create_quotation_form', JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (businessData?.id) {
      loadMasterData();
    }
  }, [businessData]);

  // Handle auto-selection after redirect
  useEffect(() => {
    if (!loading && products.length > 0 && customers.length > 0) {
      const queryParams = new URLSearchParams(location.search);
      const newCustId = queryParams.get('newCustomerId');
      const newProdId = queryParams.get('newProductId');
      const rowIndex = queryParams.get('rowIndex');

      if (newCustId) {
        const customer = customers.find(c => c.id === newCustId);
        if (customer) {
          setForm(prev => ({
            ...prev,
            customerId: newCustId,
            customerName: customer.name
          }));
        }
      }

      if (newProdId && rowIndex !== null) {
        const product = products.find(p => p.id === newProdId);
        if (product) {
          handleRowUpdate(parseInt(rowIndex), 'productId', newProdId);
        }
      }
    }
  }, [loading, products, customers, location.search]);

  async function loadMasterData() {
    try {
      const [custs, prods] = await Promise.all([
        customerService.getAll(businessData.id),
        productService.getAll(businessData.id)
      ]);
      setCustomers(custs);
      setProducts(prods);
    } catch (err) {
      console.error('[CreateQuotation] Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRowUpdate = (index, field, value) => {
    const newRows = [...form.rows];
    newRows[index][field] = value;

    if (field === 'productId') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        newRows[index].name = selectedProduct.name;
        newRows[index].unitPrice = selectedProduct.price;
      } else {
        newRows[index].name = '';
        newRows[index].unitPrice = 0;
      }
    }

    newRows[index].subtotal = newRows[index].quantity * newRows[index].unitPrice;
    setForm({ ...form, rows: newRows });
  };

  const addRow = () => {
    setForm({
      ...form,
      rows: [...form.rows, { productId: '', name: '', quantity: 1, unitPrice: 0, subtotal: 0 }]
    });
  };

  const removeRow = (index) => {
    if (form.rows.length > 1) {
      const newRows = form.rows.filter((_, i) => i !== index);
      setForm({ ...form, rows: newRows });
    }
  };

  const subtotal = form.rows.reduce((sum, row) => sum + row.subtotal, 0);
  const taxAmount = (subtotal * form.taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId) return setError('Please select a customer.');
    if (form.rows.some(r => !r.productId)) return setError('Please select products for all rows.');
    
    setSaving(true);
    setError('');

    try {
      const customer = customers.find(c => c.id === form.customerId);
      const quotationData = {
        customerId: form.customerId,
        customerName: customer?.name || 'Unknown',
        date: form.date,
        products: form.rows,
        tax: form.taxRate,
        totalAmount,
        status: form.status,
        createdBy: user.uid
      };

      await quotationService.create(businessData.id, quotationData);
      sessionStorage.removeItem('create_quotation_form');
      navigate('/dashboard/sales/quotations');
    } catch (err) {
      console.error('[CreateQuotation] Save error:', err);
      setError(err.message || 'Failed to save quotation.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Loading quotation suite...</div>;

  return (
    <div className="max-w-5xl mx-auto anime-fade-in pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/sales/quotations" className="p-2 lg:p-3 rounded-2xl bg-white border border-surface-200 text-surface-400 hover:text-primary-600 transition-all shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Create Quotation')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-surface-200 p-8 shadow-sm">
            <h2 className="font-bold text-surface-900 mb-6 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] text-primary-600 uppercase">01</span>
              {t('Quotation Context')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <SearchableDropdown
                  type="customer"
                  label={t('Client')}
                  value={form.customerId}
                  onChange={(custId) => {
                    const customer = customers.find(c => c.id === custId);
                    setForm({
                      ...form,
                      customerId: custId,
                      customerName: customer ? customer.name : ''
                    });
                  }}
                  onAddSuccess={(newItem) => setCustomers(prev => [...prev, newItem])}
                   options={customers}
                  businessId={businessData.id}
                  placeholder={t('Choose a client...')}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Date')}</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-surface-200 p-8 shadow-sm">
            <h2 className="font-bold text-surface-900 mb-6 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] text-primary-600 uppercase">02</span>
              {t('Quoted Items')}
            </h2>
            
            <div className="space-y-4">
              {form.rows.map((row, index) => (
                <ProductRow
                  key={index}
                  index={index}
                  row={row}
                  products={products}
                  onUpdate={handleRowUpdate}
                  onRemove={removeRow}
                  onAddSuccess={(newItem) => setProducts(prev => [...prev, newItem])}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addRow}
              className="mt-6 w-full py-4 border-2 border-dashed border-surface-200 rounded-2xl text-sm font-bold text-surface-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/30 transition-all group"
            >
              <span className="group-hover:scale-110 inline-block mr-2">+</span> {t('Add Line Item')}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-900 rounded-[2rem] p-8 text-white shadow-xl sticky top-24">
            <h2 className="font-bold text-lg mb-6 border-b border-white/10 pb-4">{t('Quotation Summary')}</h2>
            
            <div className="space-y-4 text-sm font-bold">
              <div className="flex justify-between items-center opacity-60">
                <span>{t('Subtotal')}</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="opacity-60">{t('Tax Rate (%)')}</span>
                <input 
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm({...form, taxRate: parseInt(e.target.value) || 0})}
                  className="w-20 bg-white/10 rounded-lg px-2 py-1 text-right outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>
              <div className="flex justify-between items-center opacity-60">
                <span>{t('Tax Amount')}</span>
                <span>₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xl font-black">
                <span>{t('Total')}</span>
                <span className="text-primary-400">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-white/40 mb-2">{t('Initial Status')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Draft', 'Sent'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({...form, status: s})}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        form.status === s ? 'bg-primary-600 border-primary-500 scale-105 shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-xs font-bold animate-shake">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-white text-surface-900 rounded-2xl font-black hover:bg-primary-50 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? t('Creating...') : t('Save Quotation →')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
