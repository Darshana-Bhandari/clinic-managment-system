import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Users,
  Wallet,
  Star,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  FileText,
  ChevronRight,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react';
import StatCard from '../../../components/sections/StatCard';
import SectionCard from '../../../components/sections/SectionCard';
import StatusPill from '../../../components/sections/StatusPill';
import AreaChart from '../../../components/sections/AreaChart';

const iconMap = { CalendarCheck, Users, Wallet, Star };

const doctorKpis = [
  { key: 'today', label: "Today's Appointments", value: 14, delta: 12, sub: '8 completed · 5 waiting', icon: 'CalendarCheck', tone: 'primary' },
  { key: 'patients', label: 'Patients Seen', value: 112, delta: 8.4, sub: 'Unique this month', icon: 'Users', tone: 'sky' },
  { key: 'revenue', label: 'Revenue (Week)', value: 'Rs. 1,28,500', delta: 18.2, sub: '56 consultations', icon: 'Wallet', tone: 'emerald' },
  { key: 'rating', label: 'Patient Rating', value: '4.8 / 5', delta: 2.1, sub: '248 reviews', icon: 'Star', tone: 'amber' },
];

const weeklyAppointments = [
  { day: 'Mon', online: 12, cash: 6 },
  { day: 'Tue', online: 9, cash: 8 },
  { day: 'Wed', online: 15, cash: 5 },
  { day: 'Thu', online: 11, cash: 7 },
  { day: 'Fri', online: 14, cash: 9 },
  { day: 'Sat', online: 18, cash: 12 },
  { day: 'Sun', online: 6, cash: 4 },
];

const todaysSchedule = [
  { id: 'A-1042', token: 'C-07', patient: 'Anita Shrestha', age: 34, gender: 'Female', time: '10:00 AM', status: 'In progress', reason: 'Follow-up - Hypertension', fee: 1500, paid: true, phone: '+977 98•••231' },
  { id: 'A-1043', token: 'C-08', patient: 'Prakash Rai', age: 41, gender: 'Male', time: '10:30 AM', status: 'Checked-in', reason: 'Chest pain evaluation', fee: 1500, paid: false, phone: '+977 98•••114' },
  { id: 'A-1044', token: 'C-09', patient: 'Bina Tamang', age: 28, gender: 'Female', time: '11:00 AM', status: 'Booked', reason: 'Routine check-up', fee: 1500, paid: true, phone: '+977 98•••702' },
  { id: 'A-1045', token: 'C-10', patient: 'Suresh Magar', age: 52, gender: 'Male', time: '11:30 AM', status: 'Booked', reason: 'ECG review', fee: 2000, paid: true, phone: '+977 98•••556' },
  { id: 'A-1046', token: 'C-11', patient: 'Gita Lama', age: 6, gender: 'Female', time: '12:00 PM', status: 'Booked', reason: 'Pediatric referral', fee: 1500, paid: false, phone: '+977 98•••889' },
  { id: 'A-1047', token: 'C-12', patient: 'Rajan Thapa', age: 45, gender: 'Male', time: '12:30 PM', status: 'Completed', reason: 'Blood pressure', fee: 1500, paid: true, phone: '+977 98•••037' },
];

const myPatients = [
  { id: 'P-2041', name: 'Anita Shrestha', age: 34, gender: 'Female', visits: 6, lastVisit: 'Today', blood: 'O+', status: 'In care' },
  { id: 'P-2042', name: 'Prakash Rai', age: 41, gender: 'Male', visits: 2, lastVisit: 'Today', blood: 'B+', status: 'New patient' },
  { id: 'P-2043', name: 'Bina Tamang', age: 28, gender: 'Female', visits: 9, lastVisit: 'Yesterday', blood: 'A+', status: 'Chronic' },
  { id: 'P-2044', name: 'Suresh Magar', age: 52, gender: 'Male', visits: 3, lastVisit: '2 days ago', blood: 'AB+', status: 'In care' },
  { id: 'P-2048', name: 'Kamal Bhandari', age: 61, gender: 'Male', visits: 12, lastVisit: '5 days ago', blood: 'O-', status: 'Follow-up' },
];

const DoctorOverview = () => {
  const [schedule, setSchedule] = useState(todaysSchedule);
  const weekTotal = weeklyAppointments.reduce((s, d) => s + d.online + d.cash, 0);

  const handleComplete = (idx) => {
    const updated = [...schedule];
    updated[idx].status = 'Completed';
    setSchedule(updated);
  };

  return (
    <div className="space-y-6">
      {/* Doctor Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-primary-700 to-primary-800 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 font-display text-xl font-extrabold backdrop-blur ring-2 ring-white/20">
              DR
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Activity className="h-3.5 w-3.5 text-emerald-300" /> Online & accepting
              </span>
              <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">Good morning, Dr. Ram Sharma</h1>
              <p className="mt-1 max-w-lg text-sm text-teal-100">
                Cardiology · MBBS, MD (Cardiology) · 14 years experience · You have <strong>14 appointments</strong> scheduled for today.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/doctor/appointments" className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-primary-800 shadow-md transition-transform hover:scale-105 active:scale-95">
              <CalendarCheck className="h-4 w-4 text-primary-600" /> View Schedule
            </Link>
            <Link to="/doctor/records" className="flex items-center gap-2 rounded-xl bg-teal-500/30 px-4 py-2.5 text-xs font-bold text-white backdrop-blur border border-white/20 hover:bg-teal-500/40">
              <FileText className="h-4 w-4" /> Patient Records
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {doctorKpis.map((k) => (
          <StatCard
            key={k.key}
            icon={iconMap[k.icon]}
            label={k.label}
            value={k.value}
            delta={k.delta}
            sub={k.sub}
            tone={k.tone}
          />
        ))}
      </div>

      {/* Chart + Today Summary */}
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Weekly appointment trend"
          subtitle="Consultations over the last 7 days"
          action={
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" /> {weekTotal} total
            </span>
          }
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{weekTotal} consults</p>
              <p className="text-xs text-slate-400">In the last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary-600" /> Check-ins</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Walk-ins</span>
            </div>
          </div>
          <AreaChart data={weeklyAppointments} />
        </SectionCard>

        {/* Quick Actions + Availability */}
        <div className="space-y-6">
          <SectionCard title="Quick actions" subtitle="Patient communication tools">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Call Patient', Icon: PhoneCall, tone: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300' },
                { label: 'Send Message', Icon: MessageSquare, tone: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300' },
                { label: 'Write Rx', Icon: FileText, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' },
                { label: 'Order Test', Icon: Activity, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' },
              ].map(({ label, Icon, tone }) => (
                <button
                  key={label}
                  className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Availability this week" subtitle="Clinic consultation slots">
            <ul className="space-y-2 text-sm">
              {[
                { day: 'Sun - Fri', time: '09:00 AM – 05:00 PM', open: true },
                { day: 'Saturday', time: '10:00 AM – 02:00 PM', open: true },
                { day: 'Public Holidays', time: 'Closed', open: false },
              ].map((s) => (
                <li key={s.day} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{s.day}</span>
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${s.open ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {s.open && <CheckCircle2 className="h-3.5 w-3.5" />}{s.time}
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/doctor/settings" className="mt-3 flex items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-50 dark:border-slate-800 dark:hover:bg-slate-800/50 dark:text-primary-400">
              Edit availability <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </SectionCard>
        </div>
      </div>

      {/* Today's Schedule Table */}
      <SectionCard
        title="Today's schedule"
        subtitle={`${schedule.filter((s) => s.status !== 'Completed').length} remaining · ${schedule.filter((s) => s.status === 'Completed').length} done`}
        bodyClassName="p-0"
        action={
          <Link to="/doctor/appointments" className="flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-300">
            Full calendar <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Token</th>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Reason</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/70">
              {schedule.map((apt, idx) => (
                <tr key={apt.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> {apt.time}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{apt.token}</span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{apt.patient}</p>
                    <p className="text-xs text-slate-400">{apt.gender} · {apt.age} yrs · {apt.phone}</p>
                  </td>
                  <td className="hidden px-5 py-3 text-slate-600 sm:table-cell dark:text-slate-300">{apt.reason}</td>
                  <td className="px-5 py-3"><StatusPill status={apt.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      {apt.status !== 'Completed' && (
                        <button
                          onClick={() => handleComplete(idx)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </button>
                      )}
                      <Link to={`/doctor/patients`} className="flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                        <FileText className="h-3.5 w-3.5" /> Chart
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* My Patients List */}
      <SectionCard
        title="My patients"
        subtitle="Recent patients under your care"
        bodyClassName="p-0"
        action={
          <Link to="/doctor/patients" className="flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-300">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <div className="divide-y divide-slate-50 dark:divide-slate-800/70">
          {myPatients.map((p) => (
            <Link
              key={p.id}
              to="/doctor/patients"
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 font-display text-xs font-extrabold text-white">
                {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                <p className="text-xs text-slate-400">
                  {p.gender} · {p.age} yrs · Blood {p.blood} · {p.visits} visits
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Last: {p.lastVisit}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400">{p.status}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default DoctorOverview;