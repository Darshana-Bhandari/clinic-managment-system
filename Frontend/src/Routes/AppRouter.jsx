
import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import Layout from '../components/layout/Layout';
import AuthLayout from '../components/layout/AuthLayout';
import AdminLayout from '../components/layout/AdminLayout';
import StaffLayout from '../components/layout/StaffLayout';
import PatientLayout from '../components/layout/PatientLayout';

// Public pages
import Home from '../pages/Home';
import Doctor from '../pages/Doctor';
import DoctorDetails from '../pages/DoctorDetails';
import About from '../pages/About';
import Contact from '../pages/Contact';
import NotFound from '../pages/Error';
import Service from '../pages/Service';
import ServiceDetails from '../pages/ServiceDetails';
import Booking from '../pages/Booking';

// Dashboard pages
import AdminOverview from '../pages/dashboard/admin/AdminOverview';
import StaffOverview from '../pages/dashboard/staff/StaffOverview';
import StaffAppointments from '../pages/dashboard/staff/StaffAppointment';
import StaffPatients from '../pages/dashboard/staff/StaffPatients';
import StaffSettings from '../pages/dashboard/staff/StaffSetting';
import AdminDoctors from '../pages/dashboard/admin/AdminDoctors';
import StaffQueue from '../pages/dashboard/staff/StaffQueue';
import StaffBilling from '../pages/dashboard/staff/StaffBilling';
import AdminReports from '../pages/dashboard/admin/AdminReports';
import AdminSettings from '../pages/dashboard/admin/AdminSetting';
import PatientAppointments from '../pages/dashboard/patient/patientAppointment';
import PatientHistory from '../pages/dashboard/patient/PatientHistory';

import LoadingSpinner from '../components/ui/LoadingSpinner';

const RouteWrapper = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('auth_token');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  // ---- Public website ----
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <RouteWrapper><Home /></RouteWrapper> },
      { path: 'doctors', element: <RouteWrapper><Doctor /></RouteWrapper> },
      { path: 'doctors/:id', element: <RouteWrapper><DoctorDetails /></RouteWrapper> },
      { path: 'services', element: <RouteWrapper><Service /></RouteWrapper> },
      { path: 'services/:serviceId', element: <RouteWrapper><ServiceDetails /></RouteWrapper> },
      { path: 'about', element: <RouteWrapper><About /></RouteWrapper> },
      { path: 'contact', element: <RouteWrapper><Contact /></RouteWrapper> },
      { path: 'book', element: <RouteWrapper><Booking /></RouteWrapper> },
      { path: 'home', element: <Navigate to="/" replace /> },
    ],
  },

  // ---- Authenticated dashboards (Admin, Staff, Patient) ----
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'doctors', element: <AdminDoctors /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
  {
    path: '/staff',
    element: (
      <ProtectedRoute>
        <StaffLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <StaffOverview /> },
      { path: 'appointments', element: <StaffAppointments /> },
      { path: 'patients', element: <StaffPatients /> },
      { path: 'queue', element: <StaffQueue /> },
      { path: 'billing', element: <StaffBilling /> },
      { path: 'settings', element: <StaffSettings /> },
    ],
  },
  {
    path: '/dashboard',
    element: <Navigate to="/admin" replace />,
  },
  {
    path: '/patient',
    element: (
      <ProtectedRoute>
        <PatientLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <PatientAppointments /> },
      { path: 'history', element: <PatientHistory /> },
    ],
  },

  // ---- Auth ----
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: (
          <RouteWrapper>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email or phone</label>
                <input type="text" placeholder="you@example.com" className="input" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input type="password" placeholder="••••••••" className="input" />
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('auth_token', 'demo_token');
                  window.location.href = '/admin';
                }}
                className="btn btn-primary btn-full"
              >
                Sign in
              </button>
              <p className="text-center text-xs text-slate-400">Demo mode — any credentials will sign you in.</p>
            </div>
          </RouteWrapper>
        ),
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;