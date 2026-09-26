import { useState, useEffect } from 'react';
import {
  UserPlus,
  CalendarPlus,
  PhoneCall,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  X,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SectionCard from '../../../components/sections/SectionCard';
import StatusPill from '../../../components/sections/StatusPill';
import CustomDoctorSelect from '../../../components/ui/CustomDoctorSelect';
import { getDashboardStats, getDailySummary, getDoctorLoad } from '../../../services/dashboardServices';
import { getAllDoctors } from '../../../services/doctorService';
import { getAppointments, updateAppointment, bookAppointment } from '../../../services/appointmentService';
import { createPatient } from '../../../services/patientServices';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const formatCurrency = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

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
    case 'NO_SHOW':
    case 'NOSHOW': return 'No-show';
    case 'BOOKED':
    case 'SCHEDULED':
    case 'PENDING': return 'Booked';
    default: return s || 'Booked';
  }
};

const mapAppointment = (apt) => {
  const patientName = apt.patient?.user?.fullName || apt.patientName || apt.patient?.fullName || 'Unknown Patient';
  const doctorName = apt.doctor?.user?.fullName || apt.doctorName || apt.doctor?.fullName || 'Unassigned';
  const dept = apt.doctor?.specialization || apt.doctor?.specialty || apt.department || apt.dept || 'General';
  const rawTime = apt.appointmentTime || apt.time || apt.scheduledTime || '';
  let timeStr = rawTime;
  try {
    if (rawTime && rawTime.includes('T')) {
      timeStr = new Date(rawTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  } catch {}
  return {
    id: apt.id || apt._id || String(Math.random()),
    token: apt.token || apt.tokenNumber || (apt.id ? `TK-${String(apt.id).slice(-2).padStart(2, '0')}` : 'TK-00'),
    patient: patientName,
    doctor: doctorName,
    dept,
    time: timeStr || '--:--',
    source: apt.source || 'staff',
    status: mapStatus(apt.status),
    fee: Number(apt.fee || apt.amount || 0),
    paid: Boolean(apt.paid || apt.isPaid || apt.paymentStatus === 'PAID'),
  };
};

const buildQueueFromAppointments = (appointments, doctors) => {
  const byDoctor = {};
  appointments.forEach((a) => {
    const key = a.doctor || 'Unknown';
    if (!byDoctor[key]) {
      const doc = doctors.find((d) => (d.user?.fullName || d.fullName || d.name) === key);
      byDoctor[key] = {
        doctor: key,
        dept: doc?.specialization || doc?.specialty || a.dept || 'General',
        tokens: [],
      };
    }
    if (['Booked', 'Checked-in', 'In progress'].includes(a.status)) {
      byDoctor[key].tokens.push({ token: a.token, status: a.status });
    }
  });

  const result = [];
  const entries = Object.entries(byDoctor).slice(0, 6);
  entries.forEach(([doctor, data]) => {
    const tokens = data.tokens;
    const inProgress = tokens.find((t) => t.status === 'In progress');
    const checkedIn = tokens.find((t) => t.status === 'Checked-in');
    const firstBooked = tokens.find((t) => t.status === 'Booked');
    const current = inProgress?.token || checkedIn?.token || firstBooked?.token || `${doctor.split(' ')[1]?.[0] || 'D'}-01`;
    const waiting = tokens.filter((t) => t.token !== current).length;
    const eta = waiting > 0 ? `~${waiting * 8} min` : '~0 min';
    result.push({
      doctor,
      dept: data.dept,
      current,
      waiting,
      eta,
    });
  });

  if (result.length === 0) {
    doctors.slice(0, 3).forEach((doc, i) => {
      const name = doc.user?.fullName || doc.fullName || doc.name || `Doctor ${i + 1}`;
      result.push({
        doctor: name,
        dept: doc.specialization || doc.specialty || 'General',
        current: 'TK-01',
        waiting: 0,
        eta: '~0 min',
      });
    });
  }
  return result;
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="h-40 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
      ))}
    </div>
    <div className="h-64 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
    <div className="h-80 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
  </div>
);

