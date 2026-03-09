import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { customerService } from '../../services/customerService';
import { productService } from '../../services/productService';
import { invoiceService } from '../../services/invoiceService';
import { orderService } from '../../services/orderService';
import ProductRow from '../../components/Dashboard/ProductRow';
import { useLocation } from 'react-router-dom';

export default function CreateInvoice() {
  const { businessData, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    gstNumber: '',
    cgst: 9,
    sgst: 9,
    igst: 18,
    isInterState: false, // true = IGST, false = CGST+SGST
    status: 'Pending',
    rows: [{ productId: '', name: '', quantity: 1, unitPrice: 0, subtotal: 0 }]
  });

  useEffect(() => {
    if (businessData?.id) {
      loadMasterData();
    }
  }, [businessData, orderId]);

  async function loadMasterData() {
    try {
      const [custs, prods] = await Promise.all([
        customerService.getAll(businessData.id),
        productService.getAll(businessData.id)
      ]);
      setCustomers(custs);
      setProducts(prods);
    } catch (err) {
      console.error('[CreateInvoice] Load error:', err);
    } finally {
      setLoading(false);
    }
    
    if (orderId) {
      await loadOrder(custs || [], prods || []);
    }
  }

  async function loadOrder(allCustomers, allProducts) {
    try {
      const order = await orderService.getById(orderId);
      if (order) {
        setForm(prev => ({
          ...prev,
          customerId: order.customerId,
          customerName: order.customerName,
          rows: order.products.map(p => ({
            productId: p.productId,
            name: p.name,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            subtotal: p.subtotal
          }))
        }));
      }
    } catch (err) {
      console.error('[CreateInvoice] Order load error:', err);
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
  
  let taxAmount = 0;
  if (form.isInterState) {
    taxAmount = (subtotal * form.igst) / 100;
  } else {
    taxAmount = (subtotal * (form.cgst + form.sgst)) / 100;
  }
  
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId) return setError('Please select a customer.');
    if (form.rows.some(r => !r.productId)) return setError('Please select products for all rows.');
    
    setSaving(true);
    setError('');

    try {
      const customer = customers.find(c => c.id === form.customerId);
      const invoiceData = {
        customerId: form.customerId,
        customerName: customer?.name || 'Unknown',
        date: form.date,
        products: form.rows,
        gstNumber: form.gstNumber,
        cgst: form.cgst,
        sgst: form.sgst,
        igst: form.igst,
        isInterState: form.isInterState,
        taxAmount,
        totalAmount,
        status: form.status,
        createdBy: user.uid,
        orderId: orderId || null
      };

      await invoiceService.create(businessData.id, invoiceData);
      navigate('/dashboard/sales');
    } catch (err) {
      console.error('[CreateInvoice] Save error:', err);
      setError(err.message || 'Failed to save invoice. Please check stock levels.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Loading creation suite...</div>;

  return (
    <div className="max-w-5xl mx-auto anime-fade-in pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/sales" className="p-2 lg:p-3 rounded-2xl bg-white border border-surface-200 text-surface-400 hover:text-primary-600 transition-all shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Create Invoice')}</h1>
        {orderId && (
          <span className="ml-4 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-mono font-bold">
            ORD-{orderId.slice(-6).toUpperCase()}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-surface-200 p-8 shadow-sm">
            <h2 className="font-bold text-surface-900 mb-6 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] text-primary-600 uppercase">01</span>
              {t('Client & Details')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <SearchableDropdown
                  type="customer"
                  label={t('Select Customer')}
                  value={form.customerId}
                  onChange={(custId) => {
                    const customer = customers.find(c => c.id === custId);
                    let isInterState = false;
                    if (customer && customer.address && businessData?.location) {
                      const custAddr = customer.address.toLowerCase();
                      const bizLoc = businessData.location.toLowerCase();
                      if (!custAddr.includes(bizLoc)) {
                        isInterState = true;
                      }
                    }
                    setForm({ ...form, customerId: custId, isInterState });
                  }}
                  onAddSuccess={(newItem) => setCustomers(prev => [...prev, newItem])}
                  options={customers}
                  businessId={businessData.id}
                  placeholder={t('Choose a client...')}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Business GSTIN (Optional)')}</label>
                <input
                  type="text"
                  value={form.gstNumber}
                  onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
                  className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all uppercase placeholder:normal-case"
                  placeholder="e.g. 29ABCDE1234FZ5"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">{t('Invoice Date')}</label>
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
              {t('Line Items')}
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
            <h2 className="font-bold text-lg mb-6 border-b border-white/10 pb-4">{t('Invoice Summary')}</h2>
            
            <div className="space-y-4 text-sm font-bold">
              <div className="flex justify-between items-center opacity-60">
                <span>{t('Subtotal')}</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="opacity-60">{t('Tax Type')}</span>
                  <div className="flex bg-white/10 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isInterState: false })}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!form.isInterState ? 'bg-primary-500 text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
                    >
                      CGST + SGST
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isInterState: true })}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${form.isInterState ? 'bg-primary-500 text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
                    >
                      IGST (Inter-state)
                    </button>
                  </div>
                </div>

                {!form.isInterState ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-4">
                      <span className="opacity-60">{t('CGST (%)')}</span>
                      <input 
                        type="number"
                        value={form.cgst}
                        onChange={(e) => setForm({...form, cgst: parseFloat(e.target.value) || 0})}
                        className="w-16 bg-white/10 rounded-lg px-2 py-1 text-right outline-none focus:ring-1 focus:ring-primary-400"
                        step="0.01"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="opacity-60">{t('SGST (%)')}</span>
                      <input 
                        type="number"
                        value={form.sgst}
                        onChange={(e) => setForm({...form, sgst: parseFloat(e.target.value) || 0})}
                        className="w-16 bg-white/10 rounded-lg px-2 py-1 text-right outline-none focus:ring-1 focus:ring-primary-400"
                        step="0.01"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center gap-4">
                    <span className="opacity-60">{t('IGST (%)')}</span>
                    <input 
                      type="number"
                      value={form.igst}
                      onChange={(e) => setForm({...form, igst: parseFloat(e.target.value) || 0})}
                      className="w-16 bg-white/10 rounded-lg px-2 py-1 text-right outline-none focus:ring-1 focus:ring-primary-400"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center opacity-60 pt-4 border-t border-white/10">
                <span>{t('Total Tax Amount')}</span>
                <span>₹{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xl font-black">
                <span>{t('Total')}</span>
                <span className="text-primary-400">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-white/40 mb-2">{t('Payment Status')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pending', 'Paid'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({...form, status: s})}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        form.status === s ? 'bg-primary-600 border-primary-500 scale-105 shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {t(s)}
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
                {saving ? t('Generating...') : t('Save & Finalize →')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
