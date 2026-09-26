import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Clock, User, MapPin, CheckCircle, AlertCircle, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/authHooks';
import { getAppointments, cancelAppointment } from '../../../services/appointmentService';
import toast from 'react-hot-toast';

const PatientAppointments = () => {
  const { user: reduxUser } = useAppSelector((s) => s.auth);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const user = reduxUser || storedUser;
  const patientId = user?.patientId || user?.profile?.patientId || user?.id;

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const all = await getAppointments();
      const list = Array.isArray(all?.appointments) ? all.appointments : Array.isArray(all) ? all : [];
      const filtered = patientId
        ? list.filter((a) => String(a.patientId) === String(patientId) || a.patient?.id === patientId)
        : list;
      setAppointments(filtered);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const handleCancel = async (apt) => {
    const id = apt.id || apt._id;
    if (!window.confirm(`Cancel appointment ${apt.id || apt.appointmentToken || ''}?`)) return;
    try {
      await cancelAppointment(id, 'Patient requested cancellation');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const { upcoming, past } = useMemo(() => {
    const up = [];
    const pa = [];
    appointments.forEach((a) => {
      const status = (a.status || '').toUpperCase();
      const aptDate = (a.date || '').toString().split('T')[0];
      const isPastDate = aptDate && aptDate < todayStr;
      const isCancelled = status === 'CANCELED' || status === 'CANCELLED';
      const isCompleted = status === 'COMPLETED' || status === 'DONE' || status === 'CHECKED_OUT';
      if (isCancelled || isCompleted || isPastDate) {
        pa.push(a);
      } else {
        up.push(a);
      }
    });
    return { upcoming: up, past: pa };
  }, [appointments, todayStr]);

  const nextActiveToken = upcoming.find((a) => (a.status || '').toUpperCase() === 'SCHEDULED' || (a.status || '').toUpperCase() === 'ARRIVED');

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'SCHEDULED' || s === 'BOOKED' || s === 'CONFIRMED') {
      return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Confirmed</span>;
    }
    if (s === 'ARRIVED' || s === 'CHECKED_IN' || s === 'IN_PROGRESS') {
      return <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">Arrived</span>;
    }
    if (s === 'COMPLETED' || s === 'DONE') {
      return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">Completed</span>;
    }
    if (s === 'CANCELED' || s === 'CANCELLED') {
      return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Cancelled</span>;
    }
    if (s === 'NO_SHOW') {
      return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">No-Show</span>;
    }
    return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Scheduled</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {nextActiveToken && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-teal-700 p-6 text-white shadow-lg">
          <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                Live Token Active
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold">Token #{nextActiveToken.token || nextActiveToken.appointmentToken || nextActiveToken.id}</h2>
              <p className="mt-1 text-sm text-teal-100">
                {nextActiveToken.doctor?.name || nextActiveToken.doctor?.fullName || 'Doctor'} · {nextActiveToken.department || nextActiveToken.departmentId || ''} · Est. Time: <span className="font-semibold text-white">{nextActiveToken.time || 'TBD'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center backdrop-blur">
                <p className="text-xs text-teal-100">Current Token Calling</p>
                <p className="font-mono text-xl font-bold">{nextActiveToken.token || nextActiveToken.appointmentToken || 'TK-'}</p>
              </div>
              <Link
                to="/book"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 shadow hover:bg-slate-50"
              >
                Book New
              </Link>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">Upcoming Appointments</h3>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <Calendar className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No upcoming appointments.</p>
            <Link to="/book" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
              Book an appointment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((apt) => (
              <div
                key={apt.id || apt._id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-400">{apt.id || apt._id}</span>
                    {getStatusBadge(apt.status)}
                  </div>
                  <h4 className="mt-3 font-bold text-slate-900 dark:text-white">{apt.doctor?.name || apt.doctor?.fullName || apt.doctorName || 'Doctor'}</h4>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{apt.doctor?.specialty || apt.department || apt.departmentId || ''}</p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{new Date(apt.date || Date.now()).toLocaleDateString()} at {apt.time || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{apt.hospital || apt.location || 'Hospital'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500">Token: <strong className="text-slate-900 dark:text-white">{apt.token || apt.appointmentToken || apt.id}</strong></span>
                  <button
                    onClick={() => handleCancel(apt)}
                    className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400 inline-flex items-center gap-1"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Cancel Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">Past Visit History</h3>
        {past.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            No past visits yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {past.map((past) => (
                <div key={past.id || past._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{past.doctor?.name || past.doctor?.fullName || past.doctorName || 'Doctor'}</p>
                    <p className="text-xs text-slate-500">{past.doctor?.specialty || past.department || ''} · {new Date(past.date || Date.now()).toLocaleDateString()}</p>
                    {past.prescription && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Prescription:</span> {past.prescription}
                      </p>
                    )}
                    {past.notes && !past.prescription && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Notes:</span> {past.notes}
                      </p>
                    )}
                  </div>
                  {((past.status || '').toUpperCase() === 'COMPLETED' || (past.status || '').toUpperCase() === 'DONE') ? (
                    <span className="inline-flex self-start sm:self-center items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Completed
                    </span>
                  ) : ((past.status || '').toUpperCase() === 'CANCELED' || (past.status || '').toUpperCase() === 'CANCELLED') ? (
                    <span className="inline-flex self-start sm:self-center items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
                      <XCircle className="h-3.5 w-3.5" /> Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex self-start sm:self-center items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> {(past.status || 'Past').replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;