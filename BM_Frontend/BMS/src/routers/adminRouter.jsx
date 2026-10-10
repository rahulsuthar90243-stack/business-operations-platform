import {
  Navigate,
  Outlet,
  Route,
  createRoutesFromElements,
  useLocation,
} from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/navigationConfig';
const Placeholder = ({ name }) => <div>{name} page under construction.</div>;

function RequireAdminRole() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6 text-slate-600">Loading account...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== ROLES.ADMIN) {
    const fallbackByRole = {
      [ROLES.CUSTOMER]: '/customer/dashboard',
      [ROLES.MANAGER]: '/manager/dashboard',
      [ROLES.EMPLOYEE]: '/employee/dashboard',
    };

    return <Navigate to={fallbackByRole[user.role] ?? '/login'} replace />;
  };

  return <Outlet />;
}

export default createRoutesFromElements(
  <Route id="admin-root" path="/admin" element={<RequireAdminRole />}>
    <Route
      id="admin-shell"
      element={
        <DashboardLayout
          headerProps={{ title: 'Admin Dashboard', breadcrumb: 'Overview' }}
          sidebarProps={{ activeItem: 'Dashboard' }}
        />
      }
    >
      <Route id="admin-home" index element={<Navigate to="dashboard" replace />} />
      <Route id="admin-dashboard" path="dashboard" element={<AdminDashboard />} />
      {/* Placeholders for future admin pages */}
      <Route id="admin-users" path="users" element={<Placeholder name="Users" />} />
      <Route id="admin-projects" path="projects" element={<Placeholder name="Projects" />} />
      <Route id="admin-customers" path="customers" element={<Placeholder name="Customers" />} />
      <Route id="admin-tickets" path="tickets" element={<Placeholder name="Tickets" />} />
      <Route id="admin-analytics" path="analytics" element={<Placeholder name="Analytics" />} />
      <Route id="admin-settings" path="settings" element={<Placeholder name="Settings" />} />
      <Route id="admin-audit-logs" path="audit-logs" element={<Placeholder name="Audit Logs" />} />
    </Route>
  </Route>
);
