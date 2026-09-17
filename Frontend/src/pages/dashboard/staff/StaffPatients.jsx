import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, UserPlus, Phone, X, CheckCircle2, Pencil, LoaderCircle } from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import { fetchPatients, savePatientProfile } from "../../../Redux/slices/patientsSlice.js";

const avatarTones = [
  'bg-primary-100 text-primary-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
];

const emptyForm = {
  dateOfBirth: '', gender: 'MALE', bloodGroup: '', allergies: '',
  address: '', city: '', province: '', country: 'Nepal', zipCode: '',
};

const toRow = (patient) => ({
  ...patient,
  name: patient.user?.fullName || 'Unnamed patient',
  phone: patient.user?.phone || 'No phone number',
  email: patient.user?.email || '',
  age: patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '-',
  visits: patient.appointments?.length || 0,
});

const Patients = () => {
  const dispatch = useDispatch();
  const { patients, pagination, isLoading, error } = useSelector((state) => state.patient);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchPatients({ page: 1, limit: 20 }));
  }, [dispatch]);

  const patientList = useMemo(() => patients.map(toRow), [patients]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patientList.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [query, patientList]);

  const openEditor = (patient = null) => {
    setSelectedPatient(patient);
    setFormData(patient ? {
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : '',
      gender: patient.gender || 'MALE', bloodGroup: patient.bloodGroup || '',
      allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies || '',
      address: patient.address || '', city: patient.city || '', province: patient.province || '',
      country: patient.country || 'Nepal', zipCode: patient.zipCode || '',
    } : emptyForm);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.allergies) payload.allergies = payload.allergies.split(',').map((item) => item.trim()).filter(Boolean);
    const result = await dispatch(savePatientProfile({ patientId: selectedPatient?.id, payload }));
    if (savePatientProfile.fulfilled.match(result)) {
      setIsModalOpen(false);
      setSelectedPatient(null);
      setFormData(emptyForm);
      dispatch(fetchPatients({ page: pagination.page, limit: pagination.limit }));
      setSuccessMessage(`Patient profile ${selectedPatient ? 'updated' : 'created'} successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast notification */}
      {successMessage && (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, ID, or doctor…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
        <button
          onClick={() => openEditor()}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" /> Register patient
        </button>
      </div>

      {/* Patient Table */}
      <SectionCard bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Contact</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Age / Gender</th>
                <th className="hidden px-5 py-3 font-semibold lg:table-cell">Blood group</th>
                <th className="px-5 py-3 font-semibold">Visits</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Last visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/70">
              {rows.map((p, i) => (
                <tr key={p.id} onClick={() => setSelectedPatient(p)} className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold dark:bg-slate-800 dark:text-slate-200 ${avatarTones[i % avatarTones.length]}`}>
                        {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                        <p className="font-mono text-xs text-slate-400">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{p.email || 'Profile incomplete'}</td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {p.phone}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-slate-600 dark:text-slate-300 md:table-cell">
                    {p.age} · {p.gender}
                  </td>
                  <td className="hidden px-5 py-3 lg:table-cell text-slate-500">{p.bloodGroup || 'Not recorded'}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {p.visits}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-slate-500 sm:table-cell">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <button type="button" onClick={(e) => { e.stopPropagation(); openEditor(p); }} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {isLoading && <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading patient records...</div>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {/* Patient profile editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto animate-in fade-in zoom-in-95 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Register New Patient</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Date of birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Blood group</label>
                <input value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} placeholder="O+" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Kathmandu"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div><label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Allergies</label><input value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder="Separate multiple allergies with commas" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></div>
              <div><label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Address</label><input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></div>

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
                  {selectedPatient ? 'Save changes' : 'Create profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;