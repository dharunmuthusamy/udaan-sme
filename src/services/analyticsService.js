import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Helper to parse numeric values from strings (handles currency symbols, commas, etc.)
const parseSafeNumber = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Helper to parse DD/MM/YYYY or standard date strings
const parseSafeDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr !== 'string') return new Date(dateStr);

  // Handle DD/MM/YYYY format explicitly
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
};

export const analyticsService = {
  getDashboardMetrics: async (businessId, filters = {}) => {
    try {
      console.log('[analyticsService] START FETCH FOR BIZ:', businessId);
      
      // DIAGNOSTIC SCAN: See if ANY data exists in the db
      try {
        const scanQuery = query(collection(db, 'products'), limit(3));
        const scanSnap = await getDocs(scanQuery);
        console.log('[analyticsService] DB SCAN - Total products in DB (any biz):', scanSnap.size);
        scanSnap.forEach(d => console.log('[analyticsService] DB SCAN - Found product with bizId:', d.data().businessId));
      } catch (e) {
        console.warn('[analyticsService] DB SCAN failed:', e);
      }

      const { startDate, endDate, productId, vendorId } = filters;

      // Helper to check date range
      const isInDateRange = (dateStr) => {
        if (!dateStr) return true;
        const date = parseSafeDate(dateStr);
        if (startDate && date < new Date(startDate)) return false;
        if (endDate && date > new Date(endDate)) return false;
        return true;
      };

      // 1. Fetch Invoices
      const invoicesQuery = query(collection(db, 'invoices'), where('businessId', '==', businessId));
      const invoicesSnapshot = await getDocs(invoicesQuery);
      console.log('[analyticsService] Resolved invoices:', invoicesSnapshot.size);
      
      let totalSales = 0;
      const salesByMonth = {}; 
      const productSales = {}; 

      invoicesSnapshot.forEach(doc => {
        const invoice = doc.data();
        if (!isInDateRange(invoice.date)) return;

        let invoiceTotal = parseSafeNumber(invoice.totalAmount);
        let filteredProducts = invoice.products || [];

        if (productId) {
          filteredProducts = filteredProducts.filter(p => p.id === productId || p.productId === productId);
          if (filteredProducts.length === 0) return;
          invoiceTotal = filteredProducts.reduce((sum, p) => {
            const price = parseSafeNumber(p.unitPrice || p.price);
            return sum + (price * parseSafeNumber(p.quantity));
          }, 0);
        }

        totalSales += invoiceTotal;

        if (invoice.date) {
          const date = parseSafeDate(invoice.date);
          const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + invoiceTotal;
        }

        filteredProducts.forEach(p => {
          if (p.name) {
            productSales[p.name] = (productSales[p.name] || 0) + parseSafeNumber(p.quantity);
          }
        });
      });

      // 2. Fetch Purchases
      const purchasesQuery = query(collection(db, 'purchases'), where('businessId', '==', businessId));
      const purchasesSnapshot = await getDocs(purchasesQuery);
      console.log('[analyticsService] Resolved purchases:', purchasesSnapshot.size);
      
      let totalPurchases = 0;
      const vendorPurchases = {};

      purchasesSnapshot.forEach(doc => {
        const purchase = doc.data();
        if (!isInDateRange(purchase.date)) return;
        if (vendorId && purchase.vendorId !== vendorId) return;

        const price = parseSafeNumber(purchase.price || purchase.cost || purchase.unitPrice);
        const qty = parseSafeNumber(purchase.quantity);
        const amount = parseSafeNumber(purchase.totalAmount) || (price * qty);
        
        totalPurchases += amount;
        
        if (purchase.vendorName) {
          vendorPurchases[purchase.vendorName] = (vendorPurchases[purchase.vendorName] || 0) + amount;
        }
      });

      // 3. Products
      const productsQuery = query(collection(db, 'products'), where('businessId', '==', businessId));
      const productsSnapshot = await getDocs(productsQuery);
      console.log('[analyticsService] Resolved products for this biz:', productsSnapshot.size);
      
      let totalProducts = 0;
      let lowStockProducts = 0;
      const stockLevels = { inStock: 0, lowStock: 0, outOfStock: 0 };
      const LOW_STOCK_THRESHOLD = 10;
      const productCategoryMap = {}; 
      const productNameToCategory = {};

      productsSnapshot.forEach(doc => {
        const product = doc.data();
        totalProducts++;
        const category = product.category || 'Uncategorized';
        productCategoryMap[doc.id] = category;
        productNameToCategory[product.name] = category;
        
        const stock = parseSafeNumber(product.stockQuantity);
        if (stock <= 0) stockLevels.outOfStock++;
        else if (stock <= LOW_STOCK_THRESHOLD) stockLevels.lowStock++;
        else stockLevels.inStock++;

        if (stock <= LOW_STOCK_THRESHOLD) lowStockProducts++;
      });

      // 4. Customers
      const customersQuery = query(collection(db, 'customers'), where('businessId', '==', businessId));
      const customersSnapshot = await getDocs(customersQuery);
      const totalCustomers = customersSnapshot.size;

      // 5. Post-Processing
      const expensesByMonth = {};
      purchasesSnapshot.forEach(doc => {
        const purchase = doc.data();
        if (!isInDateRange(purchase.date)) return;
        const date = parseSafeDate(purchase.date);
        const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        const price = parseSafeNumber(purchase.price || purchase.cost || purchase.unitPrice);
        const amount = parseSafeNumber(purchase.totalAmount) || (price * parseSafeNumber(purchase.quantity));
        expensesByMonth[monthKey] = (expensesByMonth[monthKey] || 0) + amount;
      });

      const allMonths = Array.from(new Set([...Object.keys(salesByMonth), ...Object.keys(expensesByMonth)]))
        .sort((a, b) => new Date(`01 ${a}`) - new Date(`01 ${b}`));
      
      const revenueVsExpenses = allMonths.map(month => ({
        month,
        revenue: salesByMonth[month] || 0,
        expenses: expensesByMonth[month] || 0
      }));

      const salesByCategoryMap = {};
      invoicesSnapshot.forEach(doc => {
        const invoice = doc.data();
        if (!isInDateRange(invoice.date)) return;
        (invoice.products || []).forEach(p => {
          let category = 'Other';
          const pid = p.productId || p.id;
          if (pid && productCategoryMap[pid]) category = productCategoryMap[pid];
          else if (p.name && productNameToCategory[p.name]) category = productNameToCategory[p.name];
          
          const amount = (parseSafeNumber(p.unitPrice || p.price) * parseSafeNumber(p.quantity));
          if (amount > 0) salesByCategoryMap[category] = (salesByCategoryMap[category] || 0) + amount;
        });
      });

      const salesByCategory = Object.entries(salesByCategoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const monthlySalesData = Object.entries(salesByMonth)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => new Date(`01 ${a.name}`) - new Date(`01 ${b.name}`));
      
      const topProductsData = Object.entries(productSales)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const vendorDistData = Object.entries(vendorPurchases)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const inventoryStatusData = [
        { name: 'In Stock', value: stockLevels.inStock, color: '#10b981' },
        { name: 'Low Stock', value: stockLevels.lowStock, color: '#f59e0b' },
        { name: 'Out of Stock', value: stockLevels.outOfStock, color: '#ef4444' }
      ];

      return {
        metrics: {
          totalSales,
          totalPurchases,
          totalCustomers,
          lowStockProducts,
          netProfit: totalSales - totalPurchases,
          totalProducts
        },
        charts: {
          salesTrend: monthlySalesData,
          topProducts: topProductsData,
          purchaseDist: vendorDistData,
          inventoryStatus: inventoryStatusData,
          revenueVsExpenses,
          salesByCategory
        }
      };

    } catch (error) {
      console.error('[analyticsService] Error fetching dashboard data:', error);
      throw error;
    }
  }
};
