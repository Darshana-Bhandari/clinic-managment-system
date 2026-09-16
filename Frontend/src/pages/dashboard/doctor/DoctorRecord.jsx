import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  ChevronRight,
  Calendar,
  UserCircle,
  Stethoscope,
  FilePlus,
  Pill,
  ScanSearch,
  ArrowUpRight,
  Download,
  X,
  CheckCircle2,
} from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import StatCard from '../../../components/sections/StatCard';

const recordKpis = [
  { label: 'Total records', value: 482, sub: 'All consultations', tone: 'primary' },
  { label: 'Active Rx', value: 186, sub: 'Prescriptions active', tone: 'emerald' },
  { label: 'Pending reports', value: 12, sub: 'Lab / imaging', tone: 'amber' },
  { label: 'This month', value: 56, sub: 'New medical entries', tone: 'sky' },
];

const records = [
  { id: 'MR-3021', patientId: 'P-2041', patient: 'Anita Shrestha', date: 'Today', type: 'Consultation', diagnosis: 'Essential hypertension - BP uncontrolled', doctor: 'Dr. Ram Sharma', prescriptions: 2, reports: 1, status: 'In progress' },
  { id: 'MR-3020', patientId: 'P-2041', patient: 'Anita Shrestha', date: '2 weeks ago', type: 'Follow-up', diagnosis: 'BP improved (132/84), continue meds', doctor: 'Dr. Ram Sharma', prescriptions: 2, reports: 0, status: 'Closed' },
  { id: 'MR-3019', patientId: 'P-2044', patient: 'Suresh Magar', date: 'Today', type: 'Report review', diagnosis: 'ECG: NSR, no ischemic changes', doctor: 'Dr. Ram Sharma', prescriptions: 0, reports: 3, status: 'Closed' },
  { id: 'MR-3018', patientId: 'P-2048', patient: 'Kamal Bhandari', date: '5 days ago', type: 'Procedure note', diagnosis: 'Coronary angiography - LAD 80% lesion, stent placed', doctor: 'Dr. Ram Sharma', prescriptions: 5, reports: 4, status: 'Closed' },
  { id: 'MR-3017', patientId: 'P-2043', patient: 'Bina Tamang', date: 'Yesterday', type: 'Consultation', diagnosis: 'MVP with mild MR, reassurance', doctor: 'Dr. Ram Sharma', prescriptions: 1, reports: 1, status: 'Closed' },
  { id: 'MR-3016', patientId: 'P-2047', patient: 'Sarita Gurung', date: '1 week ago', type: 'Follow-up', diagnosis: 'Peripartum CMP resolved, EF 58%', doctor: 'Dr. Ram Sharma', prescriptions: 0, reports: 2, status: 'Closed' },
  { id: 'MR-3015', patientId: 'P-2049', patient: 'Hari Sharma', date: 'Yesterday', type: 'Medication change', diagnosis: 'Switched Lisinopril → Telmisartan due to cough', doctor: 'Dr. Ram Sharma', prescriptions: 2, reports: 0, status: 'Closed' },
];

