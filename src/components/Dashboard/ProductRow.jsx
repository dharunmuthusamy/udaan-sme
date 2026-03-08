import { useLanguage } from '../../context/LanguageContext';

export default function ProductRow({ row, index, products, onUpdate, onRemove }) {
  const { t } = useLanguage();
  const selectedProduct = products.find(p => p.id === row.productId);

  return (
    <div className="grid grid-cols-12 gap-4 items-end mb-4 group anime-slide-in">
      {/* Product Selection */}
      <div className="col-span-12 md:col-span-5">
        <label className="block text-[10px] font-black uppercase text-surface-400 mb-1 ml-1">{t('Product')}</label>
        <select
          value={row.productId}
          onChange={(e) => onUpdate(index, 'productId', e.target.value)}
          className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer"
        >
          <option value="">{t('Select a product')}</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} - ₹{p.price.toLocaleString()} ({t('Stock')}: {p.stockQuantity})
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="col-span-4 md:col-span-2">
        <label className="block text-[10px] font-black uppercase text-surface-400 mb-1 ml-1">{t('Price')}</label>
        <input
          type="number"
          value={row.unitPrice}
          readOnly
          className="w-full rounded-xl border border-surface-100 bg-surface-100/50 px-4 py-3 text-sm font-bold text-surface-500 outline-none"
        />
      </div>

      {/* Quantity */}
      <div className="col-span-4 md:col-span-2">
        <label className="block text-[10px] font-black uppercase text-surface-400 mb-1 ml-1">{t('Qty')}</label>
        <input
          type="number"
          min="1"
          max={selectedProduct?.stockQuantity || 1}
          value={row.quantity}
          onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
          className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm font-bold text-surface-900 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
        />
      </div>

      {/* Subtotal */}
      <div className="col-span-3 md:col-span-2">
        <label className="block text-[10px] font-black uppercase text-surface-400 mb-1 ml-1 text-right pr-4">{t('Subtotal')}</label>
        <div className="w-full px-4 py-3 text-sm font-black text-surface-900 text-right">
          ₹{(row.unitPrice * row.quantity).toLocaleString()}
        </div>
      </div>

      {/* Remove Button */}
      <div className="col-span-1 flex justify-center mb-1">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
