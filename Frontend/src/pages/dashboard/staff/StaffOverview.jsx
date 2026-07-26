import { useState } from 'react';
import {
  Users,
  CalendarDays,
  ListOrdered,
  Receipt,
  UserPlus,
  CalendarPlus,
  PhoneCall,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Search,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionCard from '../../../components/sections/SectionCard';
import StatusPill from '../../../components/sections/StatusPill';
import { staffKpis, todaysAppointments, liveQueue, currency } from '../../../utils/dashboardData';
import { doctorsData } from '../../../utils/dummyData';
import CustomDoctorSelect from '../../../components/ui/CustomDoctorSelect';

const StaffOverview = () => {
  const [queueData, setQueueData] = useState(liveQueue);
  const [appointmentsList, setAppointmentsList] = useState(todaysAppointments);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form states
  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    assignedDoctor: doctorsData[0]?.name || 'Dr. Ram Sharma',
  });

  const [aptForm, setAptForm] = useState({
    patient: '',
    doctor: 'Dr. Ram Sharma (Cardiology)',
    time: '11:30 AM',
    fee: '1500',
  });

  const handleCallNext = (index) => {
    const updated = [...queueData];
    const item = updated[index];
    const currentNum = parseInt(item.current.split('-')[1]);
    const nextToken = `${item.current.split('-')[0]}-${String(currentNum + 1).padStart(2, '0')}`;
    item.current = nextToken;
    if (item.waiting > 0) item.waiting -= 1;

    setQueueData(updated);
    setToastMsg(`Token ${nextToken} called for ${item.doctor}!`);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!patientForm.name || !patientForm.phone) return;

    const newId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
    setIsRegisterOpen(false);
    setToastMsg(`Patient ${patientForm.name} registered and assigned to ${patientForm.assignedDoctor}!`);
    setPatientForm({
      name: '',
      phone: '',
      age: '',
      gender: 'Male',
      assignedDoctor: doctorsData[0]?.name || 'Dr. Ram Sharma',
    });
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!aptForm.patient) return;

    const newId = `APT-${Math.floor(100 + Math.random() * 900)}`;
    const newToken = `TK-0${Math.floor(40 + Math.random() * 50)}`;
    const [docName, dept] = aptForm.doctor.split(' (');

    const newApt = {
      id: newId,
      token: newToken,
      patient: aptForm.patient,
      doctor: docName,
      dept: dept ? dept.replace(')', '') : 'General',
      source: 'staff',
      time: aptForm.time,
      fee: Number(aptForm.fee) || 1500,
      status: 'Booked',
    };

    setAppointmentsList([newApt, ...appointmentsList]);
    setIsAptModalOpen(false);
    setAptForm({ patient: '', doctor: 'Dr. Ram Sharma (Cardiology)', time: '11:30 AM', fee: '1500' });
    setToastMsg(`New appointment ${newId} created for ${newApt.patient}!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

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
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary-700 via-primary-600 to-teal-700 p-6 text-white shadow-xl">
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
          {queueData.map((q, idx) => (
            <SectionCard key={q.doctor} title={q.doctor} subtitle={q.dept}>
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
                <th className="px-4 py-2.5 font-semibold">Doctor</th>
                <th className="px-4 py-2.5 font-semibold">Time</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/70">
              {appointmentsList.slice(0, 5).map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700 dark:text-slate-200">{a.token}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{a.patient}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.doctor}</td>
                  <td className="px-4 py-3 text-slate-500">{a.time}</td>
                  <td className="px-4 py-3"><StatusPill status={a.status} /></td>
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
                  <option value="Dr. Ram Sharma (Cardiology)">Dr. Ram Sharma (Cardiology)</option>
                  <option value="Dr. Sita Gurung (Dermatology)">Dr. Sita Gurung (Dermatology)</option>
                  <option value="Dr. Bijay Shrestha (Orthopedics)">Dr. Bijay Shrestha (Orthopedics)</option>
                </select>
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