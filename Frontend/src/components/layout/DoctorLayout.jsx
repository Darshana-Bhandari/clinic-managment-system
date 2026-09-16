import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  Settings,
  Stethoscope,
} from 'lucide-react';

const navItems = [
  { to: '/doctor', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/doctor/appointments', label: 'Appointments', icon: CalendarDays, badge: 'New' },
  { to: '/doctor/patients', label: 'My Patients', icon: Users },
  { to: '/doctor/records', label: 'Medical Records', icon: FileText },
  { to: '/doctor/settings', label: 'Settings', icon: Settings },
];

const titles = {
  '/doctor': { title: 'Doctor Dashboard', subtitle: 'Welcome back — today\'s schedule and patient overview' },
  '/doctor/appointments': { title: 'Appointments', subtitle: 'Manage your consultation schedule' },
  '/doctor/patients': { title: 'My Patients', subtitle: 'Patient list and visit history' },
  '/doctor/records': { title: 'Medical Records', subtitle: 'Diagnoses, prescriptions & reports' },
  '/doctor/settings': { title: 'Doctor Settings', subtitle: 'Profile, availability & credentials' },
};

const DoctorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = titles[pathname] || { title: 'Doctor Portal', subtitle: '' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
        title="Doctor Portal"
      />

      <div className="lg:pl-72">
        <Topbar onMenu={() => setSidebarOpen(true)} title={meta.title} subtitle={meta.subtitle} />
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;