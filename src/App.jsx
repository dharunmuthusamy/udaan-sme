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
import Analytics from './pages/dashboard/Analytics';
import Settings from './pages/dashboard/Settings';

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
            <Route path="sales" element={<Sales />} />
            <Route path="sales/create" element={<CreateInvoice />} />
            <Route path="sales/:invoiceId" element={<InvoiceDetail />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/add" element={<AddProduct />} />
            <Route path="crm" element={<CRM />} />
            <Route path="crm/add" element={<AddCustomer />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
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
