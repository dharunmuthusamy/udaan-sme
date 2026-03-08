import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Assessment from './pages/Assessment';
import Demo from './pages/Demo';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// Sub-pages for Dashboard
import Sales from './pages/dashboard/Sales';
import CreateInvoice from './pages/dashboard/CreateInvoice';
import InvoiceDetail from './pages/dashboard/InvoiceDetail';
import Inventory from './pages/dashboard/Inventory';
import AddProduct from './pages/dashboard/AddProduct';
import CRM from './pages/dashboard/CRM';
import AddCustomer from './pages/dashboard/AddCustomer';
import Tasks from './pages/dashboard/Tasks';
import CreateTask from './pages/dashboard/CreateTask';
import Analytics from './pages/dashboard/Analytics';
import Settings from './pages/dashboard/Settings';
import Onboarding from './pages/dashboard/Onboarding';
import Quotations from './pages/dashboard/Quotations';
import CreateQuotation from './pages/dashboard/CreateQuotation';
import QuotationDetail from './pages/dashboard/QuotationDetail';
import Orders from './pages/dashboard/Orders';
import OrderDetail from './pages/dashboard/OrderDetail';
import Vendors from './pages/dashboard/Vendors';
import AddVendor from './pages/dashboard/AddVendor';
import Purchases from './pages/dashboard/Purchases';
import RecordPurchase from './pages/dashboard/RecordPurchase';
import HelpCenter from './pages/dashboard/HelpCenter';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Dashboard/DashboardLayout';

function LayoutWrapper() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="flex min-h-screen flex-col">
      {!isDashboard && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Non-Dashboard Routes */}
          <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/demo" element={<ProtectedRoute><Demo /></ProtectedRoute>} />

          {/* Professional Dashboard Shell with Nested Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales/quotations" element={<Quotations />} />
            <Route path="sales/quotations/:quotationId" element={<QuotationDetail />} />
            <Route path="sales/create" element={<CreateInvoice />} />
            <Route path="sales/create-quotation" element={<CreateQuotation />} />
            <Route path="sales/orders" element={<Orders />} />
            <Route path="sales/orders/:orderId" element={<OrderDetail />} />
            <Route path="sales/:invoiceId" element={<InvoiceDetail />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/add" element={<AddProduct />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="vendors/add-vendor" element={<AddVendor />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="purchases/record" element={<RecordPurchase />} />
            <Route path="crm" element={<CRM />} />
            <Route path="crm/add" element={<AddCustomer />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/create" element={<CreateTask />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<HelpCenter />} />
          </Route>
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LayoutWrapper />
    </Router>
  );
}
