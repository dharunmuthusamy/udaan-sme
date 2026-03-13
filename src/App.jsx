import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

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
import WaitingApproval from './pages/WaitingApproval';
import SalesLayout from './pages/dashboard/SalesLayout';
import Sales from './pages/dashboard/Sales';
import CreateInvoice from './pages/dashboard/CreateInvoice';
import InvoiceDetail from './pages/dashboard/InvoiceDetail';
import PurchasesLayout from './pages/dashboard/PurchasesLayout';
import Purchases from './pages/dashboard/Purchases';
import Inventory from './pages/dashboard/Inventory';
import AddProduct from './pages/dashboard/AddProduct';
import CRM from './pages/dashboard/CRM';
import AddCustomer from './pages/dashboard/AddCustomer';
import Tasks from './pages/dashboard/staffs/Tasks';
import CreateTask from './pages/dashboard/staffs/CreateTask';
import Analytics from './pages/dashboard/Analytics';
import Onboarding from './pages/dashboard/Onboarding';
import Quotations from './pages/dashboard/Quotations';
import CreateQuotation from './pages/dashboard/CreateQuotation';
import QuotationDetail from './pages/dashboard/QuotationDetail';
import Orders from './pages/dashboard/Orders';
import OrderDetail from './pages/dashboard/OrderDetail';
import Vendors from './pages/dashboard/Vendors';
import AddVendor from './pages/dashboard/AddVendor';
import TransactionHistory from './pages/dashboard/TransactionHistory';
import RecordPurchase from './pages/dashboard/RecordPurchase';
import HelpCenter from './pages/dashboard/HelpCenter';
import JoinRequests from './pages/dashboard/staffs/JoinRequests';
import UserManagement from './pages/dashboard/staffs/UserManagement';
import StaffsLayout from './pages/dashboard/staffs/StaffsLayout';
import Attendance from './pages/dashboard/staffs/Attendance';
import BusinessProfile from './pages/dashboard/BusinessProfile';
import UserProfile from './pages/dashboard/UserProfile';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import PremiumProtectedRoute from './components/PremiumProtectedRoute';
import DashboardLayout from './components/Dashboard/DashboardLayout';

function StaffsIndexRedirect() {
  const { userData, loading } = useAuth();
  if (loading) return null;
  if (!userData) return <Navigate to="/dashboard" replace />;
  // Only Owners can see Users and Join Requests.
  if (userData.role === 'owner') return <Navigate to="users" replace />;
  // Everyone else goes to Tasks
  return <Navigate to="tasks" replace />;
}

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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Non-Dashboard Routes */}
          <Route path="/waiting-approval" element={<ProtectedRoute><WaitingApproval /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/demo" element={<ProtectedRoute><Demo /></ProtectedRoute>} />

          {/* Professional Dashboard Shell with Nested Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="sales" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant']}><SalesLayout /></RoleProtectedRoute>}>
              <Route index element={<Navigate to="quotations" replace />} />
              <Route path="quotations" element={<Quotations />} />
              <Route path="orders" element={<Orders />} />
              <Route path="invoices" element={<Sales />} />
            </Route>

            <Route path="sales/quotations/:quotationId" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant']}><QuotationDetail /></RoleProtectedRoute>} />
            <Route path="sales/create" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant']}><CreateInvoice /></RoleProtectedRoute>} />
            <Route path="sales/create-quotation" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant']}><CreateQuotation /></RoleProtectedRoute>} />
            <Route path="sales/orders/:orderId" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant']}><OrderDetail /></RoleProtectedRoute>} />
            <Route path="sales/:invoiceId" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant']}><InvoiceDetail /></RoleProtectedRoute>} />
            <Route path="inventory" element={<RoleProtectedRoute allowedRoles={['owner', 'storekeeper']}><Inventory /></RoleProtectedRoute>} />
            <Route path="inventory/add" element={<RoleProtectedRoute allowedRoles={['owner', 'storekeeper']}><AddProduct /></RoleProtectedRoute>} />
            <Route path="purchases" element={<RoleProtectedRoute allowedRoles={['owner', 'storekeeper']}><PurchasesLayout /></RoleProtectedRoute>}>
              <Route index element={<Navigate to="vendors" replace />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="records" element={<Purchases />} />
            </Route>

            <Route path="purchases/vendors/add" element={<RoleProtectedRoute allowedRoles={['owner', 'storekeeper', 'accountant']}><AddVendor /></RoleProtectedRoute>} />
            <Route path="purchases/records/record" element={<RoleProtectedRoute allowedRoles={['owner', 'storekeeper', 'accountant']}><RecordPurchase /></RoleProtectedRoute>} />
            
            <Route path="transactions" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant', 'storekeeper']}><TransactionHistory /></RoleProtectedRoute>} />
            <Route path="crm" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant', 'storekeeper']}><CRM /></RoleProtectedRoute>} />
            <Route path="crm/add" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant', 'storekeeper']}><AddCustomer /></RoleProtectedRoute>} />

            <Route path="staffs" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant', 'storekeeper', 'staff']}><StaffsLayout /></RoleProtectedRoute>}>
              <Route index element={<StaffsIndexRedirect />} />
              <Route path="users" element={<RoleProtectedRoute allowedRoles={['owner']}><UserManagement /></RoleProtectedRoute>} />
              <Route path="join-requests" element={<RoleProtectedRoute allowedRoles={['owner']}><JoinRequests /></RoleProtectedRoute>} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/create" element={<CreateTask />} />
              <Route path="attendance" element={<Attendance />} />
            </Route>

            <Route path="analytics" element={
              <RoleProtectedRoute allowedRoles={['owner', 'accountant', 'storekeeper', 'staff']}>
                <PremiumProtectedRoute>
                  <Analytics />
                </PremiumProtectedRoute>
              </RoleProtectedRoute>
            } />
            <Route path="business" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant', 'storekeeper', 'staff']}><BusinessProfile /></RoleProtectedRoute>} />
            <Route path="profile" element={<RoleProtectedRoute allowedRoles={['owner', 'accountant', 'storekeeper', 'staff']}><UserProfile /></RoleProtectedRoute>} />
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
