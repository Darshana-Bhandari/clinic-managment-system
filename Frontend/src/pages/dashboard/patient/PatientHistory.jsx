
import { FileText, Download, FilePlus, Activity, ShieldAlert } from 'lucide-react';

const medicalRecords = [
  {
    id: 'REC-8841',
    title: 'ECG & Cardiac Evaluation Report',
    doctor: 'Dr. Ram Sharma',
    date: 'Oct 12, 2026',
    category: 'Lab Report',
    size: '2.4 MB',
  },
  {
    id: 'REC-7730',
    title: 'Blood Pressure & Lipid Profile',
    doctor: 'Dr. Ram Sharma',
    date: 'Aug 04, 2026',
    category: 'Blood Work',
    size: '1.1 MB',
  },
  {
    id: 'REC-5519',
    title: 'X-Ray Knee Joint Right',
    doctor: 'Dr. Bijay Shrestha',
    date: 'Sep 15, 2026',
    category: 'Radiology',
    size: '5.8 MB',
  },
];

const PatientHistory = () => {
  return (
    <div className="space-y-6">
      {/* Vitals Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Blood Pressure</p>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">120 / 80 <span className="text-xs font-normal text-slate-400">mmHg</span></p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Heart Rate</p>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">72 <span className="text-xs font-normal text-slate-400">BPM</span></p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Allergies</p>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">Penicillin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports & Documents */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Medical Records & Reports</h3>
          <button className="flex items-center gap-2 rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700">
            <FilePlus className="h-4 w-4" /> Upload Document
          </button>
        </div>

        <div className="space-y-3">
          {medicalRecords.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                  <p className="text-xs text-slate-500">
                    {rec.doctor} · {rec.category} · {rec.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-slate-400 sm:inline">{rec.size}</span>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;