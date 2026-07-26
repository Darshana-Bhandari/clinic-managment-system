
import { Search, UserPlus, Globe, Building2, Phone, X, CheckCircle2, UserCheck } from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import { patients as initialPatients } from '../../../utils/dashboardData';
import { doctorsData } from '../../../utils/dummyData';
import CustomDoctorSelect from '../../../components/ui/CustomDoctorSelect';

const avatarTones = [
  'bg-primary-100 text-primary-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
];

// Add doctor assignment to initial patients for consistent UI
const enrichedInitialPatients = initialPatients.map((p, idx) => ({
  ...p,
  assignedDoctor: p.assignedDoctor || doctorsData[idx % doctorsData.length]?.name || 'Dr. Ram Sharma',
}));

const Patients = () => {
  const [patientList, setPatientList] = useState(enrichedInitialPatients);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    city: 'Kathmandu',
    source: 'staff',
    assignedDoctor: doctorsData[0]?.name || 'Dr. Ram Sharma',
  });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patientList.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.assignedDoctor && p.assignedDoctor.toLowerCase().includes(q))
    );
  }, [query, patientList]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const newId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatient = {
      id: newId,
      name: formData.name,
      phone: formData.phone,
      age: Number(formData.age) || 25,
      gender: formData.gender,
      source: formData.source,
      assignedDoctor: formData.assignedDoctor,
      visits: 1,
      lastVisit: 'Today',
    };

    setPatientList([newPatient, ...patientList]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      age: '',
      gender: 'Male',
      city: 'Kathmandu',
      source: 'staff',
      assignedDoctor: doctorsData[0]?.name || 'Dr. Ram Sharma',
    });
    setSuccessMessage(`Patient ${newPatient.name} (${newId}) assigned to ${newPatient.assignedDoctor} successfully!`);
    setTimeout(() => setSuccessMessage(''), 4000);
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
          onClick={() => setIsModalOpen(true)}
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
                <th className="px-5 py-3 font-semibold">Assigned Doctor</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Contact</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Age / Gender</th>
                <th className="hidden px-5 py-3 font-semibold lg:table-cell">Source</th>
                <th className="px-5 py-3 font-semibold">Visits</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Last visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/70">
              {rows.map((p, i) => (
                <tr key={p.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
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
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <UserCheck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      {p.assignedDoctor || 'Dr. Ram Sharma'}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {p.phone}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-slate-600 dark:text-slate-300 md:table-cell">
                    {p.age} · {p.gender}
                  </td>
                  <td className="hidden px-5 py-3 lg:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      {p.source === 'web' ? (
                        <Globe className="h-3.5 w-3.5 text-primary-500" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-sky-500" />
                      )}
                      {p.source === 'web' ? 'Website' : 'Staff Walk-in'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {p.visits}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-slate-500 sm:table-cell">{p.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Register Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto animate-in fade-in zoom-in-95 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Register New Patient</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Anish Maharjan"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <CustomDoctorSelect
                value={formData.assignedDoctor}
                onChange={(val) => setFormData({ ...formData, assignedDoctor: val })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="28"
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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Registration Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="staff">Staff Walk-in</option>
                  <option value="web">Online Web Portal</option>
                </select>
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
                  Register Patient
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