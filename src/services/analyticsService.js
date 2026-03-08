import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const analyticsService = {
  getDashboardMetrics: async (businessId) => {
    try {
      // 1. Total Sales (sum of completed invoices/orders could be used, we'll sum all invoices for simplicity)
      const invoicesQuery = query(collection(db, 'invoices'), where('businessId', '==', businessId));
      const invoicesSnapshot = await getDocs(invoicesQuery);
      
      let totalSales = 0;
      const salesByMonth = {}; // Prepare for Monthly Sales Chart
      const productSales = {}; // Prepare for Top Products Chart

      invoicesSnapshot.forEach(doc => {
        const invoice = doc.data();
        totalSales += (invoice.totalAmount || 0);

        // Group by month
        if (invoice.date) {
          const date = new Date(invoice.date);
          const monthName = date.toLocaleString('default', { month: 'short' });
          salesByMonth[monthName] = (salesByMonth[monthName] || 0) + (invoice.totalAmount || 0);
        }

        // Aggregate top products
        if (invoice.products && Array.isArray(invoice.products)) {
          invoice.products.forEach(p => {
            if (p.name) {
              productSales[p.name] = (productSales[p.name] || 0) + (Number(p.quantity) || 0);
            }
          });
        }
      });

      // 2. Total Customers
      const customersQuery = query(collection(db, 'customers'), where('businessId', '==', businessId));
      const customersSnapshot = await getDocs(customersQuery);
      const totalCustomers = customersSnapshot.size;

      // 3. Total Products & Low Stock
      const productsQuery = query(collection(db, 'products'), where('businessId', '==', businessId));
      const productsSnapshot = await getDocs(productsQuery);
      
      let totalProducts = productsSnapshot.size;
      let lowStockProducts = 0;
      const LOW_STOCK_THRESHOLD = 10;

      productsSnapshot.forEach(doc => {
        const product = doc.data();
        if (product.stockQuantity !== undefined && product.stockQuantity < LOW_STOCK_THRESHOLD) {
          lowStockProducts++;
        }
      });

      // Format Chart Data
      const monthlySalesData = Object.keys(salesByMonth).map(month => ({
        name: month,
        sales: salesByMonth[month]
      }));

      // Sort top products by quantity descending, take top 5
      const topProductsData = Object.keys(productSales)
        .map(name => ({ name, value: productSales[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      return {
        metrics: {
          totalSales,
          totalCustomers,
          totalProducts,
          lowStockProducts
        },
        charts: {
          monthlySales: monthlySalesData.length > 0 ? monthlySalesData : [],
          topProducts: topProductsData.length > 0 ? topProductsData : []
        }
      };

    } catch (error) {
      console.error('[analyticsService] Error fetching dashboard data:', error);
      throw error;
    }
  }
};
