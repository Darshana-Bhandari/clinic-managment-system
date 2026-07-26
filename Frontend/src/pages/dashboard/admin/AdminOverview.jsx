


import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Users,
  Wallet,
  UserX,
  Download,
  ArrowRight,
  TrendingUp,
  CalendarPlus,
  Bell,
  CreditCard,
  Check,
} from 'lucide-react';
import StatCard from '../../../components/sections/StatCar';
import SectionCard from '../../../components/sections/SectionCard';
import AreaChart from '../../../components/sections/AreaChart';
import DonutChart from '../../../components/sections/DonutChart';
import BarList from '../../../components/sections/BarList';
import StatusPill from '../../../components/sections/StatusPill';
import {
  kpis,
  revenueTrend,
  bookingSource,
  paymentMix,
  doctorLoad,
  todaysAppointments,
  liveQueue,
  activityFeed,
  currency,
} from '../../../utils/dashboardData';

const iconMap = { CalendarCheck, Users, Wallet, UserX };
const ranges = ['Today', '7 days', '30 days'];

const activityIcon = {
  booking: { Icon: CalendarPlus, tone: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300' },
  payment: { Icon: CreditCard, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' },
  checkin: { Icon: Check, tone: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300' },
  noshow: { Icon: UserX, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300' },
};

const Overview = () => {
  const [range, setRange] = useState('Today');
  const revenueTotal = revenueTrend.reduce((s, d) => s + d.online + d.cash, 0);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                range === r
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <Link to="/dashboard/appointments" className="btn btn-primary btn-sm">
            <CalendarPlus className="h-4 w-4" /> New appointment
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <StatCard
            key={k.key}
            icon={iconMap[k.icon]}
            label={k.label}
            value={k.display || k.value}
            delta={k.delta}
            sub={k.sub}
            tone={k.tone}
          />
        ))}
      </div>

      {/* Revenue + booking source */}
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Revenue trend"
          subtitle="Online vs cash · last 14 days"
          action={
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" /> +18.2%
            </span>
          }
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{currency(revenueTotal)}</p>
              <p className="text-xs text-slate-400">Collected in period</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary-600" /> Total</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Online</span>
            </div>
          </div>
          <AreaChart data={revenueTrend} />
        </SectionCard>

        <SectionCard title="Booking source" subtitle="Public website vs staff">
          <DonutChart data={bookingSource} centerLabel="bookings" centerValue={bookingSource.reduce((s, d) => s + d.value, 0)} />
          <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50">
            <span className="font-semibold text-primary-700 dark:text-primary-300">65%</span> of bookings now come
            straight from the public website — up from 48% last month.
          </div>
        </SectionCard>
      </div>

      {/* Appointments + queue */}
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Today's appointments"
          subtitle="6 of 48 shown"
          bodyClassName="p-0"
          action={
            <Link to="/dashboard/appointments" className="flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-300">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-3 font-semibold">Token</th>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Doctor</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Time</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/70">
                {todaysAppointments.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{a.token}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{a.patient}</p>
                      <p className="text-xs text-slate-400">
                        {a.source === 'web' ? 'Web booking' : 'Staff booking'} · {a.paid ? 'Paid' : 'Unpaid'}
                      </p>
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      <p className="text-slate-700 dark:text-slate-300">{a.doctor}</p>
                      <p className="text-xs text-slate-400">{a.dept}</p>
                    </td>
                    <td className="hidden px-5 py-3 text-slate-600 dark:text-slate-300 sm:table-cell">{a.time}</td>
                    <td className="px-5 py-3"><StatusPill status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Live queue"
          subtitle="Updated in real time"
          action={<span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span> Live</span>}
        >
          <ul className="space-y-3">
            {liveQueue.map((q) => (
              <li key={q.doctor} className="rounded-2xl border border-slate-200/70 p-3.5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{q.initials}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{q.doctor}</p>
                    <p className="text-xs text-slate-400">{q.dept}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Now serving</span>
                  <span className="rounded-md bg-primary-600 px-2 py-0.5 font-mono font-bold text-white">{q.current}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{q.waiting} waiting</span>
                  <span className="text-slate-400">{q.eta}</span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Doctor load + payment mix + activity */}
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Doctor load" subtitle="Patients seen this week">
          <BarList items={doctorLoad} unit="pts" />
        </SectionCard>

        <SectionCard title="Payment methods" subtitle="Share of paid invoices">
          <DonutChart data={paymentMix} centerLabel="paid" centerValue="100%" size={160} />
        </SectionCard>

        <SectionCard
          title="Recent activity"
          subtitle="Latest events"
          action={<Bell className="h-4 w-4 text-slate-400" />}
        >
          <ul className="space-y-4">
            {activityFeed.map((a) => {
              const { Icon, tone } = activityIcon[a.type] || activityIcon.booking;
              return (
                <li key={a.id} className="flex gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm leading-snug text-slate-700 dark:text-slate-300">{a.text}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{a.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
};

export default Overview;