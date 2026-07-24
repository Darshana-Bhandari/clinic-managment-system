import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

import {
  LayoutDashboard,
  Stethoscope,
  BarChart3,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const titles = {
  '/admin': { title: 'Admin Overview', subtitle: "Today's clinic activity at a glance" },
  '/admin/doctors': { title: 'Doctors', subtitle: 'Specialists, availability and load' },
  '/admin/reports': { title: 'Reports', subtitle: 'Revenue and operational insights' },
  '/admin/settings': { title: 'Settings', subtitle: 'Clinic profile and preferences' },
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = titles[pathname] || { title: 'Dashboard', subtitle: '' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} navItems={navItems} title="Admin Portal" />

      <div className="lg:pl-72">
        <Topbar onMenu={() => setSidebarOpen(true)} title={meta.title} subtitle={meta.subtitle} />
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;