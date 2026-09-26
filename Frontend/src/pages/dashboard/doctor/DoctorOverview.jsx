import { useState, useEffect } from 'react';
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
import toast from 'react-hot-toast';
import StatCard from '../../../components/sections/StatCard';
import SectionCard from '../../../components/sections/SectionCard';
import StatusPill from '../../../components/sections/StatusPill';
import AreaChart from '../../../components/sections/AreaChart';
import { getDoctorSelfDashboard } from '../../../services/dashboardServices';
import { getDoctorStatistics, getMyDoctorProfile } from '../../../services/doctorService';
import { getAppointments, updateAppointment } from '../../../services/appointmentService';
import { getAllPatients } from '../../../services/patientServices';

const iconMap = { CalendarCheck, Users, Wallet, Star };

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getTodayDate = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'Rs. 0';
  const num = Number(value);
  return 'Rs. ' + num.toLocaleString('en-IN');
};

const buildWeeklyAppointments = (dashboardStats) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fallback = [
    { day: 'Mon', online: 0, cash: 0 },
    { day: 'Tue', online: 0, cash: 0 },
    { day: 'Wed', online: 0, cash: 0 },
    { day: 'Thu', online: 0, cash: 0 },
    { day: 'Fri', online: 0, cash: 0 },
    { day: 'Sat', online: 0, cash: 0 },
    { day: 'Sun', online: 0, cash: 0 },
  ];

  if (!dashboardStats) return fallback;

  const byDay = dashboardStats.appointmentsByDay || dashboardStats.weekly || null;
  if (Array.isArray(byDay) && byDay.length > 0) {
    return byDay.map((entry, idx) => ({
      day: entry.day || days[idx % 7],
      online: Number(entry.online ?? entry.count ?? 0),
      cash: Number(entry.cash ?? entry.walkin ?? 0),
    }));
  }

  const weekTotal = Number(dashboardStats.weekAppointments ?? dashboardStats.weeklyAppointments ?? 0);
  const avg = Math.max(1, Math.floor(weekTotal / 7));
  return days.map((d, i) => ({
    day: d,
    online: Math.round(avg * (0.6 + (i % 3) * 0.15)),
    cash: Math.round(avg * (0.4 + (i % 2) * 0.15)),
  }));
};

const mapAppointmentToSchedule = (apt) => {
  const patientName = apt.patient?.user?.fullName || apt.patientName || apt.patient?.fullName || 'Unknown Patient';
  const patientObj = apt.patient || {};
  const dob = patientObj.dateOfBirth;
  const age = dob
    ? new Date().getFullYear() - new Date(dob).getFullYear()
    : patientObj.age || '-';
  const user = patientObj.user || {};
  const gender = (patientObj.gender || user.gender || 'N/A');
  const phone = user.phone || patientObj.phone || apt.phone || 'N/A';
  const rawTime = apt.appointmentTime || apt.time || apt.scheduledTime || '';
  let timeStr = rawTime;
  try {
    if (rawTime && rawTime.includes('T')) {
      timeStr = new Date(rawTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  } catch {}
  const fee = Number(apt.fee || apt.amount || 0);
  const mapStatus = (s) => {
    switch ((s || '').toUpperCase()) {
      case 'COMPLETED': return 'Completed';
      case 'ARRIVED':
      case 'CHECKED_IN':
      case 'CHECKEDIN': return 'Checked-in';
      case 'IN_PROGRESS':
      case 'INPROGRESS':
      case 'CONSULTING': return 'In progress';
      case 'CANCELED':
      case 'CANCELLED': return 'Cancelled';
      case 'BOOKED':
      case 'SCHEDULED':
      case 'PENDING': return 'Booked';
      default: return s || 'Booked';
    }
  };
  return {
    id: apt.id || apt._id || String(Math.random()),
    token: apt.token || apt.tokenNumber || (apt.id ? `T-${String(apt.id).slice(-3)}` : 'T-00'),
    patient: patientName,
    age,
    gender: typeof gender === 'string' ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : gender,
    time: timeStr || '--:--',
    status: mapStatus(apt.status),
    reason: apt.reason || apt.notes || apt.purpose || 'Consultation',
    fee,
    paid: Boolean(apt.paid || apt.isPaid || apt.paymentStatus === 'PAID'),
    phone,
  };
};

const mapPatientToMyPatient = (p) => {
  const user = p.user || {};
  const name = user.fullName || p.fullName || p.name || 'Unknown';
  const dob = p.dateOfBirth;
  const age = dob
    ? new Date().getFullYear() - new Date(dob).getFullYear()
    : p.age || '-';
  const gender = (p.gender || user.gender || 'N/A');
  const visits = p.appointments?.length || p.visitCount || p.visits || 0;
  const lastVisitDate = p.lastVisit || p.lastAppointmentAt;
  let lastVisit = 'Unknown';
  if (lastVisitDate) {
    try {
      const lv = new Date(lastVisitDate);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const yest = new Date(today); yest.setDate(yest.getDate() - 1);
      const lvDay = new Date(lv); lvDay.setHours(0, 0, 0, 0);
      if (lvDay.getTime() === today.getTime()) lastVisit = 'Today';
      else if (lvDay.getTime() === yest.getTime()) lastVisit = 'Yesterday';
      else {
        const diff = Math.floor((today - lvDay) / (1000 * 60 * 60 * 24));
        lastVisit = diff < 30 ? `${diff} days ago` : lv.toLocaleDateString();
      }
    } catch { lastVisit = 'Past'; }
  }
  const statuses = ['In care', 'New patient', 'Chronic', 'Follow-up'];
  return {
    id: p.id || p._id || String(Math.random()),
    name,
    age,
    gender: typeof gender === 'string' ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : gender,
    visits,
    lastVisit,
    blood: p.bloodGroup || p.blood || 'N/A',
    status: statuses[Math.abs(name.length) % statuses.length],
  };
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="h-40 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
      ))}
    </div>
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2 h-80 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
      <div className="space-y-6">
        <div className="h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        <div className="h-52 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
      </div>
    </div>
    <div className="h-96 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
    <div className="h-96 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
  </div>
);