const StaffOverview = () => {
  const [loading, setLoading] = useState(true);
  const [queueData, setQueueData] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [staffKpis, setStaffKpis] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    assignedDoctor: '',
  });

  const [aptForm, setAptForm] = useState({
    patient: '',
    doctor: '',
    time: '11:30 AM',
    fee: '1500',
  });

  const fetchAllData = async () => {
    try {
      const today = getTodayDate();
      const [
        dashboardStats,
        dailySummary,
        doctorLoadRaw,
        doctors,
        appointments,
      ] = await Promise.all([
        getDashboardStats().catch(() => null),
        getDailySummary().catch(() => null),
        getDoctorLoad().catch(() => []),
        getAllDoctors({ limit: 50 }).catch(() => []),
        getAppointments({ date: today }).catch(() => []),
      ]);

      const docsArr = Array.isArray(doctors) ? doctors : (doctors?.items || doctors?.data || []);
      setDoctorsList(docsArr);

      const firstDocName = docsArr[0]?.user?.fullName || docsArr[0]?.fullName || docsArr[0]?.name || '';
      setPatientForm((pf) => ({ ...pf, assignedDoctor: pf.assignedDoctor || firstDocName }));

      const aptDocOptions = docsArr.slice(0, 3).map((d) => {
        const name = d.user?.fullName || d.fullName || d.name;
        const spec = d.specialization || d.specialty || 'General';
        return `${name} (${spec})`;
      });
      if (aptDocOptions[0]) {
        setAptForm((af) => ({ ...af, doctor: af.doctor || aptDocOptions[0] }));
      }

      const aptsArr = Array.isArray(appointments) ? appointments : (appointments?.items || appointments?.data || []);
      const mappedApts = aptsArr.map(mapAppointment);
      setAppointmentsList(mappedApts);

      let queue;
      const loadArr = Array.isArray(doctorLoadRaw) ? doctorLoadRaw : (doctorLoadRaw?.items || doctorLoadRaw?.data || []);
      if (loadArr && loadArr.length > 0) {
        queue = loadArr.map((l, i) => ({
          doctor: l.doctor?.user?.fullName || l.doctor?.fullName || l.doctor?.name || l.name || `Doctor ${i + 1}`,
          dept: l.dept || l.department || l.specialization || l.specialty || 'General',
          current: l.currentToken || l.current || l.nowServing || `${(l.dept || 'D')[0]}-01`,
          waiting: Number(l.waiting ?? l.pending ?? l.queueCount ?? 0),
          eta: l.eta || (l.waiting ? `~${Math.max(1, l.waiting) * 8} min` : '~0 min'),
        }));
      } else {
        queue = buildQueueFromAppointments(mappedApts, docsArr);
      }
      setQueueData(queue);

      const todayApts = Number(dailySummary?.todayAppointments ?? dashboardStats?.todayAppointments ?? dashboardStats?.today ?? mappedApts.length);
      const totalDocs = Number(dashboardStats?.totalDoctors ?? docsArr.length);
      const queueCount = queue.reduce((s, q) => s + q.waiting, 0) || Number(dashboardStats?.queueCount ?? 0);
      const collection = Number(dailySummary?.collectionToday ?? dailySummary?.revenue ?? dashboardStats?.revenueToday ?? 0);
      const checkedIn = mappedApts.filter((a) => ['Checked-in', 'In progress'].includes(a.status)).length;

      setStaffKpis([
        { label: "Today's Appointments", val: todayApts, sub: '+12% from yesterday' },
        { label: 'Checked-in / Waiting', val: Math.max(checkedIn, queueCount), sub: 'Active in queue' },
        { label: 'Doctors On Duty', val: totalDocs, sub: 'Across departments' },
        { label: 'Collection Today', val: formatCurrency(collection), sub: 'Cash & Digital' },
      ]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load staff dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const showToast = (msg, duration = 3500) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), duration);
  };

  const handleCallNext = (index) => {
    const updated = [...queueData];
    const item = updated[index];
    if (!item) return;
    const currentNum = parseInt((item.current || '0').split('-')[1] || '0', 10);
    const prefix = (item.current || 'T').split('-')[0] || 'T';
    const nextToken = `${prefix}-${String(currentNum + 1).padStart(2, '0')}`;
    item.current = nextToken;
    if (item.waiting > 0) item.waiting -= 1;
    setQueueData(updated);
    showToast(`Token ${nextToken} called for ${item.doctor}!`);
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!patientForm.name || !patientForm.phone) return;

    try {
      const assignedDoc = doctorsList.find(
        (d) => (d.user?.fullName || d.fullName || d.name) === patientForm.assignedDoctor
      );

      const payload = {
        fullName: patientForm.name,
        phone: patientForm.phone,
        gender: patientForm.gender?.toUpperCase() || 'MALE',
        dateOfBirth: patientForm.age && !isNaN(Number(patientForm.age))
          ? new Date(new Date().getFullYear() - Number(patientForm.age), 0, 1).toISOString()
          : undefined,
        doctorId: assignedDoc?.id || assignedDoc?._id || undefined,
      };

      await createPatient(payload);
      toast.success(`Patient ${patientForm.name} registered successfully!`);
      showToast(`Patient ${patientForm.name} registered and assigned to ${patientForm.assignedDoctor}!`, 4000);
      setIsRegisterOpen(false);
      setPatientForm({
        name: '',
        phone: '',
        age: '',
        gender: 'Male',
        assignedDoctor: patientForm.assignedDoctor,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to register patient');
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!aptForm.patient) return;

    try {
      const [docName, deptRaw] = aptForm.doctor.split(' (');
      const dept = deptRaw ? deptRaw.replace(')', '') : '';
      const matchedDoc = doctorsList.find((d) => {
        const name = d.user?.fullName || d.fullName || d.name;
        return name === docName || name === aptForm.doctor;
      });

      const today = getTodayDate();
      const [hoursPart, period] = aptForm.time.trim().split(' ');
      const [hh, mm] = hoursPart.split(':');
      let dateTimeStr = today;
      if (hh && mm) {
        let h24 = parseInt(hh, 10);
        if (period === 'PM' && h24 < 12) h24 += 12;
        if (period === 'AM' && h24 === 12) h24 = 0;
        dateTimeStr = `${today}T${String(h24).padStart(2, '0')}:${mm}:00`;
      }

      const payload = {
        patientName: aptForm.patient,
        doctorId: matchedDoc?.id || matchedDoc?._id || undefined,
        doctorName: docName || aptForm.doctor,
        department: dept || undefined,
        appointmentTime: dateTimeStr,
        fee: Number(aptForm.fee) || 1500,
        status: 'BOOKED',
        source: 'staff',
      };

      const created = await bookAppointment(payload);
      const newApt = mapAppointment(created || {
        ...payload,
        id: created?.id || `APT-${Date.now()}`,
        token: created?.token || `TK-${Math.floor(Math.random() * 90) + 10}`,
      });
      setAppointmentsList([newApt, ...appointmentsList]);
      toast.success(`New appointment created for ${aptForm.patient}!`);
      showToast(`New appointment ${newApt.id} created for ${newApt.patient}!`, 4000);
      setIsAptModalOpen(false);
      setAptForm({ patient: '', doctor: aptForm.doctor, time: '11:30 AM', fee: '1500' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create appointment');
    }
  };

  const handleMarkArrived = async (aptId) => {
    try {
      await updateAppointment(aptId, { status: 'ARRIVED' });
      toast.success('Patient marked as arrived');
      setAppointmentsList((list) =>
        list.map((a) => (a.id === aptId ? { ...a, status: 'Checked-in' } : a))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update appointment');
    }
  };

  const handleMarkCanceled = async (aptId) => {
    try {
      await updateAppointment(aptId, { status: 'CANCELED' });
      toast.success('Appointment canceled');
      setAppointmentsList((list) =>
        list.map((a) => (a.id === aptId ? { ...a, status: 'Cancelled' } : a))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Welcome Banner & Quick Action Buttons */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-teal-700 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Activity className="h-3.5 w-3.5 text-emerald-300" /> Hospital Staff Portal Active
            </span>
            <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">Reception & Operations Control</h1>
            <p className="mt-1 max-w-lg text-sm text-teal-100">
              Manage patient walk-ins, live token queues, doctor appointments, and billing in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-primary-800 shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <UserPlus className="h-4 w-4 text-primary-600" /> Register Patient
            </button>
            <button
              onClick={() => setIsAptModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-500/30 px-4 py-2.5 text-xs font-bold text-white backdrop-blur border border-white/20 hover:bg-teal-500/40"
            >
              <CalendarPlus className="h-4 w-4" /> New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {staffKpis.map((k) => (
          <div
            key={k.label}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{k.label}</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-slate-900 dark:text-white">{k.val}</p>
              <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">{k.sub}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Activity className="h-6 w-6" />
            </span>
          </div>
        ))}
      </div>

      {/* Live Queue Overview Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Active Queue Tokens</h2>
            <p className="text-xs text-slate-500">Live token status broadcasted to patient mobile apps</p>
          </div>
          <Link to="/staff/queue" className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline dark:text-primary-400">
            View Full Queue <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {queueData.length === 0 ? (
            <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
              No active queue tokens for today
            </div>
          ) : queueData.map((q, idx) => (
            <SectionCard key={q.doctor + idx} title={q.doctor} subtitle={q.dept}>
              <div className="rounded-xl bg-slate-900 p-4 text-center text-white dark:bg-slate-950">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Now Serving</p>
                <p className="font-mono text-3xl font-bold text-emerald-400">{q.current}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Waiting: <strong className="text-slate-900 dark:text-white">{q.waiting}</strong></span>
                <span>Est. Wait: <strong className="text-slate-900 dark:text-white">{q.eta}</strong></span>
              </div>
              <button
                onClick={() => handleCallNext(idx)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-600 py-2 text-xs font-bold text-white hover:bg-primary-700"
              >
                <PhoneCall className="h-3.5 w-3.5" /> Call Token
              </button>
            </SectionCard>
          ))}
        </div>
      </div>

      {/* Today's Appointments Table */}
      <SectionCard title="Today's Appointments" subtitle="Quick view of today's patient schedule">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-4 py-2.5 font-semibold">Token</th>
                <th className="px-4 py-2.5 font-semibold">Patient</th>
                <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Doctor</th>
                <th className="px-4 py-2.5 font-semibold">Time</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/70">
              {appointmentsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    No appointments for today
                  </td>
                </tr>
              ) : appointmentsList.slice(0, 5).map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700 dark:text-slate-200">{a.token}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{a.patient}</td>
                  <td className="hidden px-4 py-3 text-slate-600 sm:table-cell dark:text-slate-300">{a.doctor}</td>
                  <td className="px-4 py-3 text-slate-500">{a.time}</td>
                  <td className="px-4 py-3"><StatusPill status={a.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {['Booked'].includes(a.status) && (
                        <button
                          onClick={() => handleMarkArrived(a.id)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Arrived
                        </button>
                      )}
                      {['Booked', 'Checked-in'].includes(a.status) && (
                        <button
                          onClick={() => handleMarkCanceled(a.id)}
                          className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Register Patient Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Register Patient</h3>
              <button onClick={() => setIsRegisterOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterPatient} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  placeholder="Patient Full Name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={patientForm.phone}
                  onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Age</label>
                  <input
                    type="number"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                    placeholder="Age"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Gender</label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <CustomDoctorSelect
                value={patientForm.assignedDoctor}
                onChange={(val) => setPatientForm({ ...patientForm, assignedDoctor: val })}
              />
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button type="button" onClick={() => setIsRegisterOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {isAptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Book Appointment</h3>
              <button onClick={() => setIsAptModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAppointment} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={aptForm.patient}
                  onChange={(e) => setAptForm({ ...aptForm, patient: e.target.value })}
                  placeholder="Patient Name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Doctor</label>
                <select
                  value={aptForm.doctor}
                  onChange={(e) => setAptForm({ ...aptForm, doctor: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {doctorsList.slice(0, 10).map((d) => {
                    const name = d.user?.fullName || d.fullName || d.name;
                    const spec = d.specialization || d.specialty || 'General';
                    const label = `${name} (${spec})`;
                    return <option key={d.id || d._id || name} value={label}>{label}</option>;
                  })}
                  {doctorsList.length === 0 && (
                    <>
                      <option value="Dr. Ram Sharma (Cardiology)">Dr. Ram Sharma (Cardiology)</option>
                      <option value="Dr. Sita Gurung (Dermatology)">Dr. Sita Gurung (Dermatology)</option>
                      <option value="Dr. Bijay Shrestha (Orthopedics)">Dr. Bijay Shrestha (Orthopedics)</option>
                    </>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Time</label>
                  <select
                    value={aptForm.time}
                    onChange={(e) => setAptForm({ ...aptForm, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Fee (Rs.)</label>
                  <input
                    type="number"
                    value={aptForm.fee}
                    onChange={(e) => setAptForm({ ...aptForm, fee: e.target.value })}
                    placeholder="1500"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button type="button" onClick={() => setIsAptModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white">
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOverview;