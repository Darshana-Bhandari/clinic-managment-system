
import { Star, Briefcase, Wallet, UserPlus, MoreHorizontal } from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import { doctorsData } from '../../../utils/dummyData';
import { currency } from '../../../utils/dashboardData';

const availabilityTone = {
  'Available Today': 'badge-success',
  'This Week': 'badge-info',
  'Next Week': 'badge-warning',
};

const Doctors = () => (
  <div className="space-y-5">
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">{doctorsData.length} specialists across {new Set(doctorsData.map((d) => d.specialty)).size} departments</p>
      <button className="btn btn-primary btn-sm"><UserPlus className="h-4 w-4" /> Add doctor</button>
    </div>

    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {doctorsData.map((d) => (
        <div key={d.id} className="card card-hover p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 text-sm font-bold text-white">
              {d.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900 dark:text-white">{d.name}</p>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{d.specialty}</p>
                </div>
                <button className="text-slate-300 hover:text-slate-500" aria-label="More"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-800/50">
              <p className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900 dark:text-white"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{d.rating}</p>
              <p className="text-[11px] text-slate-400">rating</p>
            </div>
            <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-800/50">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{d.experience}y</p>
              <p className="text-[11px] text-slate-400">exp.</p>
            </div>
            <div className="rounded-xl bg-slate-50 py-2 dark:bg-slate-800/50">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{d.reviews}</p>
              <p className="text-[11px] text-slate-400">reviews</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200"><Wallet className="h-4 w-4 text-slate-400" /> {currency(d.consultationFee)}</span>
            <span className={`badge ${availabilityTone[d.availability] || 'badge-gray'}`}>{d.availability}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Doctors;