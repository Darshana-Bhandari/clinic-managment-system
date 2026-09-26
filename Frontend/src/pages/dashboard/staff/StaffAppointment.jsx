import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Search, Filter, CalendarPlus, Globe, Building2, X, CheckCircle2, LogIn, CalendarClock, Loader2, Clock, CalendarDays } from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import StatusPill from '../../../components/sections/StatusPill';
import { currency } from '../../../utils/dashboardData';
import { getAppointments, bookAppointment, updateAppointment, cancelAppointment } from '../../../services/appointmentService';
import toast from 'react-hot-toast';

const tabs = ['All', 'Booked', 'Checked-in', 'In progress', 'Completed', 'No-show'];

const API_STATUS_TO_DISPLAY = {
  SCHEDULED: 'Booked',
  BOOKED: 'Booked',
  CONFIRMED: 'Booked',
  PENDING: 'Booked',
  ARRIVED: 'Checked-in',
  CHECKED_IN: 'Checked-in',
  CHECKEDIN: 'Checked-in',
  IN_PROGRESS: 'In progress',
  INPROGRESS: 'In progress',
  CONSULTING: 'In progress',
  COMPLETED: 'Completed',
  DONE: 'Completed',
  CHECKED_OUT: 'Completed',
  NO_SHOW: 'No-show',
  NOSHOW: 'No-show',
  CANCELED: 'Cancelled',
  CANCELLED: 'Cancelled',
};

const displayToApiStatus = (display) => {
  if (display === 'Booked') return ['SCHEDULED', 'BOOKED', 'CONFIRMED', 'PENDING'];
  if (display === 'Checked-in') return ['ARRIVED', 'CHECKED_IN', 'CHECKEDIN'];
  if (display === 'In progress') return ['IN_PROGRESS', 'INPROGRESS', 'CONSULTING'];
  if (display === 'Completed') return ['COMPLETED', 'DONE', 'CHECKED_OUT'];
  if (display === 'No-show') return ['NO_SHOW', 'NOSHOW'];
  return [];
};

