import React, { useState } from 'react';
import {
  User,
  Bell,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Save,
  Clock,
  Mail,
  Phone,
  Building2,
  Sliders,
  Volume2,
} from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import { doctorsData } from '../../../utils/dummyData';

const StaffSettings = () => {
  const [toastMsg, setToastMsg] = useState('');

  // Profile Form State
  const [profile, setProfile] = useState({
    name: 'Dr. Rina Adhikari',
    role: 'Senior Receptionist / Staff Admin',
    email: 'rina.adhikari@clinic.np',
    phone: '+977 9841234567',
    shift: 'Morning (08:00 AM - 04:00 PM)',
    assignedDesk: 'Desk 01 (Main Reception)',
  });

  // Preferences State
  const [notifications, setNotifications] = useState({
    queueAudioAlert: true,
    desktopPopups: true,
    smsConfirmation: true,
    emailSummary: false,
  });

  // Operational Settings
  const [opSettings, setOpSettings] = useState({
    defaultDoctor: doctorsData[0]?.name || 'Dr. Ram Sharma',
    receiptFormat: 'Thermal 80mm POS',
    autoAdvanceMinutes: '15',
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setToastMsg('Staff profile and operational settings saved successfully!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass) return;
    if (passwords.newPass !== passwords.confirm) {
      alert('New passwords do not match!');
      return;
    }
    setToastMsg('Security password updated successfully!');
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Staff Preferences & Clinic Desk Settings</h2>
          <p className="text-xs text-slate-500">Customize your reception desk preferences, audio alerts, and staff credentials</p>
        </div>
        <button
          onClick={handleSaveProfile}
          className="btn btn-primary btn-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Save className="h-4 w-4" /> Save all changes
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title="Staff Identity" subtitle="Personal details and desk assignment">
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-500 font-display text-2xl font-extrabold text-white shadow-lg">
                  DR
                </span>
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">{profile.name}</h3>
              <span className="mt-0.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                {profile.role}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>{profile.shift}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span>{profile.assignedDesk}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Configuration Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Desk & Queue Preferences */}
          <SectionCard title="Reception & Desk Preferences" subtitle="Configure queue defaults and ticket printing">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Default Doctor View</label>
                <select
                  value={opSettings.defaultDoctor}
                  onChange={(e) => setOpSettings({ ...opSettings, defaultDoctor: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {doctorsData.map((doc) => (
                    <option key={doc.id} value={doc.name}>{doc.name} ({doc.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Receipt Printer Format</label>
                <select
                  value={opSettings.receiptFormat}
                  onChange={(e) => setOpSettings({ ...opSettings, receiptFormat: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Thermal 80mm POS">Thermal 80mm POS Receipt</option>
                  <option value="Thermal 58mm POS">Thermal 58mm Small Receipt</option>
                  <option value="Standard A4 Invoice">Standard A4 Full Page Invoice</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Audio & Notification Alerts */}
          <SectionCard title="Queue Audio & Notification Settings" subtitle="Configure live token calling sound alerts">
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Token Call Chime / Audio Alert</p>
                    <p className="text-[11px] text-slate-400">Play chime when calling next patient token</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.queueAudioAlert}
                  onChange={(e) => setNotifications({ ...notifications, queueAudioAlert: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Desktop Popup Notifications</p>
                    <p className="text-[11px] text-slate-400">Show notification popups for new online patient bookings</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.desktopPopups}
                  onChange={(e) => setNotifications({ ...notifications, desktopPopups: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Patient SMS Ticket Confirmation</p>
                    <p className="text-[11px] text-slate-400">Auto-send token number via SMS upon patient walk-in registration</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.smsConfirmation}
                  onChange={(e) => setNotifications({ ...notifications, smsConfirmation: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary-600"
                />
              </label>
            </div>
          </SectionCard>

          {/* Security & Password Update */}
          <SectionCard title="Security Credentials" subtitle="Update staff account password">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn btn-outline btn-sm flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Update Password
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default StaffSettings;