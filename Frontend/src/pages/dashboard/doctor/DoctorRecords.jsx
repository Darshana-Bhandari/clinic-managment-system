import React, { useEffect, useState, useMemo } from 'react';
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
  Trash2,
} from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import StatCard from '../../../components/sections/StatCard';
import { createMedicalRecord, deleteMedicalRecord, getAllMedicalRecords } from '../../../services/medicalRecordService.js';
import toast from 'react-hot-toast';

const recordTypes = [
  { label: 'All types', value: 'All', Icon: FileText },
  { label: 'Consultations', value: 'Consultation', Icon: Stethoscope },
  { label: 'Prescriptions', value: 'Rx', Icon: Pill },
  { label: 'Lab / Imaging', value: 'Report', Icon: ScanSearch },
];



const DoctorRecords = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filter, setFilter] = useState({ search: '', patientId: '', fromDate: '', toDate: '' });
  const [recordForm, setRecordForm] = useState({ patientId: '', doctorId: '', symptoms: '', diagnosis: '', notes: '' });

  const recordKpis = useMemo(() => {
    const total = records.length;
    const withPrescriptions = records.filter((r) => (r.prescriptions || 0) > 0).length;
    const pendingReports = records.reduce(
      (sum, r) => sum + (r.reportItems || []).filter((rp) => rp.status !== 'Completed' && rp.status !== 'Ready').length,
      0,
    );
    const now = new Date();
    const thisMonth = records.filter((r) => {
      const d = new Date(r.diagnosisDate || r.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return [
      { label: 'Total records', value: total, sub: 'All consultations', tone: 'primary' },
      { label: 'With Rx', value: withPrescriptions, sub: 'Prescriptions attached', tone: 'emerald' },
      { label: 'Pending reports', value: pendingReports, sub: 'Lab / imaging', tone: 'amber' },
      { label: 'This month', value: thisMonth, sub: 'New medical entries', tone: 'sky' },
    ];
  }, [records]);

  const filtered = useMemo(
    () =>
      records.filter((record) => {
        if (typeFilter === 'Rx' && (record.prescriptions || 0) === 0) return false;
        if (typeFilter === 'Report' && (record.reports || 0) === 0) return false;
        if (typeFilter === 'Consultation' && !String(record.type || '').includes('Consult')) return false;
        if (!search) return true;
        const query = search.toLowerCase();
        return [record.patient, record.diagnosis, record.id, record.patientId]
          .some((value) => String(value || '').toLowerCase().includes(query));
      }),
    [records, typeFilter, search],
  );
  // fetch 
  const fetchRecords = async(params={})=>{
    setLoading(true)
    setError(null);
    try{
      const data = await getAllMedicalRecords({ page: pagination.page, limit: pagination.limit, ...filter, ...params });
      const nextRecords = (data.records || data || []).map((record) => ({
        ...record,
        patient: record.patient?.user?.fullName || 'Unknown patient',
        patientId: record.patientId,
        doctor: record.doctor?.user?.fullName || 'Unknown doctor',
        date: record.diagnosisDate ? new Date(record.diagnosisDate).toLocaleDateString() : 'No date',
        type: record.type || 'Consultation',
        diagnosis: record.diagnosis || 'No diagnosis recorded',
        prescriptions: record.prescriptions?.length || 0,
        reports: record.reports?.length || 0,
        prescriptionItems: record.prescriptions || [],
        reportItems: record.reports || [],
        status: record.status || 'Closed',
      }));
      setRecords(nextRecords);
      setSelected((current) => nextRecords.find((record) => record.id === current?.id) || nextRecords[0] || null);
      if (data.pagination) setPagination(data.pagination);
    }
    catch (requestError) {
      const message = requestError.response?.data?.message || 'Failed to load medical records';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }

  }

  useEffect(()=>{
    fetchRecords();

  }, [pagination.page])


  //hanlders
const handleFilterChange = (key, value)=>{
  setFilter((prev)=>({...prev,[key]:value}))
}

const handleSearch = (e)=>{
  e.preventDefault();
  setPagination((p)=>({...p,page:1}))
}

const handleReset = () =>{
  const reset = {search:'',patientId:'', fromDate:'',toDate:''};
  setFilter(reset)
  setPagination((p)=>({...p,page:1}))
  fetchRecords({page:1, ...reset})
}


// handle delete 
const handleDelete = async (medicalId) =>{
  if(!window.confirm('Are you sure you want to delete this medical record ?'))
    return 
  try{
    await deleteMedicalRecord(medicalId);
    toast.success("Medical record deleted successfully")
    fetchRecords()
  }
  catch(error){
    toast.error(error.response?.data?.message || "Failed to delete record")
  }
}
// page change 
const handlePageChange = (newPage )=>{
  setPagination((p)=>({...p,page:newPage}))
}

  const handleCreateRecord = async () => {
    try {
      await createMedicalRecord({
        patientId: recordForm.patientId,
        doctorId: recordForm.doctorId,
        symptoms: recordForm.symptoms.split(',').map((item) => item.trim()).filter(Boolean),
        diagnosis: recordForm.diagnosis,
        notes: recordForm.notes,
      });
      setCreateOpen(false);
      setRecordForm({ patientId: '', doctorId: '', symptoms: '', diagnosis: '', notes: '' });
      await fetchRecords({ page: 1 });
      toast.success('Medical record created');
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Could not create medical record');
    }
  };
  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {recordKpis.map((k) => (
          <StatCard key={k.label} icon={FileText} label={k.label} value={k.value} sub={k.sub} tone={k.tone} />
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={(e) => { e.preventDefault(); setPagination((p) => ({ ...p, page: 1 })); fetchRecords({ page: 1, search: filter.search }); }} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setFilter((f) => ({ ...f, search: e.target.value })); }}
              placeholder="Search records, patients, diagnosis…"
              className="w-72 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
          </form>
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
          <button onClick={handleReset} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Reset filters
          </button>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 shadow-sm">
            <Plus className="h-4 w-4" /> New record
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Records list */}
        <SectionCard className="lg:col-span-2" title={`Medical records (${filtered.length})`} subtitle={loading ? 'Loading records...' : 'Click to view full record'} bodyClassName="p-0">
          {loading && records.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              <div className="spinner spinner-sm mx-auto mb-2" />
              Loading your records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              <FileText className="mx-auto h-10 w-10 mb-2 text-slate-300 dark:text-slate-700" />
              No records match your filters.
            </div>
          ) : (
            <>
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
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                  <p className="text-xs text-slate-500">
                    Page {pagination.page} of {pagination.totalPages}
                    {pagination.total > 0 && ` · ${pagination.total} total`}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Prev
                    </button>
                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
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
                    {String(selected.patient || '')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2) || '??'}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{selected.patient}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <UserCircle className="h-3 w-3" /> {selected.patientId || 'Unknown ID'}
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
                  {selected.notes && (
                    <p className="mt-3 border-t border-slate-200/50 pt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300">Notes:</strong> {selected.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Prescriptions */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5" /> Prescriptions ({(selected.prescriptionItems || []).length})
                  </p>
                  {(selected.prescriptionItems || []).length > 0 && (
                    <button className="text-[11px] font-bold text-primary-700 hover:underline dark:text-primary-300 flex items-center gap-1">
                      Print <Download className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {(selected.prescriptionItems || []).length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
                      No prescriptions on this record yet.
                    </p>
                  ) : (
                    (selected.prescriptionItems || []).map((rx, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{rx.medication || rx.name || 'Unnamed medication'}</p>
                            <p className="text-xs text-slate-500">
                              {[rx.dosage, rx.frequency, rx.duration].filter(Boolean).join(' · ') || 'No dosage details'}
                            </p>
                            {rx.instructions && (
                              <p className="mt-1 text-[11px] text-slate-500">{rx.instructions}</p>
                            )}
                          </div>
                          {(rx.refills ?? rx.refillable) > 0 && (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              {rx.refills ?? rx.refillable} refills
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reports */}
              <div className="p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <ScanSearch className="h-3.5 w-3.5" /> Reports &amp; investigations ({(selected.reportItems || []).length})
                </p>
                <div className="mt-3 space-y-2">
                  {(selected.reportItems || []).length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
                      No investigations or reports yet.
                    </p>
                  ) : (
                    (selected.reportItems || []).map((r, idx) => {
                      const hasFile = r.file || r.fileName || r.url;
                      const status = r.status || 'Pending';
                      const isReady = status === 'Completed' || status === 'Ready' || hasFile;
                      return (
                        <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.name || r.title || `Report ${idx + 1}`}</p>
                            <p className="text-xs text-slate-500">
                              {r.date || (r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : 'N/A')} ·{' '}
                              {hasFile ? (
                                <a href={r.url || r.file} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                                  View file
                                </a>
                              ) : (
                                'No file attached'
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isReady ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                              'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}>{status}</span>
                            {isReady && (
                              <button className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                                <ArrowUpRight className="h-3 w-3" /> View
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
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
                <button onClick={() => handleDelete(selected.id)} className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900/20">
                  <Trash2 className="h-3.5 w-3.5" /> Delete record
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
        <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto animate-scale-in rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
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
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Patient ID <span className="text-danger">*</span>
                </label>
                <input value={recordForm.patientId} onChange={(e) => setRecordForm({ ...recordForm, patientId: e.target.value })} placeholder="Patient ID" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Doctor ID</label>
                <input value={recordForm.doctorId} onChange={(e) => setRecordForm({ ...recordForm, doctorId: e.target.value })} placeholder="Optional – defaults to the signed-in doctor" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Visit type</label>
                <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                  <option>Consultation</option><option>Follow-up</option><option>Report review</option><option>Procedure note</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Chief complaints / Symptoms</label>
                <textarea value={recordForm.symptoms} onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })} rows={2} placeholder="e.g. Chest pain, fatigue (comma-separated)" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Diagnosis <span className="text-danger">*</span>
                </label>
                <textarea value={recordForm.diagnosis} onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })} rows={2} placeholder="Working diagnosis, assessment &amp; plan" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Notes / Clinical observations</label>
                <textarea value={recordForm.notes} onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })} rows={3} placeholder="BP, HR, exam findings, discussion points…" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button onClick={() => setCreateOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">Cancel</button>
              <button onClick={handleCreateRecord} disabled={!recordForm.patientId || !recordForm.diagnosis} className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
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