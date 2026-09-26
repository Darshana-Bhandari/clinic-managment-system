import React, { useState, useEffect } from 'react';
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
import toast from 'react-hot-toast';
import StatCard from '../../../components/sections/StatCard';
import SectionCard from '../../../components/sections/SectionCard';
import AreaChart from '../../../components/sections/AreaChart';
import DonutChart from '../../../components/sections/DonutChart';
import BarList from '../../../components/sections/BarList';
import StatusPill from '../../../components/sections/StatusPill';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import {
  getDashboardStats,
  getRevenueReport,
  getDoctorLoad,
  getDailySummary,
} from '../../../services/dashboardServices';
import { getAppointments } from '../../../services/appointmentService';
import {
  bookingSource,
  paymentMix,
  liveQueue,
  activityFeed,
  currency,
} from '../../../utils/dashboardData';
import { getInitials } from '../../../utils/helpers';

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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctorLoadData, setDoctorLoadData] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 14);

        const [
          statsRes,
          dailyRes,
          revenueRes,
          appointmentsRes,
          doctorLoadRes,
        ] = await Promise.all([
          getDashboardStats({ period: 'month' }),
          getDailySummary(),
          getRevenueReport({
            from: start.toISOString().split('T')[0],
            to: end.toISOString().split('T')[0],
          }),
          getAppointments({ limit: 10 }),
          getDoctorLoad(),
        ]);

        setStats(statsRes);
        setDailySummary(dailyRes);
        setRevenueReport(revenueRes);
        setAppointments(
          Array.isArray(appointmentsRes)
            ? appointmentsRes
            : appointmentsRes?.appointments || []
        );
        setDoctorLoadData(Array.isArray(doctorLoadRes) ? doctorLoadRes : []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const totalPatients = stats?.patients?.total ?? stats?.totalPatients ?? 0;
  const totalDoctors = stats?.doctors?.total ?? stats?.totalDoctors ?? 0;
  const totalRevenue =
    stats?.revenue?.totalRevenue ?? stats?.totalRevenue ?? 0;
  const activeAppointments =
    stats?.appointments?.scheduled ?? stats?.activeAppointments ?? 0;
  const appointmentsToday = dailySummary?.appointmentsToday ?? 0;
  const revenueToday = dailySummary?.revenueToday ?? 0;
  const noShowsToday = dailySummary?.noShowsToday ?? 0;
  const newPatientsToday = dailySummary?.newPatientsToday ?? 0;

  const kpis = [
    {
      key: 'appointments',
      label: "Today's Appointments",
      value: appointmentsToday,
      delta: null,
      sub: `${dailySummary?.completedToday ?? 0} completed`,
      icon: 'CalendarCheck',
      tone: 'primary',
    },
    {
      key: 'patients',
      label: 'Total Patients',
      value: totalPatients,
      delta: null,
      sub: `${newPatientsToday} new today`,
      icon: 'Users',
      tone: 'sky',
    },
    {
      key: 'revenue',
      label: 'Revenue Today',
      value: revenueToday,
      display: currency(revenueToday),
      delta: null,
      sub: currency(totalRevenue) + ' total',
      icon: 'Wallet',
      tone: 'emerald',
    },
    {
      key: 'noshow',
      label: `No-shows`,
      value: noShowsToday,
      delta: null,
      sub: `${activeAppointments} active · ${totalDoctors} doctors`,
      icon: 'UserX',
      tone: 'rose',
    },
  ];

  const convertRevenueReportToChartData = (report) => {
    if (!report || !Array.isArray(report.bills) || report.bills.length === 0) {
      return [];
    }

    const dayMap = new Map();
    report.bills.forEach((bill) => {
      const date = new Date(bill.generatedAt);
      const dayKey = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const method = (bill.paymentMethod || 'CASH').toUpperCase();
      const amount = bill.totalAmount || 0;

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, { day: dayKey, online: 0, cash: 0 });
      }

      const entry = dayMap.get(dayKey);
      if (method === 'CASH' || method === 'CASH_ON_DELIVERY') {
        entry.cash += amount;
      } else {
        entry.online += amount;
      }
    });

    const result = Array.from(dayMap.values());
    result.sort((a, b) => {
      const dateA = new Date(a.day);
      const dateB = new Date(b.day);
      return dateA - dateB;
    });

    return result;
  };

  const revenueTrend = convertRevenueReportToChartData(revenueReport);
  const revenueTotal = revenueTrend.reduce((s, d) => s + d.online + d.cash, 0);

  const convertAppointmentsToTableData = (apps) => {
    if (!Array.isArray(apps)) return [];
    return apps.slice(0, 10).map((a) => {
      const patientName =
        a.patient?.user?.fullName ||
        a.patientName ||
        a.patient?.fullName ||
        'Unknown';
      const doctorName =
        a.doctor?.user?.fullName ||
        a.doctorName ||
        a.doctor?.fullName ||
        'Unknown';
      const departmentName =
        a.doctor?.department?.name ||
        a.doctor?.departmentName ||
        a.dept ||
        '';
      const paidStatus = a.bill?.status === 'PAID' || a.paid === true;
      const sourceLabel = a.source === 'WEB' ? 'web' : 'staff';
      const statusMap = {
        SCHEDULED: 'Booked',
        CONFIRMED: 'Booked',
        CHECKED_IN: 'Checked-in',
        IN_PROGRESS: 'In progress',
        COMPLETED: 'Completed',
        NO_SHOW: 'No-show',
        CANCELLED: 'Cancelled',
      };
      const mappedStatus = statusMap[a.status] || a.status || 'Booked';
      const timeStr = a.time
        ? new Date(`2000-01-01T${a.time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : a.date
        ? new Date(a.date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : '--';

      return {
        id: a.id,
        token: a.tokenNumber || a.token || 'T-' + String(a.id).slice(-3),
        patient: patientName,
        doctor: doctorName,
        dept: departmentName,
        time: timeStr,
        source: sourceLabel,
        status: mappedStatus,
        fee: a.fee || a.consultationFee || 0,
        paid: paidStatus,
      };
    });
  };

  const todaysAppointments = convertAppointmentsToTableData(appointments);

  const convertDoctorLoadForBarList = (load) => {
    if (!Array.isArray(load)) return [];
    return load.map((item) => ({
      name: item.doctorName || item.name || 'Unknown',
      dept: item.specialization || item.dept || '',
      count: item.appointmentCount || item.count || 0,
      initials: getInitials(item.doctorName || item.name || 'U'),
    }));
  };

  const doctorLoad = convertDoctorLoadForBarList(doctorLoadData);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <Link to="/admin/doctors" className="btn btn-primary btn-sm">
            <CalendarPlus className="h-4 w-4" /> New appointment
          </Link>
        </div>
      </div>

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

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Revenue trend"
          subtitle="Online vs cash · last 14 days"
          action={
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" /> Live data
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
          {revenueTrend.length > 0 ? (
            <AreaChart data={revenueTrend} />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              No revenue data available for this period
            </div>
          )}
        </SectionCard>

        <SectionCard title="Booking source" subtitle="Public website vs staff">
          <DonutChart data={bookingSource} centerLabel="bookings" centerValue={bookingSource.reduce((s, d) => s + d.value, 0)} />
          <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50">
            <span className="font-semibold text-primary-700 dark:text-primary-300">Live</span> booking source breakdown from
            patient and staff portals.
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Recent appointments"
          subtitle={`${todaysAppointments.length} of ${appointments.length} shown`}
          bodyClassName="p-0"
          action={
            <Link to="/staff/appointments" className="flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-300">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {todaysAppointments.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              No appointments available
            </div>
          ) : (
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
          )}
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

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Doctor load" subtitle="Patients seen this week">
          {doctorLoad.length > 0 ? (
            <BarList items={doctorLoad} unit="pts" />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">
              No doctor load data available
            </div>
          )}
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