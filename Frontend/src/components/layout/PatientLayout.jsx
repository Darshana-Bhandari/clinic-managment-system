import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

import {
  CalendarDays,
  FileText,
} from 'lucide-react';

const navItems = [
  { to: '/patient', label: 'My Appointments', icon: CalendarDays, end: true },
  { to: '/patient/history', label: 'Medical History', icon: FileText },
];

const titles = {
  '/patient': { title: 'My Appointments', subtitle: 'Your upcoming and past visits' },
  '/patient/history': { title: 'Medical History', subtitle: 'Prescriptions and reports' },
};

const PatientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = titles[pathname] || { title: 'Dashboard', subtitle: '' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} navItems={navItems} title="Patient Portal" />

      <div className="lg:pl-72">
        <Topbar onMenu={() => setSidebarOpen(true)} title={meta.title} subtitle={meta.subtitle} />
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;