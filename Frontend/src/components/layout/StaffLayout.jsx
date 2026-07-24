import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  ListOrdered,
  Receipt,
  BarChart3,
  Settings,
  Plus,
  ArrowLeft,
  LogOut,
  X,
} from 'lucide-react';

const Sidebar = ({ open, onClose, navItems, title = 'Clinic' }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 text-white shadow-lg shadow-primary-500/30">
              <Plus className="h-5 w-5" strokeWidth={3} />
            </span>
            <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Medi<span className="text-primary-600">Care</span>
            </span>
          </Link>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          {navItems.map(({ to, label, icon: Icon, end, badge, dot }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                  {dot && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="space-y-1 border-t border-slate-200 p-3 dark:border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
          >
            <ArrowLeft className="h-4.5 w-4.5" /> Back to website
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              window.location.href = '/';
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            <LogOut className="h-4.5 w-4.5" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;