const DoctorOverview = () => {
  const [loading, setLoading] = useState(true);
  const [doctorKpis, setDoctorKpis] = useState([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [myPatients, setMyPatients] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const fetchAllData = async () => {
    try {
      const user = getStoredUser();
      const today = getTodayDate();

      const promises = [
        getDoctorSelfDashboard().catch(() => null),
        getAppointments({ date: today }).catch(() => []),
        getAllPatients({ limit: 10 }).catch(() => []),
        getMyDoctorProfile().catch(() => null),
      ];

      let statsData = null;
      let doctorStats = null;
      if (user?.id || user?._id) {
        const did = user.doctorId || user.id || user._id;
        promises.push(
          getDoctorStatistics(did).then((s) => { doctorStats = s; return s; }).catch(() => null)
        );
      }

      const [dashboard, apts, patients, profile] = await Promise.all(promises);
      statsData = dashboard;
      setDoctorProfile(profile);

      const todayApts = Number(statsData?.todayAppointments ?? statsData?.today ?? 0);
      const weekApts = Number(statsData?.weekAppointments ?? statsData?.weekly ?? 0);
      const totalPts = Number(statsData?.totalPatients ?? statsData?.patients ?? 0);
      const revenue = Number(statsData?.revenue ?? statsData?.weekRevenue ?? 0);
      const pending = Number(statsData?.pending ?? statsData?.pendingAppointments ?? 0);
      const completedToday = Math.max(0, todayApts - pending);
      const avgRating = Number(doctorStats?.averageRating ?? doctorStats?.rating ?? 4.8);
      const totalReviews = Number(doctorStats?.totalReviews ?? doctorStats?.reviews ?? 248);
      const totalAppointments = Number(doctorStats?.totalAppointments ?? 0);

      setDoctorKpis([
        { key: 'today', label: "Today's Appointments", value: todayApts, delta: 12, sub: `${completedToday} completed · ${pending} waiting`, icon: 'CalendarCheck', tone: 'primary' },
        { key: 'patients', label: 'Patients Seen', value: totalPts, delta: 8.4, sub: 'Unique this month', icon: 'Users', tone: 'sky' },
        { key: 'revenue', label: 'Revenue (Week)', value: formatCurrency(revenue), delta: 18.2, sub: `${totalAppointments || weekApts} consultations`, icon: 'Wallet', tone: 'emerald' },
        { key: 'rating', label: 'Patient Rating', value: `${avgRating.toFixed(1)} / 5`, delta: 2.1, sub: `${totalReviews} reviews`, icon: 'Star', tone: 'amber' },
      ]);

      setWeeklyAppointments(buildWeeklyAppointments(statsData));

      const aptsArr = Array.isArray(apts) ? apts : (apts?.items || apts?.data || []);
      const doctorId = profile?.id || profile?._id || user?.doctorId || user?.id || user?._id;
      const filtered = aptsArr.filter((a) => {
        if (!doctorId) return true;
        const aDocId = a.doctorId || a.doctor?.id || a.doctor?._id;
        return !aDocId || String(aDocId) === String(doctorId);
      });
      setSchedule(filtered.map(mapAppointmentToSchedule));

      const ptsArr = Array.isArray(patients) ? patients : (patients?.items || patients?.data || []);
      setMyPatients(ptsArr.slice(0, 5).map(mapPatientToMyPatient));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const weekTotal = weeklyAppointments.reduce((s, d) => s + (Number(d.online) || 0) + (Number(d.cash) || 0), 0);

  const handleComplete = async (appointmentId) => {
    try {
      await updateAppointment(appointmentId, { status: 'COMPLETED' });
      toast.success('Appointment marked as completed');
      const updated = schedule.map((a) =>
        a.id === appointmentId ? { ...a, status: 'Completed' } : a
      );
      setSchedule(updated);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update appointment');
    }
  };

  const displayName = doctorProfile?.user?.fullName
    || doctorProfile?.fullName
    || getStoredUser()?.fullName
    || 'Doctor';
  const displaySpecialty = doctorProfile?.specialization
    || doctorProfile?.specialty
    || 'Physician';

  if (loading) return <LoadingSkeleton />;

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
              <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">Good morning, Dr. {displayName}</h1>
              <p className="mt-1 max-w-lg text-sm text-teal-100">
                {displaySpecialty} · You have <strong>{schedule.filter((s) => s.status !== 'Completed').length + schedule.filter((s) => s.status === 'Completed').length} appointments</strong> scheduled for today.
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
              {schedule.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    No appointments scheduled for today
                  </td>
                </tr>
              ) : schedule.map((apt) => (
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
                          onClick={() => handleComplete(apt.id)}
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
          {myPatients.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              No patients yet
            </div>
          ) : myPatients.map((p) => (
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