const recordTypes = [
  { label: 'All types', value: 'All', Icon: FileText, tone: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { label: 'Consultations', value: 'Consultation', Icon: Stethoscope, tone: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' },
  { label: 'Prescriptions', value: 'Rx', Icon: Pill, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { label: 'Lab / Imaging', value: 'Report', Icon: ScanSearch, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
];

const samplePrescriptions = [
  { name: 'Telmisartan 40mg', dosage: 'Once daily', frequency: 'After breakfast', duration: '30 days', refillable: 2 },
  { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once at bedtime', duration: '30 days', refillable: 2 },
  { name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'Once at bedtime', duration: '90 days', refillable: 1 },
];

const sampleReports = [
  { name: 'ECG (Resting)', date: 'Today', status: 'Completed', file: 'ECG_MR3021.pdf' },
  { name: 'Lipid Profile', date: '2 days ago', status: 'Completed', file: 'LIPID_2044.pdf' },
  { name: '2D Echo', date: 'Pending', status: 'Pending', file: '—' },
];

const DoctorRecords = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(records[0]);

  const filtered = records.filter((r) => {
    if (typeFilter !== 'All' && !r.type.includes(typeFilter) && !(typeFilter === 'Report' && r.reports > 0) && !(typeFilter === 'Rx' && r.prescriptions > 0)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return r.patient.toLowerCase().includes(q) || r.diagnosis.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {recordKpis.map((k) => (
          <StatCard key={k.label} icon={FileText} label={k.label} value={k.value} sub={k.sub} tone={k.tone} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records, patients, diagnosis…"
              className="w-72 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {recordTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  typeFilter === t.value ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <t.Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 shadow-sm">
            <Plus className="h-4 w-4" /> New record
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Records list */}
        <SectionCard className="lg:col-span-2" title={`Medical records (${filtered.length})`} subtitle="Click to view full record" bodyClassName="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              <FileText className="mx-auto h-10 w-10 mb-2 text-slate-300 dark:text-slate-700" />
              No records match your filters.
            </div>
          ) : (
            <ul className="divide-y divide-slate-50 dark:divide-slate-800/70">
              {filtered.map((r) => (
                <li
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={`cursor-pointer p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${selected?.id === r.id ? 'bg-primary-50/60 dark:bg-primary-900/15' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      r.type.includes('Consult') ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' :
                      r.type.includes('Procedure') ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
                      r.type.includes('Report') ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                      'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                    }`}>
                      {r.type.includes('Report') ? <ScanSearch className="h-4.5 w-4.5" /> :
                       r.type.includes('Procedure') ? <Stethoscope className="h-4.5 w-4.5" /> :
                       r.type.includes('Follow') || r.type.includes('Medication') ? <Pill className="h-4.5 w-4.5" /> :
                       <FileText className="h-4.5 w-4.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-slate-500">{r.id}</span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">{r.type}</span>
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                              r.status === 'In progress' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                              'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            }`}>{r.status}</span>
                          </div>
                          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{r.patient}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{r.date}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                            {r.prescriptions > 0 && <span className="flex items-center gap-0.5"><Pill className="h-3 w-3" /> {r.prescriptions}</span>}
                            {r.reports > 0 && <span className="flex items-center gap-0.5"><ScanSearch className="h-3 w-3" /> {r.reports}</span>}
                          </p>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2"><strong>Diagnosis:</strong> {r.diagnosis}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Selected record detail */}
        <SectionCard title={selected ? selected.id : 'Record details'} subtitle={selected ? `${selected.patient} · ${selected.date}` : 'Select a record'} bodyClassName="p-0">
          {!selected ? (
            <div className="p-10 text-center text-sm text-slate-400">
              <FileText className="mx-auto h-10 w-10 mb-2 text-slate-300 dark:text-slate-700" />
              Select a record to view full chart data.
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/70">
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 font-display text-xs font-extrabold text-white">
                    {selected.patient.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{selected.patient}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <UserCircle className="h-3 w-3" /> {selected.patientId}
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Diagnosis summary</p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {selected.date}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-snug text-slate-800 dark:text-slate-200">{selected.diagnosis}</p>
                </div>
              </div>

              {/* Prescriptions */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5" /> Prescriptions ({samplePrescriptions.length})
                  </p>
                  <button className="text-[11px] font-bold text-primary-700 hover:underline dark:text-primary-300 flex items-center gap-1">
                    Print <Download className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {samplePrescriptions.map((rx, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{rx.name}</p>
                          <p className="text-xs text-slate-500">{rx.dosage} · {rx.frequency} · {rx.duration}</p>
                        </div>
                        {rx.refillable > 0 && (
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            {rx.refillable} refill
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reports */}
              <div className="p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <ScanSearch className="h-3.5 w-3.5" /> Reports &amp; investigations ({sampleReports.length})
                </p>
                <div className="mt-3 space-y-2">
                  {sampleReports.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.name}</p>
                        <p className="text-xs text-slate-500">{r.date} · {r.file}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>{r.status}</span>
                        {r.status === 'Completed' && (
                          <button className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                            <ArrowUpRight className="h-3 w-3" /> View
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action footer */}
              <div className="p-4 flex flex-wrap items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                <button className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700">
                  <FilePlus className="h-3.5 w-3.5" /> Add prescription
                </button>
                <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
                  <ScanSearch className="h-3.5 w-3.5" /> Order test
                </button>
                <Link to="/doctor/patients" className="ml-auto text-xs font-bold text-primary-700 hover:underline dark:text-primary-300 flex items-center gap-1">
                  Full patient chart <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* New record modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto animate-in fade-in zoom-in-95 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Create Medical Record</h3>
                <p className="text-xs text-slate-500">Add a new consultation note or encounter.</p>
              </div>
              <button onClick={() => setCreateOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Patient</label>
                <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                  <option>Anita Shrestha (P-2041)</option>
                  <option>Prakash Rai (P-2042)</option>
                  <option>Suresh Magar (P-2044)</option>
                  <option>Kamal Bhandari (P-2048)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Visit type</label>
                <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                  <option>Consultation</option><option>Follow-up</option><option>Report review</option><option>Procedure note</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Chief complaints / Symptoms</label>
                <textarea rows={2} placeholder="e.g. Chest pain on exertion x 3 days" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Diagnosis</label>
                <textarea rows={2} placeholder="Working diagnosis, assessment &amp; plan" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Notes / Clinical observations</label>
                <textarea rows={3} placeholder="BP, HR, exam findings, discussion points…" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button onClick={() => setCreateOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">Cancel</button>
              <button onClick={() => setCreateOpen(false)} className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700">
                <CheckCircle2 className="h-4 w-4" /> Save record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRecords;