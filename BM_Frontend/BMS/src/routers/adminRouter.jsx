import { Navigate, createRoutesFromElements, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';

const Placeholder = ({ name }) => <div>{name} page under construction.</div>;

export default createRoutesFromElements(
  <Route
    id="admin-root"
    path="/admin"
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
);
