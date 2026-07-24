import React, { useEffect, useRef, useState } from 'react';
import { Menu, Search, Bell, Moon, Sun, ChevronDown, User, Settings, HelpCircle, LogOut, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { activityFeed } from '../../utils/dashboardData';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ onMenu, title, subtitle }) => {
  const { theme, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'settings' | 'help'
  const [toast, setToast] = useState('');
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleAction = (item) => {
    setProfileOpen(false);
    if (item === 'Log out') {
      navigate('/login');
    } else {
      setActiveModal(item);
    }
  };

  return (
    <>
      <header
        ref={ref}
        className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-6"
      >
        <button
          onClick={onMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="hidden truncate text-xs text-slate-500 sm:block">{subtitle}</p>}
        </div>

        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, appointments…"
            className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:bg-slate-900"
          />
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
          </button>

          {notifOpen && (
            <div className="animate-in fade-in zoom-in-95 absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">5 new</span>
              </div>
              <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                {activityFeed.map((a) => (
                  <li key={a.id} className="flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{a.text}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User Profile Header Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {/* Teal Avatar */}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 font-display text-xs font-extrabold text-white shadow-sm">
              DR
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-bold leading-tight text-slate-900 dark:text-white">Dr. Rina Adhikari</span>
              <span className="block text-xs leading-tight text-slate-400">Administrator</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="animate-in fade-in zoom-in-95 absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-3 py-2 text-xs dark:border-slate-800 sm:hidden">
                <p className="font-bold text-slate-900 dark:text-white">Dr. Rina Adhikari</p>
                <p className="text-slate-400">Administrator</p>
              </div>

              <div className="space-y-0.5 py-1">
                <button
                  onClick={() => handleAction('My profile')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  My profile
                </button>
                <button
                  onClick={() => handleAction('Clinic settings')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Clinic settings
                </button>
                <button
                  onClick={() => handleAction('Help & support')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <HelpCircle className="h-4 w-4 text-slate-400" />
                  Help & support
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                <button
                  onClick={() => handleAction('Log out')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Profile / Settings Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{activeModal}</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activeModal === 'My profile' && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500 font-display text-base font-extrabold text-white">DR</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Dr. Rina Adhikari</p>
                      <p className="text-xs text-slate-500">Super Administrator</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Email: rina.adhikari@clinic.np</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Phone: +977 9841234567</p>
                </div>
              )}

              {activeModal === 'Clinic settings' && (
                <div className="space-y-3 text-sm">
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">Clinic Management Configuration</p>
                  <p className="text-xs text-slate-500">Operating Hours: 08:00 AM – 08:00 PM</p>
                  <p className="text-xs text-slate-500">Default Currency: NPR (Rs.)</p>
                  <p className="text-xs text-slate-500">Token Broadcast: Active WebSocket Server</p>
                </div>
              )}

              {activeModal === 'Help & support' && (
                <div className="space-y-3 text-sm">
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">Helpdesk & Support</p>
                  <p className="text-xs text-slate-500">Contact IT Support: support@clinic.com.np</p>
                  <p className="text-xs text-slate-500">Emergency Line: +977 01-4433221</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;