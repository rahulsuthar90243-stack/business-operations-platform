import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import adminRoutes from './routers/adminRouter.jsx';
import Register from './pages/auth/Register.jsx';

const router = createBrowserRouter([
  {
    id: 'root-redirect',
    path: '/',
    element: <Navigate to="/admin/dashboard" replace />, // default dashboard
  },
  ...adminRoutes,
  {
    path: '/register',
    element: <Register />, // registration page
  },
  {
    id: 'not-found-redirect',
    path: '*',
    element: <Navigate to="/admin/dashboard" replace />, // fallback to dashboard
  },
]);

export const App = () => <RouterProvider router={router} />;
