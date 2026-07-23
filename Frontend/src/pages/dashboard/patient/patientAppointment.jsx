import React from 'react';
import { Calendar, Clock, User, MapPin, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const patientAppointments = [
  {
    id: 'APT-1092',
    doctor: 'Dr. Ram Sharma',
    specialty: 'Cardiology',
    hospital: 'TU Teaching Hospital',
    date: 'Today, Oct 24',
    time: '10:30 AM',
    token: 'TK-042',
    status: 'Confirmed',
    type: 'In-Person',
    fee: 1500,
  },
  {
    id: 'APT-1088',
    doctor: 'Dr. Sita Gurung',
    specialty: 'Dermatology',
    hospital: 'Patan Hospital',
    date: 'Nov 02, 2026',
    time: '02:00 PM',
    token: 'TK-018',
    status: 'Scheduled',
    type: 'Follow-up',
    fee: 1200,
  },
];

const pastAppointments = [
  {
    id: 'APT-0941',
    doctor: 'Dr. Bijay Shrestha',
    specialty: 'Orthopedics',
    date: 'Sep 15, 2026',
    status: 'Completed',
    prescription: 'Painkiller 500mg, Calcium Tab',
  },
];

const PatientAppointments = () => {
  return (
    <div className="space-y-6">
      {/* Active Queue Token Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-teal-700 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              Live Token Active
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold">Token #TK-042</h2>
            <p className="mt-1 text-sm text-teal-100">
              Dr. Ram Sharma · Cardiology · Est. Time: <span className="font-semibold text-white">10:45 AM</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center backdrop-blur">
              <p className="text-xs text-teal-100">Current Token Calling</p>
              <p className="font-mono text-xl font-bold">TK-039</p>
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

      {/* Upcoming Appointments */}
      <div>
        <h3 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">Upcoming Appointments</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {patientAppointments.map((apt) => (
            <div
              key={apt.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-400">{apt.id}</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {apt.status}
                  </span>
                </div>
                <h4 className="mt-3 font-bold text-slate-900 dark:text-white">{apt.doctor}</h4>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{apt.specialty}</p>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{apt.date} at {apt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{apt.hospital}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500">Token: <strong className="text-slate-900 dark:text-white">{apt.token}</strong></span>
                <button className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400">
                  Cancel Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Visits */}
      <div>
        <h3 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">Past Visit History</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pastAppointments.map((past) => (
              <div key={past.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{past.doctor}</p>
                  <p className="text-xs text-slate-500">{past.specialty} · {past.date}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Prescription:</span> {past.prescription}
                  </p>
                </div>
                <span className="inline-flex self-start sm:self-center items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;