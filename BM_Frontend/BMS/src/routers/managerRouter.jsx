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

function RequireManagerRole() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6 text-slate-600">Loading account...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== ROLES.MANAGER) {
    const fallbackByRole = {
      [ROLES.ADMIN]: '/admin/dashboard',
      [ROLES.CUSTOMER]: '/customer/dashboard',
      [ROLES.EMPLOYEE]: '/employee/dashboard',
    };

    return <Navigate to={fallbackByRole[user.role] ?? '/login'} replace />;
  }

  return <Outlet />;
}

export default createRoutesFromElements(
  <Route id="manager-root" path="/manager" element={<RequireManagerRole />}>
    <Route
      id="manager-shell"
      element={
        <DashboardLayout
          headerProps={{ title: 'Manager Dashboard', breadcrumb: 'Overview' }}
          sidebarProps={{ activeItem: 'Dashboard' }}
        />
      }
    >
      <Route id="manager-home" index element={<Navigate to="dashboard" replace />} />
      <Route id="manager-dashboard" path="dashboard" element={<Placeholder name="Manager Dashboard" />} />
      <Route id="manager-projects" path="projects" element={<Placeholder name="Projects" />} />
      <Route id="manager-team-members" path="team-members" element={<Placeholder name="Team Members" />} />
      <Route id="manager-tasks" path="tasks" element={<Placeholder name="Tasks" />} />
      <Route id="manager-tickets" path="tickets" element={<Placeholder name="Tickets" />} />
      <Route id="manager-reports" path="reports" element={<Placeholder name="Reports" />} />
      <Route id="manager-calendar" path="calendar" element={<Placeholder name="Calendar" />} />
      <Route id="manager-messages" path="messages" element={<Placeholder name="Messages" />} />
      <Route id="manager-settings" path="settings" element={<Placeholder name="Settings" />} />
    </Route>
  </Route>
);
