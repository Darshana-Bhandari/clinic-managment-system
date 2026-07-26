
import { useMemo, useState } from 'react';
import { Search, Filter, CalendarPlus, Globe, Building2, X, CheckCircle2 } from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import StatusPill from '../../../components/sections/StatusPill';
import { todaysAppointments as initialAppointments, currency } from '../../../utils/dashboardData';

const tabs = ['All', 'Booked', 'Checked-in', 'In progress', 'Completed', 'No-show'];

const Appointments = () => {
  const [appointmentsList, setAppointmentsList] = useState(initialAppointments);
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    patient: '',
    doctor: 'Dr. Ram Sharma (Cardiology)',
    time: '11:00 AM',
    fee: '1500',
  });

  const rows = useMemo(
    () =>
      appointmentsList.filter((a) => {
        const matchTab = tab === 'All' || a.status === tab;
        const q = query.trim().toLowerCase();
        const matchQuery =
          !q ||
          a.patient.toLowerCase().includes(q) ||
          a.doctor.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q);
        return matchTab && matchQuery;
      }),
    [tab, query, appointmentsList]
  );

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!formData.patient) return;

    const newId = `APT-${Math.floor(100 + Math.random() * 900)}`;
    const newToken = `TK-0${Math.floor(40 + Math.random() * 50)}`;
    const [docName, dept] = formData.doctor.split(' (');

    const newApt = {
      id: newId,
      token: newToken,
      patient: formData.patient,
      doctor: docName,
      dept: dept ? dept.replace(')', '') : 'General',
      source: 'staff',
      time: formData.time,
      fee: Number(formData.fee) || 1500,
      status: 'Booked',
    };

    setAppointmentsList([newApt, ...appointmentsList]);
    setIsModalOpen(false);
    setFormData({ patient: '', doctor: 'Dr. Ram Sharma (Cardiology)', time: '11:00 AM', fee: '1500' });
    setSuccessMsg(`Appointment ${newId} booked for ${newApt.patient}!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Toast alert */}
      {successMsg && (
        <div className="animate-in fade-in flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

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
                  <td className="hidden px-5 py-3 text-slate-600 dark:text-slate-300 sm:table-cell">{a.time}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">{currency(a.fee)}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={a.status} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                    No appointments match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* New Appointment Modal */}
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
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
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
                  className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;