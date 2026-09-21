import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  CalendarDays,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  FileText,
  PhoneCall,
  MessageSquare,
  X,
} from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import StatusPill from '../../../components/sections/StatusPill';
import { cancelAppointment, getAppointments, updateAppointment } from '../../../services/appointmentService.js';
import toast from 'react-hot-toast';

const fallbackAppointments = [
  { id: 'A-1042', date: 'Today', time: '10:00 AM', token: 'C-07', patient: 'Anita Shrestha', age: 34, gender: 'Female', type: 'Follow-up', notes: 'Hypertension review, BP 142/90 last visit', status: 'In progress', fee: 1500, paid: true, phone: '+977 98•••231' },
  { id: 'A-1043', date: 'Today', time: '10:30 AM', token: 'C-08', patient: 'Prakash Rai', age: 41, gender: 'Male', type: 'New consult', notes: 'Chest pain x 3 days, on exertion', status: 'Checked-in', fee: 1500, paid: false, phone: '+977 98•••114' },
  { id: 'A-1044', date: 'Today', time: '11:00 AM', token: 'C-09', patient: 'Bina Tamang', age: 28, gender: 'Female', type: 'Check-up', notes: 'Annual cardiac health review', status: 'Booked', fee: 1500, paid: true, phone: '+977 98•••702' },
  { id: 'A-1045', date: 'Today', time: '11:30 AM', token: 'C-10', patient: 'Suresh Magar', age: 52, gender: 'Male', type: 'Report review', notes: 'ECG + Stress test reports review', status: 'Booked', fee: 2000, paid: true, phone: '+977 98•••556' },
  { id: 'A-1046', date: 'Today', time: '12:00 PM', token: 'C-11', patient: 'Gita Lama', age: 6, gender: 'Female', type: 'Referral', notes: 'Referred by Pediatrics - murmur noted', status: 'Booked', fee: 1500, paid: false, phone: '+977 98•••889' },
  { id: 'A-1047', date: 'Today', time: '01:15 PM', token: 'C-12', patient: 'Rajan Thapa', age: 45, gender: 'Male', type: 'Follow-up', notes: 'BP monitoring - on Telmisartan 40mg', status: 'Completed', fee: 1500, paid: true, phone: '+977 98•••037' },
  { id: 'A-1048', date: 'Today', time: '01:45 PM', token: 'C-13', patient: 'Sarita Gurung', age: 39, gender: 'Female', type: 'Follow-up', notes: 'Postpartum cardiac follow-up', status: 'Confirmed', fee: 1500, paid: true, phone: '+977 98•••420' },
  { id: 'A-1049', date: 'Today', time: '02:30 PM', token: 'C-14', patient: 'Kamal Bhandari', age: 61, gender: 'Male', type: 'Follow-up', notes: 'Post-angio check at 4 weeks', status: 'Confirmed', fee: 1500, paid: false, phone: '+977 98•••318' },
  { id: 'A-1050', date: 'Tomorrow', time: '09:30 AM', token: 'C-15', patient: 'Meera Karki', age: 32, gender: 'Female', type: 'New consult', notes: 'Palpitations for 2 weeks', status: 'Booked', fee: 1500, paid: true, phone: '+977 98•••122' },
  { id: 'A-1051', date: 'Tomorrow', time: '10:15 AM', token: 'C-16', patient: 'Arjun Adhikari', age: 49, gender: 'Male', type: 'Follow-up', notes: 'Lipid profile review', status: 'Booked', fee: 1500, paid: false, phone: '+977 98•••777' },
  { id: 'A-1052', date: 'Tomorrow', time: '11:00 AM', token: 'C-17', patient: 'Rupa Basnet', age: 56, gender: 'Female', type: 'Report review', notes: '2D Echo report review', status: 'Rescheduled', fee: 2000, paid: true, phone: '+977 98•••909' },
  { id: 'A-1038', date: 'Yesterday', time: '11:00 AM', token: 'C-02', patient: 'Hari Sharma', age: 54, gender: 'Male', type: 'Follow-up', notes: 'DM + HTN — adjusted meds', status: 'Completed', fee: 1500, paid: true, phone: '+977 98•••010' },
  { id: 'A-1039', date: 'Yesterday', time: '02:00 PM', token: 'C-04', patient: 'Laxmi KC', age: 48, gender: 'Female', type: 'New consult', notes: '-', status: 'Cancelled', fee: 1500, paid: false, phone: '+977 98•••202' },
];

