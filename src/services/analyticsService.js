import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const analyticsService = {
  getDashboardMetrics: async (businessId, filters = {}) => {
    try {
      const { startDate, endDate, productId, vendorId } = filters;

      // Helper to check date range
      const isInDateRange = (dateStr) => {
        if (!dateStr) return true;
        const date = new Date(dateStr);
        if (startDate && date < new Date(startDate)) return false;
        if (endDate && date > new Date(endDate)) return false;
        return true;
      };

      // 1. Fetch Invoices for Revenue, Sales Trend, Top Products
      const invoicesQuery = query(collection(db, 'invoices'), where('businessId', '==', businessId));
      const invoicesSnapshot = await getDocs(invoicesQuery);
      
      let totalSales = 0;
      const salesByMonth = {}; 
      const productSales = {}; 
      const customerSales = {}; 

      invoicesSnapshot.forEach(doc => {
        const invoice = doc.data();
        if (!isInDateRange(invoice.date)) return;

        // Apply Product Filter if provided
        let invoiceTotal = invoice.totalAmount || 0;
        let filteredProducts = invoice.products || [];

        if (productId) {
          filteredProducts = filteredProducts.filter(p => p.id === productId);
          if (filteredProducts.length === 0) return; // Skip invoice if product not present
          invoiceTotal = filteredProducts.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);
        }

        totalSales += invoiceTotal;

        // Group by month
        if (invoice.date) {
          const date = new Date(invoice.date);
          const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + invoiceTotal;
        }

        // Aggregate sales by customer
        if (invoice.customerName) {
          customerSales[invoice.customerName] = (customerSales[invoice.customerName] || 0) + invoiceTotal;
        }

        // Aggregate top products
        filteredProducts.forEach(p => {
          if (p.name) {
            productSales[p.name] = (productSales[p.name] || 0) + (Number(p.quantity) || 0);
          }
        });
      });

      // 2. Fetch Purchases for Purchase Metrics & Vendor Distribution
      const purchasesQuery = query(collection(db, 'purchases'), where('businessId', '==', businessId));
      const purchasesSnapshot = await getDocs(purchasesQuery);
      
      let totalPurchases = 0;
      const vendorPurchases = {};

      purchasesSnapshot.forEach(doc => {
        const purchase = doc.data();
        if (!isInDateRange(purchase.date)) return;
        if (vendorId && purchase.vendorId !== vendorId) return;

        totalPurchases += (purchase.totalAmount || 0);
        
        if (purchase.vendorName) {
          vendorPurchases[purchase.vendorName] = (vendorPurchases[purchase.vendorName] || 0) + (purchase.totalAmount || 0);
        }
      });

      // 3. Products & Low Stock
      const productsQuery = query(collection(db, 'products'), where('businessId', '==', businessId));
      const productsSnapshot = await getDocs(productsQuery);
      
      let totalProducts = 0;
      let lowStockProducts = 0;
      const stockLevels = [];
      const LOW_STOCK_THRESHOLD = 10;

      productsSnapshot.forEach(doc => {
        const product = doc.data();
        totalProducts++;
        if (product.stockQuantity !== undefined && product.stockQuantity < LOW_STOCK_THRESHOLD) {
          lowStockProducts++;
        }
        stockLevels.push({
          name: product.name,
          stock: product.stockQuantity || 0
        });
      });

      // 4. Pending Tasks
      const tasksQuery = query(collection(db, 'tasks'), where('businessId', '==', businessId), where('status', '!=', 'completed'));
      const tasksSnapshot = await getDocs(tasksQuery);
      const pendingTasks = tasksSnapshot.size;

      // Format Chart Data
      const monthlySalesData = Object.entries(salesByMonth).map(([name, sales]) => ({ name, sales }));
      
      const topProductsData = Object.entries(productSales)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const vendorDistData = Object.entries(vendorPurchases)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const inventoryData = stockLevels
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 10);

      const salesByCustomerData = Object.entries(customerSales)
        .map(([name, totalSales]) => ({ name, totalSales }))
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 10);

      return {
        metrics: {
          totalSales,
          totalPurchases,
          netProfit: totalSales - totalPurchases,
          totalProducts,
          lowStockProducts,
          pendingTasks
        },
        charts: {
          salesTrend: monthlySalesData,
          topProducts: topProductsData,
          purchaseDist: vendorDistData,
          inventoryStock: inventoryData,
          salesByCustomer: salesByCustomerData
        }
      };

    } catch (error) {
      console.error('[analyticsService] Error fetching dashboard data:', error);
      throw error;
    }
  }
};
