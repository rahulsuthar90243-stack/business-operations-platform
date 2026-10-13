import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import adminRoutes from './routers/adminRouter.jsx';
import customerRoutes from './routers/customerRouter.jsx';
import managerRoutes from './routers/managerRouter.jsx';
import employeeRoutes from './routers/employeeRouter.jsx';
import Register from './pages/auth/Register.jsx';
import Login from './pages/auth/Login.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

function RoleHomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-slate-600">Loading account...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'customer':
      return <Navigate to="/customer/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'manager':
      return <Navigate to="/manager/dashboard" replace />;
    case 'employee':
      return <Navigate to="/employee/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

const router = createBrowserRouter([
  {
    id: 'root-redirect',
    path: '/',
    element: <RoleHomeRedirect />,
  },
  ...adminRoutes,
  ...managerRoutes,
  ...employeeRoutes,
  ...customerRoutes,
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    id: 'not-found-redirect',
    path: '*',
    element: <RoleHomeRedirect />,
  },
]);

export const App = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
