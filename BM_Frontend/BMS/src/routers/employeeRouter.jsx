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

function RequireEmployeeRole() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6 text-slate-600">Loading account...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== ROLES.EMPLOYEE) {
    const fallbackByRole = {
      [ROLES.ADMIN]: '/admin/dashboard',
      [ROLES.MANAGER]: '/manager/dashboard',
      [ROLES.CUSTOMER]: '/customer/dashboard',
    };

    return <Navigate to={fallbackByRole[user.role] ?? '/login'} replace />;
  }

  return <Outlet />;
}

export default createRoutesFromElements(
  <Route id="employee-root" path="/employee" element={<RequireEmployeeRole />}>
    <Route
      id="employee-shell"
      element={
        <DashboardLayout
          headerProps={{ title: 'Employee Dashboard', breadcrumb: 'Overview' }}
          sidebarProps={{ activeItem: 'Dashboard' }}
        />
      }
    >
      <Route id="employee-home" index element={<Navigate to="dashboard" replace />} />
      <Route id="employee-dashboard" path="dashboard" element={<Placeholder name="Employee Dashboard" />} />
      <Route id="employee-tasks" path="tasks" element={<Placeholder name="My Tasks" />} />
      <Route id="employee-projects" path="projects" element={<Placeholder name="My Projects" />} />
      <Route id="employee-tickets" path="tickets" element={<Placeholder name="Tickets" />} />
      <Route id="employee-time-tracking" path="time-tracking" element={<Placeholder name="Time Tracking" />} />
      <Route id="employee-schedule" path="schedule" element={<Placeholder name="Schedule" />} />
      <Route id="employee-calendar" path="calendar" element={<Placeholder name="Calendar" />} />
      <Route id="employee-messages" path="messages" element={<Placeholder name="Messages" />} />
      <Route id="employee-settings" path="settings" element={<Placeholder name="Settings" />} />
      <Route id="employee-profile" path="profile" element={<Placeholder name="Profile" />} />
    </Route>
  </Route>
);