const StaffAppointments = () => {
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const [formData, setFormData] = useState({
    patient: '',
    doctor: 'Dr. Ram Sharma (Cardiology)',
    time: '11:00 AM',
    date: new Date().toISOString().split('T')[0],
    fee: '1500',
    departmentId: '',
    patientId: '',
  });

  const fetchAllAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const data = await getAppointments({ date: today });
      const list = Array.isArray(data?.appointments) ? data.appointments : Array.isArray(data) ? data : [];
      const normalized = list.map(normalizeApt);
      setAppointmentsList(normalized);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  const normalizeApt = (a) => ({
    ...a,
    id: a.id || a._id || a.appointmentId,
    token: a.token || a.appointmentToken || a.id,
    patient: a.patient?.name || a.patient?.fullName || a.patientName || a.patient || 'Unknown',
    doctor: a.doctor?.name || a.doctor?.fullName || a.doctorName || a.doctor || 'Unassigned',
    dept: a.department?.name || a.departmentId || a.dept || 'General',
    time: a.time || a.slot || '--:--',
    date: a.date || new Date().toISOString().split('T')[0],
    source: a.source || (a.bookedByStaff ? 'staff' : 'web'),
    fee: Number(a.fee || a.consultationFee || a.totalAmount || 0),
    status: API_STATUS_TO_DISPLAY[(a.status || '').toUpperCase()] || a.status || 'Booked',
  });

  const rows = useMemo(
    () =>
      appointmentsList.filter((a) => {
        const matchTab =
          tab === 'All' ||
          (() => {
            const apiStatuses = displayToApiStatus(tab);
            if (apiStatuses.length === 0) return a.status === tab;
            return a.status === tab;
          })();
        const q = query.trim().toLowerCase();
        const matchQuery =
          !q ||
          String(a.patient || '').toLowerCase().includes(q) ||
          String(a.doctor || '').toLowerCase().includes(q) ||
          String(a.id || '').toLowerCase().includes(q);
        return matchTab && matchQuery;
      }),
    [tab, query, appointmentsList]
  );

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!formData.patient) return;
    try {
      setIsSubmitting(true);
      const [docName, deptRaw] = formData.doctor.split(' (');
      const dept = deptRaw ? deptRaw.replace(')', '') : 'General';
      const payload = {
        doctorId: formData.doctorId || docName,
        patientId: formData.patientId || formData.patient,
        patientName: formData.patient,
        date: formData.date,
        time: formData.time,
        departmentId: formData.departmentId || dept,
        fee: Number(formData.fee) || 1500,
        source: 'staff',
        notes: 'Booked by staff at reception',
      };
      const resp = await bookAppointment(payload);
      toast.success(`Appointment ${resp?.id || resp?.appointmentToken || ''} booked for ${formData.patient}!`);
      setIsModalOpen(false);
      setFormData({ patient: '', doctor: 'Dr. Ram Sharma (Cardiology)', time: '11:00 AM', date: new Date().toISOString().split('T')[0], fee: '1500', departmentId: '', patientId: '' });
      fetchAllAppointments();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (apt) => {
    const id = apt.id || apt._id;
    try {
      await updateAppointment(id, { status: 'ARRIVED', checkedInAt: new Date().toISOString() });
      toast.success(`Patient ${apt.patient} checked in (token ${apt.token})`);
      fetchAllAppointments();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to check-in');
    }
  };

  const handleCancel = async (apt) => {
    const id = apt.id || apt._id;
    if (!window.confirm(`Cancel appointment ${apt.id} (${apt.patient})?`)) return;
    try {
      await cancelAppointment(id, 'Cancelled by staff');
      toast.success(`Appointment ${apt.id} cancelled`);
      fetchAllAppointments();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to cancel');
    }
  };

  const openReschedule = (apt) => {
    setRescheduleModal(apt);
    setRescheduleDate(apt.date || new Date().toISOString().split('T')[0]);
    setRescheduleTime(apt.time || '');
  };

  const submitReschedule = async () => {
    if (!rescheduleModal) return;
    const id = rescheduleModal.id || rescheduleModal._id;
    try {
      await updateAppointment(id, { date: rescheduleDate, time: rescheduleTime, status: 'SCHEDULED' });
      toast.success(`Appointment ${rescheduleModal.id} rescheduled to ${rescheduleDate} ${rescheduleTime}`);
      setRescheduleModal(null);
      fetchAllAppointments();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to reschedule');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, doctor, or ID…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm flex items-center gap-1.5">
            <CalendarPlus className="h-4 w-4" /> New appointment
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <SectionCard bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">ID / Token</th>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Doctor</th>
                <th className="hidden px-5 py-3 font-semibold lg:table-cell">Source</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Time</th>
                <th className="px-5 py-3 font-semibold">Fee</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/70">
              {rows.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{a.id}</p>
                    <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-500 dark:bg-slate-800">
                      {a.token}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">{a.patient}</td>
                  <td className="hidden px-5 py-3 md:table-cell">
                    <p className="text-slate-700 dark:text-slate-300">{a.doctor}</p>
                    <p className="text-xs text-slate-400">{a.dept}</p>
                  </td>
                  <td className="hidden px-5 py-3 lg:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      {a.source === 'web' ? (
                        <Globe className="h-3.5 w-3.5 text-primary-500" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-sky-500" />
                      )}
                      {a.source === 'web' ? 'Website' : 'Staff'}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-slate-600 dark:text-slate-300 sm:table-cell">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {a.time}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">{currency(a.fee)}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={a.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {(a.status === 'Booked') && (
                        <button
                          title="Check-in"
                          onClick={() => handleCheckIn(a)}
                          className="rounded-lg border border-sky-200 bg-sky-50 p-1.5 text-sky-600 hover:bg-sky-100 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-400"
                        >
                          <LogIn className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(a.status !== 'Completed' && a.status !== 'Cancelled' && a.status !== 'No-show') && (
                        <button
                          title="Reschedule"
                          onClick={() => openReschedule(a)}
                          className="rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400"
                        >
                          <CalendarClock className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(a.status !== 'Completed' && a.status !== 'Cancelled' && a.status !== 'No-show') && (
                        <button
                          title="Cancel"
                          onClick={() => handleCancel(a)}
                          className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">
                    No appointments match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Book New Appointment</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  placeholder="Patient name or ID"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Select Doctor</label>
                <select
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Dr. Ram Sharma (Cardiology)">Dr. Ram Sharma (Cardiology)</option>
                  <option value="Dr. Sita Gurung (Dermatology)">Dr. Sita Gurung (Dermatology)</option>
                  <option value="Dr. Bijay Shrestha (Orthopedics)">Dr. Bijay Shrestha (Orthopedics)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Fee (NPR)</label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60 inline-flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isSubmitting ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-amber-500" /> Reschedule Appointment
              </h3>
              <button
                onClick={() => setRescheduleModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                <p className="font-semibold text-slate-900 dark:text-white">{rescheduleModal.patient}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {rescheduleModal.doctor} · {rescheduleModal.dept}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">New Time</label>
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  placeholder="e.g. 11:00 AM"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRescheduleModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReschedule}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 inline-flex items-center gap-1.5"
                >
                  <CalendarClock className="h-3.5 w-3.5" />
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAppointments;