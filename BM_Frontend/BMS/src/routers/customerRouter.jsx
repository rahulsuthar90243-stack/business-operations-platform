import {
  Navigate,
  Outlet,
  Route,
  createRoutesFromElements,
  useLocation,
} from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/navigationConfig';

const Placeholder = ({ name }) => (
  <div className="rounded-xl bg-white p-6 shadow-sm text-slate-700">{name} page under construction.</div>
);

function RequireCustomerRole() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6 text-slate-600">Loading account...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== ROLES.CUSTOMER) {
    const fallbackByRole = {
      [ROLES.ADMIN]: '/admin/dashboard',
      [ROLES.MANAGER]: '/manager/dashboard',
      [ROLES.EMPLOYEE]: '/employee/dashboard',
    };

    return <Navigate to={fallbackByRole[user.role] ?? '/login'} replace />;
  }

  return <Outlet />;
}

export default createRoutesFromElements(
  <Route id="customer-root" path="/customer" element={<RequireCustomerRole />}>
    <Route
      id="customer-shell"
      element={
        <DashboardLayout
          headerProps={{ title: 'Customer Dashboard', breadcrumb: 'Overview' }}
          sidebarProps={{ activeItem: 'Dashboard' }}
        />
      }
    >
      <Route id="customer-home" index element={<Navigate to="dashboard" replace />} />
      <Route id="customer-dashboard" path="dashboard" element={<Placeholder name="Customer Dashboard" />} />
      <Route id="customer-orders" path="orders" element={<Placeholder name="Orders" />} />
      <Route id="customer-invoices" path="invoices" element={<Placeholder name="Invoices" />} />
      <Route id="customer-payments" path="payments" element={<Placeholder name="Payments" />} />
      <Route id="customer-support" path="support" element={<Placeholder name="Support" />} />
      <Route id="customer-profile" path="profile" element={<Placeholder name="Profile" />} />
    </Route>
  </Route>
);
