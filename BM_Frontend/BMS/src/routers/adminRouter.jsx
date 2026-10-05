import { createRoutesFromElements, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';

const Placeholder = ({ name }) => <div>{name} page under construction.</div>;

export default createRoutesFromElements(
  <Route
    path="/admin"
    element={
      <DashboardLayout
        headerProps={{ title: 'Admin Dashboard', breadcrumb: 'Overview' }}
        sidebarProps={{ activeItem: 'Dashboard' }}
      />
    }
  >
    <Route path="dashboard" element={<AdminDashboard />} />
    {/* Placeholders for future admin pages */}
    <Route path="users" element={<Placeholder name="Users" />} />
    <Route path="projects" element={<Placeholder name="Projects" />} />
    <Route path="customers" element={<Placeholder name="Customers" />} />
    <Route path="tickets" element={<Placeholder name="Tickets" />} />
    <Route path="analytics" element={<Placeholder name="Analytics" />} />
    <Route path="settings" element={<Placeholder name="Settings" />} />
    <Route path="audit-logs" element={<Placeholder name="Audit Logs" />} />
  </Route>
);
