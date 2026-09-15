import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/authHooks.js';

import Layout from '../components/layout/Layout';
import AuthLayout from '../components/layout/AuthLayout';
import AdminLayout from '../components/layout/AdminLayout';
import StaffLayout from '../components/layout/StaffLayout';
import PatientLayout from '../components/layout/PatientLayout';
import DoctorLayout from '../components/layout/DoctorLayout';

import Home from '../pages/Home';
import Doctor from '../pages/Doctor';
import DoctorDetail from '../pages/DoctorDetail';
import About from '../pages/About';
import Contact from '../pages/Contact';
import NotFound from '../pages/Error';
import Services from '../pages/Services';
import ServiceDetail from '../pages/ServiceDetail';
import Booking from '../pages/Booking';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';

import AdminOverview from '../pages/dashboard/admin/AdminOverview';
import StaffOverview from '../pages/dashboard/staff/StaffOverview';
import StaffAppointments from '../pages/dashboard/staff/StaffAppointments';
import StaffPatients from '../pages/dashboard/staff/StaffPatients';
import StaffSettings from '../pages/dashboard/staff/StaffSettings';
import AdminDoctors from '../pages/dashboard/admin/AdminDoctors';
import AdminStaff from '../pages/dashboard/admin/AdminStaff';
import StaffQueue from '../pages/dashboard/staff/StaffQueue';
import StaffBilling from '../pages/dashboard/staff/StaffBilling';
import AdminReports from '../pages/dashboard/admin/AdminReports';
import AdminSettings from '../pages/dashboard/admin/AdminSettings';
import PatientAppointments from '../pages/dashboard/patient/PatientAppointments';
import PatientHistory from '../pages/dashboard/patient/PatientHistory';

import DoctorOverview from '../pages/dashboard/doctor/DoctorOverview';
import DoctorAppointments from '../pages/dashboard/doctor/DoctorAppointments';
import DoctorPatients from '../pages/dashboard/doctor/DoctorPatients';
import DoctorRecords from '../pages/dashboard/doctor/DoctorRecords';
import DoctorSettings from '../pages/dashboard/doctor/DoctorSettings';

import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const ROLE_DASHBOARD_MAP = {
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  RECEPTIONIST: '/staff',
  PATIENT: '/patient',
};

const RouteWrapper = ({ children }) => (
  <React.Suspense
    fallback={
      <div className="flex-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    {children}
  </React.Suspense>
);

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-center min-h-[100vh]">
        <LoadingSpinner size="lg" text="Verifying authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (requiredRole) {
    const userRole = user?.role?.toUpperCase();
    const targetRole = requiredRole.toUpperCase();
    const allowedRoles = targetRole === 'STAFF' ? ['RECEPTIONIST', 'DOCTOR'] : [targetRole];
    if (userRole && !allowedRoles.includes(userRole)) {
      const redirect = ROLE_DASHBOARD_MAP[userRole] || '/login';
      return <Navigate to={redirect} replace />;
    }
  }

  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAppSelector((s) => s.auth);

  if (isLoading) {
    return (
      <div className="flex-center min-h-[100vh]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated && user?.role) {
    const redirect = ROLE_DASHBOARD_MAP[user.role.toUpperCase()] || '/';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

const redirectByRole = () => {
  const role = localStorage.getItem('auth_role');
  return ROLE_DASHBOARD_MAP[role?.toUpperCase()] || '/login';
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <RouteWrapper><Home /></RouteWrapper> },
      { path: 'doctors', element: <RouteWrapper><Doctor /></RouteWrapper> },
      { path: 'doctors/:id', element: <RouteWrapper><DoctorDetail /></RouteWrapper> },
      { path: 'services', element: <RouteWrapper><Services /></RouteWrapper> },
      { path: 'services/:serviceId', element: <RouteWrapper><ServiceDetail /></RouteWrapper> },
      { path: 'about', element: <RouteWrapper><About /></RouteWrapper> },
      { path: 'contact', element: <RouteWrapper><Contact /></RouteWrapper> },
      { path: 'book', element: <RouteWrapper><Booking /></RouteWrapper> },
      { path: 'home', element: <Navigate to="/" replace /> },
      { path: 'dashboard', element: <Navigate to={redirectByRole()} replace /> },
    ],
  },

  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'doctors', element: <AdminDoctors /> },
      { path: 'staff', element: <AdminStaff /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },

  {
    path: '/staff',
    element: (
      <ProtectedRoute requiredRole="STAFF">
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
    path: '/doctor',
    element: (
      <ProtectedRoute requiredRole="DOCTOR">
        <DoctorLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <DoctorOverview /> },
      { path: 'appointments', element: <DoctorAppointments /> },
      { path: 'patients', element: <DoctorPatients /> },
      { path: 'records', element: <DoctorRecords /> },
      { path: 'settings', element: <DoctorSettings /> },
    ],
  },

  {
    path: '/patient',
    element: (
      <ProtectedRoute requiredRole="PATIENT">
        <PatientLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <PatientAppointments /> },
      { path: 'history', element: <PatientHistory /> },
    ],
  },

  {
    path: '/login',
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <RouteWrapper>
            <Login />
          </RouteWrapper>
        ),
      },
    ],
  },

  {
    path: '/register',
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <RouteWrapper>
            <Register />
          </RouteWrapper>
        ),
      },
    ],
  },

  { path: '*', element: <NotFound /> },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;