const tabs = ['All', 'Today', 'Tomorrow', 'Upcoming', 'Completed', 'Cancelled'];
const filters = ['All types', 'New consult', 'Follow-up', 'Report review', 'Check-up', 'Referral'];

const DoctorAppointments = () => {
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [search, setSearch] = useState('');
  const [rescheduleOpen, setRescheduleOpen] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState({ date: '', time: '' });

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const result = await getAppointments({ limit: 100 });
        const rows = (result.appointments || result || []).map((appointment) => ({
          ...appointment,
          patient: appointment.patient?.user?.fullName || 'Unknown patient',
          phone: appointment.patient?.user?.phone || '—',
          date: new Date(appointment.date).toLocaleDateString() === new Date().toLocaleDateString()
            ? 'Today'
            : new Date(appointment.date).toLocaleDateString(),
          status: appointment.status?.replace('_', ' ') || 'Booked',
          type: appointment.type || 'Consultation',
          notes: appointment.notes || appointment.symptoms?.join(', ') || '-',
          fee: appointment.fee || 0,
          paid: appointment.paid ?? false,
        }));
        setAppointmentsData(rows);
      } catch (error) {
        setAppointmentsData(fallbackAppointments);
        toast.error(error.response?.data?.message || 'Could not load appointments');
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, []);

  const handleCancel = async (appointment) => {
    try {
      const reason = window.prompt('Cancellation reason');
      if (!reason) return;
      const updated = await cancelAppointment(appointment.id, reason);
      setAppointmentsData((current) => current.map((item) => item.id === appointment.id ? { ...item, ...updated, status: 'CANCELLED' } : item));
      toast.success('Appointment cancelled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not cancel appointment');
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleOpen || !rescheduleTime.date || !rescheduleTime.time) return;
    try {
      const updated = await updateAppointment(rescheduleOpen, {
        date: new Date(`${rescheduleTime.date}T00:00:00`).toISOString(),
        time: rescheduleTime.time,
      });
      setAppointmentsData((current) => current.map((item) => item.id === rescheduleOpen ? { ...item, ...updated, date: rescheduleTime.date, time: rescheduleTime.time } : item));
      setRescheduleOpen(null);
      toast.success('Appointment rescheduled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not reschedule appointment');
    }
  };

  const filtered = appointmentsData.filter((a) => {
    if (activeTab === 'Today' && a.date !== 'Today') return false;
    if (activeTab === 'Tomorrow' && a.date !== 'Tomorrow') return false;
    if (activeTab === 'Upcoming' && !['Today', 'Tomorrow'].includes(a.date) && a.status !== 'Completed' && a.status !== 'Cancelled') return false;
    if (activeTab === 'Completed' && a.status !== 'Completed') return false;
    if (activeTab === 'Cancelled' && a.status !== 'Cancelled') return false;
    if (typeFilter !== 'All types' && a.type !== typeFilter) return false;
    if (search && !a.patient.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    All: appointmentsData.length,
    Today: appointmentsData.filter((a) => a.date === 'Today').length,
    Tomorrow: appointmentsData.filter((a) => a.date === 'Tomorrow').length,
    Upcoming: appointmentsData.filter((a) => ['Today', 'Tomorrow'].includes(a.date) || !['Completed', 'Cancelled'].includes(a.status)).length,
    Completed: appointmentsData.filter((a) => a.status === 'Completed').length,
    Cancelled: appointmentsData.filter((a) => a.status === 'Cancelled').length,
  };

  const totalEarned = appointmentsData.filter((a) => a.status === 'Completed').reduce((s, a) => s + a.fee, 0);
  const pendingCount = appointmentsData.filter((a) => a.paid === false && a.status !== 'Cancelled').length;

  return (
    <div className="space-y-6">
      {/* Stats strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Scheduled', value: filtered.filter((a) => ['Booked', 'Confirmed', 'Checked-in', 'In progress'].includes(a.status)).length, tone: 'from-primary-500 to-primary-700' },
          { label: 'Earned (Completed)', value: 'Rs. ' + totalEarned.toLocaleString('en-IN'), tone: 'from-emerald-500 to-emerald-700' },
          { label: 'Unpaid visits', value: pendingCount, tone: 'from-rose-500 to-rose-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-r ${s.tone} p-5 text-white shadow-md`}>
            <p className="text-xs font-semibold text-white/80">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === t
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {t}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === t ? 'bg-white/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                }`}
              >
                {counts[t] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient name…"
              className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {filters.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments list */}
      <SectionCard title={`Appointments (${filtered.length})`} subtitle={loading ? 'Loading appointments...' : 'Click on a row to see full details'} bodyClassName="p-0">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            <CalendarDays className="mx-auto h-10 w-10 mb-3 text-slate-300 dark:text-slate-700" />
            No appointments match your filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/70">
            {filtered.map((apt) => (
              <div key={apt.id} className="group flex flex-col gap-4 p-5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center dark:hover:bg-slate-800/40">
                <div className="flex items-start gap-4 sm:w-64 sm:shrink-0">
                  <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 w-16 text-center dark:border-slate-800 dark:bg-slate-900">
                    <CalendarDays className="h-4 w-4 text-primary-600" />
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{apt.date}</p>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">{apt.token}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {apt.time}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">{apt.patient}</p>
                      <p className="text-xs text-slate-500">{apt.gender} · {apt.age} yrs · {apt.phone} · Fee Rs. {apt.fee}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!apt.paid && apt.status !== 'Cancelled' && (
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">UNPAID</span>
                      )}
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        apt.type === 'New consult' ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' :
                        apt.type === 'Follow-up' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' :
                        apt.type === 'Report review' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>{apt.type}</span>
                      <StatusPill status={apt.status} />
                    </div>
                  </div>
                  {apt.notes && apt.notes !== '-' && (
                    <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                      <strong className="text-slate-800 dark:text-slate-200">Clinical notes:</strong> {apt.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
                    <FileText className="h-3.5 w-3.5" /> Chart
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
                    <PhoneCall className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                  {apt.status === 'Booked' || apt.status === 'Confirmed' ? (
                    <div className="relative">
                      <details className="group/details">
                        <summary className="list-none cursor-pointer flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </summary>
                        <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                          <button onClick={() => { setRescheduleOpen(apt.id); setRescheduleTime({ date: '', time: '' }); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/70">
                            <Clock className="h-3.5 w-3.5" /> Reschedule
                          </button>
                          <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark complete
                          </button>
                          <button onClick={() => handleCancel(apt)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20">
                            <XCircle className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      </details>
                    </div>
                  ) : (
                    <button className="flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Reschedule modal */}
      {rescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Reschedule Appointment</h3>
              <button onClick={() => setRescheduleOpen(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">New Date</label>
                <input type="date" value={rescheduleTime.date} onChange={(e) => setRescheduleTime({ ...rescheduleTime, date: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">New Time</label>
                <input type="time" value={rescheduleTime.time} onChange={(e) => setRescheduleTime({ ...rescheduleTime, time: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button onClick={() => setRescheduleOpen(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">Cancel</button>
                <button onClick={handleReschedule} className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white">Reschedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;