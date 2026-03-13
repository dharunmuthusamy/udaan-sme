import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { invoiceService } from '../../services/invoiceService';
import BackButton from '../../components/Common/BackButton';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const invoiceRef = useRef();

  useEffect(() => {
    if (invoiceId) loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const data = await invoiceService.getById(invoiceId);
      setInvoice(data);
    } catch (err) {
      console.error('[InvoiceDetail] error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    setUpdating(true);
    try {
      await invoiceService.updateStatus(invoiceId, 'Paid');
      await loadInvoice();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const downloadPDF = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      console.log('[InvoiceDetail] Attempting high-fidelity canvas PDF generation...');
      const element = invoiceRef.current;
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoice.id.slice(-6).toUpperCase()}.pdf`);
    } catch (err) {
      console.error('[PDF High-Fidelity Error]:', err);
      console.log('[InvoiceDetail] Falling back to direct text-only PDF generation...');
      
      try {
        // Text-only fallback (extremely reliable)
        const pdf = new jsPDF();
        pdf.setFontSize(22);
        pdf.text('INVOICE', 105, 20, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text(`Business: ${businessData?.businessName || 'UDAAN-SME'}`, 20, 40);
        pdf.text(`Invoice ID: ${invoice.id.toUpperCase()}`, 20, 45);
        pdf.text(`Date: ${invoice.invoiceDate}`, 20, 50);
        pdf.text(`Customer: ${invoice.customerName}`, 20, 60);
        
        pdf.text('Items:', 20, 80);
        let y = 90;
        invoice.products.forEach(p => {
          pdf.text(`${p.name} (x${p.quantity})`, 20, y);
          pdf.text(`INR ${p.subtotal.toLocaleString()}`, 160, y);
          y += 10;
        });
        
        pdf.line(20, y, 190, y);
        y += 10;
        pdf.setFontSize(10);
        
        if (invoice.isInterState) {
          pdf.text(`IGST (${invoice.igst}%): INR ${(invoice.taxAmount || 0).toLocaleString()}`, 160, y, { align: 'right' });
          y += 10;
        } else {
          pdf.text(`CGST (${invoice.cgst}%): INR ${((invoice.taxAmount || 0) / 2).toLocaleString()}`, 160, y, { align: 'right' });
          y += 5;
          pdf.text(`SGST (${invoice.sgst}%): INR ${((invoice.taxAmount || 0) / 2).toLocaleString()}`, 160, y, { align: 'right' });
          y += 10;
        }

        pdf.setFontSize(14);
        pdf.text(`TOTAL: INR ${invoice.totalAmount.toLocaleString()}`, 160, y, { align: 'right' });
        
        pdf.save(`Invoice-${invoice.id.slice(-6).toUpperCase()}-Simple.pdf`);
        alert('Standard PDF generation failed, so I generated a simplified text-only version for you. You can also use the "Print" button for the full design!');
      } catch (fallbackErr) {
        console.error('[Total PDF Failure]:', fallbackErr);
        alert('Unable to generate PDF in this browser. Please use the "Print" button and select "Save as PDF" in the print dialog—this is 100% reliable.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-12 text-center animate-pulse">{t('Loading...')}</div>;
  if (!invoice) return <div className="p-12 text-center">{t('Invoice not found.')}</div>;

  const subtotal = invoice.products.reduce((sum, p) => sum + p.subtotal, 0);

  return (
    <div className="max-w-5xl mx-auto anime-fade-in pb-20">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #invoice-document, #invoice-document * { visibility: visible; }
          #invoice-document { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 no-print">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Invoice Details')}</h1>
            <p className="text-surface-500 font-bold font-mono uppercase text-xs">#{invoice.id.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {invoice.status !== 'Paid' && (
            <button
              onClick={markAsPaid}
              disabled={updating}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {t('Mark as Paid')}
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-6 py-3 rounded-xl bg-surface-100 text-surface-700 text-sm font-bold shadow-sm hover:bg-surface-200 transition-all flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>

          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="px-6 py-3 rounded-xl bg-primary-600 text-white text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {downloading ? t('Generating...') : t('Download PDF')}
          </button>
        </div>
      </div>

      {/* Invoice Document Wrapper */}
      <div id="invoice-document" className="bg-white rounded-[2rem] border border-surface-200 shadow-xl overflow-hidden p-12 max-w-[800px] mx-auto" ref={invoiceRef}>
        <div className="flex justify-between items-start mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">U</div>
              <span className="text-2xl font-black text-surface-900 tracking-tighter uppercase">{businessData?.businessName || 'UDAAN-SME'}</span>
            </div>
            <div className="text-sm text-surface-500 space-y-1 font-medium">
              <p>Business Owner: {businessData?.ownerName || 'Admin'}</p>
              <p>Email: {businessData?.supportEmail || 'support@udaansme.com'}</p>
              {invoice.gstNumber && <p className="text-surface-900 font-bold mt-2">GSTIN: {invoice.gstNumber}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-surface-900 mb-2">INVOICE</h2>
            <p className="text-surface-400 font-mono font-bold text-sm">INV-{invoice.id.slice(-6).toUpperCase()}</p>
            <div className={`mt-4 inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
              invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {invoice.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-16 pb-12 border-b border-surface-100">
          <div>
            <h3 className="text-[10px] font-black uppercase text-surface-400 mb-4 tracking-widest">Bill To:</h3>
            <p className="text-xl font-black text-surface-900 mb-1">{invoice.customerName}</p>
            <p className="text-sm text-surface-500">Customer ID: {invoice.customerId}</p>
          </div>
          <div className="text-right">
            <h3 className="text-[10px] font-black uppercase text-surface-400 mb-4 tracking-widest">Date Issued:</h3>
            <p className="text-xl font-bold text-surface-900">{invoice.invoiceDate}</p>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-surface-900 text-[10px] font-black uppercase text-surface-400 text-left">
              <th className="py-4">Item Description</th>
              <th className="py-4 text-center w-24">Qty</th>
              <th className="py-4 text-right w-32">Price</th>
              <th className="py-4 text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {invoice.products.map((p, i) => (
              <tr key={i} className="text-sm border-b border-surface-50">
                <td className="py-6 font-bold text-surface-900">{p.name}</td>
                <td className="py-6 text-center font-medium text-surface-500">{p.quantity}</td>
                <td className="py-6 text-right font-medium text-surface-500">₹{p.unitPrice.toLocaleString()}</td>
                <td className="py-6 text-right font-black text-surface-900">₹{p.subtotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-4">
            <div className="flex justify-between text-sm font-bold text-surface-500">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            {invoice.isInterState ? (
              <div className="flex justify-between text-sm font-bold text-surface-500">
                <span>IGST ({invoice.igst || 0}%)</span>
                <span>₹{(invoice.taxAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm font-bold text-surface-500">
                  <span>CGST ({invoice.cgst || 0}%)</span>
                  <span>₹{((invoice.taxAmount || 0) / 2).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-surface-500">
                  <span>SGST ({invoice.sgst || 0}%)</span>
                  <span>₹{((invoice.taxAmount || 0) / 2).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </>
            )}
            <div className="pt-4 border-t border-surface-900 flex justify-between text-2xl font-black text-surface-900 font-mono">
              <span>TOTAL</span>
              <span className="text-primary-600">₹{invoice.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-surface-100 text-center">
          <p className="text-xs text-surface-300 font-bold uppercase tracking-[0.2em]">Thank you for your business!</p>
          <p className="text-[10px] text-surface-200 mt-2">Generated via UDAAN-SME Digital Suite</p>
        </div>
      </div>
    </div>
  );
}
