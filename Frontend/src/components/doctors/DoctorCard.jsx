import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Building2, Briefcase, Wallet, ArrowRight, CircleDot } from 'lucide-react';
import Card from '../ui/Card';

const AVATAR_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="%23ccfbf1"/><circle cx="60" cy="46" r="22" fill="%230d9488"/><path d="M20 108c0-22 18-36 40-36s40 14 40 36z" fill="%230d9488"/></svg>`
  );

const availabilityStyles = {
  'Available Today': { badge: 'badge-success', dot: 'text-emerald-500' },
  'This Week': { badge: 'badge-info', dot: 'text-primary-500' },
  'Next Week': { badge: 'badge-warning', dot: 'text-amber-500' },
};

const DoctorCard = ({ doctor }) => {
  const avail = availabilityStyles[doctor.availability] || availabilityStyles['Next Week'];

  return (
    <Card className="group flex h-full flex-col p-5">
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={doctor.image || AVATAR_FALLBACK}
            alt={doctor.name}
            loading="lazy"
            className="h-20 w-20 rounded-2xl object-cover ring-4 ring-primary-50 dark:ring-slate-800"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = AVATAR_FALLBACK;
            }}
          />
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-900">
            <CircleDot className={`h-4 w-4 ${avail.dot}`} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">{doctor.name}</h3>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">{doctor.specialty}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold">{doctor.rating}</span>
            </span>
          </div>
          <span className={`badge ${avail.badge} mt-2`}>{doctor.availability}</span>
        </div>
      </div>

      <div className="mt-4 grid flex-1 grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
        <div className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-400">
          <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate" title={doctor.hospital}>{doctor.hospital}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{doctor.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
          <span>{doctor.experience} yrs exp.</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Wallet className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">Rs. {doctor.consultationFee}</span>
        </div>
      </div>

      {doctor.languages?.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {doctor.languages.map((lang) => (
            <span key={lang} className="badge badge-gray">{lang}</span>
          ))}
        </div>
      )}

      <Link
        to="/book"
        className="btn btn-primary btn-sm mt-4 w-full"
      >
        Book Appointment
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <Link to={`/doctors/${doctor.id}`} className="btn btn-secondary btn-sm mt-4 w-full">
        Doctor Details
      </Link>
    </Card>
  );
};

export default DoctorCard;