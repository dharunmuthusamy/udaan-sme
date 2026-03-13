import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { customerService } from '../../services/customerService';
import { productService } from '../../services/productService';
import { invoiceService } from '../../services/invoiceService';
import { orderService } from '../../services/orderService';
import BackButton from '../../components/Common/BackButton';
import SearchableDropdown from '../../components/Common/SearchableDropdown';
import ProductRow from '../../components/Dashboard/ProductRow';
import { useLocation } from 'react-router-dom';
import UpgradeModal from '../../components/Dashboard/UpgradeModal';
import { incrementCounter } from '../../services/dbService';

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { checkFeatureLimit } = useAuth();

  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem('create_invoice_form');
    // If we have an orderId, we might NOT want to use saved state if it was for a different order
    // But for "Add New Product" return, we definitely want it.
    // Compromise: if saved state exists AND it's from an order, ensure IDs match or ignore if coming from a fresh "Add New".
    return saved ? JSON.parse(saved) : {
      customerId: '',
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      gstNumber: '',
      cgst: 9,
      sgst: 9,
      igst: 18,
      isInterState: false,
      status: 'Pending',
      rows: [{ productId: '', name: '', quantity: 1, unitPrice: 0, subtotal: 0 }]
    };
  });

  // Persist form changes
  useEffect(() => {
    sessionStorage.setItem('create_invoice_form', JSON.stringify(form));
  }, [form]);

  // Handle auto-selection after redirect
  useEffect(() => {
    if (!loading && products.length > 0 && customers.length > 0) {
      const newCustId = queryParams.get('newCustomerId');
      const newProdId = queryParams.get('newProductId');
      const rowIndex = queryParams.get('rowIndex');

      if (newCustId) {
        const customer = customers.find(c => c.id === newCustId);
        if (customer) {
          let isInterState = false;
          if (customer.address && businessData?.location) {
            const custAddr = customer.address.toLowerCase();
            const bizLoc = businessData.location.toLowerCase();
            if (!custAddr.includes(bizLoc)) {
              isInterState = true;
            }
          }
          setForm(prev => ({
            ...prev,
            customerId: newCustId,
            customerName: customer.name,
            isInterState
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
  }, [loading, products, customers]);

  useEffect(() => {
    console.log('[CreateInvoice] Effect triggered', { businessId: businessData?.id, orderId });
    if (businessData?.id) {
      loadMasterData();
    } else {
      console.warn('[CreateInvoice] Business data not ready');
    }
  }, [businessData?.id, orderId]);

  async function loadMasterData() {
    try {
      const [custs, prods] = await Promise.all([
        customerService.getAll(businessData.id),
        productService.getAll(businessData.id)
      ]);
      setCustomers(custs);
      setProducts(prods);
      
      if (orderId) {
        await loadOrder(custs || [], prods || []);
      }
    } catch (err) {
      console.error('[CreateInvoice] Load error:', err);
      setError('Failed to load required data.');
    } finally {
      setLoading(false);
    }
  }

  async function loadOrder(allCustomers, allProducts) {
    try {
      console.log('[CreateInvoice] Fetching order:', orderId, 'for business:', businessData.id);
      const order = await orderService.getById(orderId);
      console.log('[CreateInvoice] Resulting order:', order);
      
      if (order) {
        if (order.businessId !== businessData.id) {
          console.error('[CreateInvoice] Business ID mismatch', { orderBiz: order.businessId, currentBiz: businessData.id });
          setError('Order belongs to a different business.');
          return;
        }

        // Calculate isInterState
        let isInterState = false;
        const customer = allCustomers.find(c => c.id === order.customerId);
        if (customer && customer.address && businessData?.location) {
          const custAddr = customer.address.toLowerCase();
          const bizLoc = businessData.location.toLowerCase();
          if (!custAddr.includes(bizLoc)) {
            isInterState = true;
          }
        }

        const orderProducts = order.products || order.items || [];
        if (orderProducts.length === 0) {
          console.warn('[CreateInvoice] Order has no products');
        }

        setForm(prev => ({
          ...prev,
          customerId: order.customerId || '',
          customerName: order.customerName || '',
          isInterState,
          rows: orderProducts.map(p => ({
            productId: p.productId || p.id || '',
            name: p.name || 'Unknown Product',
            quantity: p.quantity || 1,
            unitPrice: p.unitPrice || 0,
            subtotal: p.subtotal || ((p.quantity || 1) * (p.unitPrice || 0))
          }))
        }));
      } else {
        console.error('[CreateInvoice] Order not found in database');
        setError('Order not found. It may have been deleted.');
      }
    } catch (err) {
      console.error('[CreateInvoice] Order load exception:', err);
      setError(`Error fetching order: ${err.message}`);
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
    
    if (checkFeatureLimit('invoicesPerMonth', businessData?.invoiceCountThisMonth || 0)) {
      setShowUpgradeModal(true);
      return;
    }

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
      
      // Increment counter
      await incrementCounter('businesses', businessData.id, 'invoiceCountThisMonth', 1);
      
      sessionStorage.removeItem('create_invoice_form');
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
        <BackButton />
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">
          {orderId ? 'Convert Order to Invoice' : 'Create New Invoice'}
        </h1>
        {orderId && (
          <span className="ml-4 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-mono font-bold">
            ORD-{orderId.slice(-6).toUpperCase()}
          </span>
        )}
        {error && (
          <span className="ml-4 px-4 py-1.5 bg-red-100 text-red-600 rounded-xl text-xs font-bold animate-shake">
            {error}
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

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        message={t('You have reached the monthly limit of 50 invoices on the Free plan. Upgrade to Premium to create unlimited invoices.')}
      />
    </div>
  );
}
