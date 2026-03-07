import { customerService } from './customerService';
import { productService } from './productService';
import { taskService } from './taskService';

export const demoDataService = {
  generateDemoContent: async (businessId) => {
    try {
      // 1. Sample Customers (3 records)
      await customerService.create(businessId, { name: 'Acme Corp', email: 'contact@acme.com', phone: '9876543210', address: 'Mumbai, Maharashtra' });
      await customerService.create(businessId, { name: 'Global Solutions', email: 'hr@globalsol.com', phone: '9123456780', address: 'Delhi, India' });
      await customerService.create(businessId, { name: 'Dharun Tech Hub', email: 'hello@dharun.io', phone: '9988776655', address: 'Bangalore, Karnataka' });

      // 2. Sample Products (3 records, including one low stock)
      await productService.create(businessId, { name: 'Professional Laptop', price: 75000, stockQuantity: 15, category: 'Electronics', sku: 'LAP-PRO-001' });
      await productService.create(businessId, { name: 'Wireless Mouse', price: 1200, stockQuantity: 50, category: 'Accessories', sku: 'MOU-WL-002' });
      await productService.create(businessId, { name: 'Ergonomic Chair', price: 8500, stockQuantity: 8, category: 'Furniture', sku: 'CHR-ERG-003' });

      // 3. Sample Tasks
      await taskService.create(businessId, { title: 'Setup GST Profile', description: 'Update business settings with GSTIN', status: 'pending', priority: 'high' });
      await taskService.create(businessId, { title: 'First Inventory Audit', description: 'Verify physical stock vs digital records', status: 'completed', priority: 'medium' });
      
      return true;
    } catch (error) {
      console.error('Error generating demo data:', error);
      return false;
    }
  }
};
