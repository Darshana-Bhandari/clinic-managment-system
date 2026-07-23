
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Briefcase,
  Building2,
  MapPin,
  Wallet,
  Languages,
  GraduationCap,
  CalendarPlus,
  Heart,
  Clock,
  UserX,
  BadgeCheck,
} from 'lucide-react';
import { doctorsData } from '../utils/dummyData';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const AVATAR_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 120 120"><rect width="120" height="120" rx="24" fill="%23ccfbf1"/><circle cx="60" cy="46" r="22" fill="%230d9488"/><path d="M20 108c0-22 18-36 40-36s40 14 40 36z" fill="%230d9488"/></svg>`
  );

const schedule = [
  { day: 'Sunday – Friday', hours: '9:00 AM – 6:00 PM' },
  { day: 'Saturday', hours: '9:00 AM – 2:00 PM' },
  { day: 'Public Holidays', hours: 'Emergency only' },
];

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const doctor = doctorsData.find((d) => d.id === parseInt(id));

  if (!doctor) {
    return (
      <div className="flex-center min-h-[60vh]">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <UserX className="h-8 w-8" />
          </span>
          <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">Doctor not found</h2>
          <p className="mt-2 text-slate-500">The doctor you're looking for doesn't exist.</p>
          <Link to="/book" className="mt-6 inline-block">
            <Button variant="primary" icon={<ArrowLeft className="h-4 w-4" />}>Back to Doctors</Button>
          </Link>
        </div>
      </div>
    );
  }

  const details = [
    { Icon: Building2, label: 'Hospital', value: doctor.hospital },
    { Icon: MapPin, label: 'Location', value: doctor.location },
    { Icon: Wallet, label: 'Consultation Fee', value: `Rs. ${doctor.consultationFee}` },
    { Icon: Languages, label: 'Languages', value: doctor.languages.join(', ') },
    { Icon: Briefcase, label: 'Experience', value: `${doctor.experience} years` },
  ];

  return (
    <div className="container-custom animate-fade-in-up py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary-700 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Main */}
        <div className="space-y-6">
          <Card className="p-6 sm:p-8" hoverable={false}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <img
                  src={doctor.image || AVATAR_FALLBACK}
                  alt={doctor.name}
                  className="h-32 w-32 rounded-3xl object-cover ring-4 ring-primary-50 dark:ring-slate-800"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = AVATAR_FALLBACK;
                  }}
                />
                <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-md ring-4 ring-white dark:ring-slate-900">
                  <BadgeCheck className="h-5 w-5" />
                </span>
              </div>
              <div className="flex-1">
                <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">{doctor.name}</h1>
                <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">{doctor.specialty}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900 dark:text-white">{doctor.rating}</span>
                    <span className="text-slate-500">({doctor.reviews} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Briefcase className="h-4 w-4 text-slate-400" /> {doctor.experience} yrs experience
                  </span>
                  <span className={`badge ${doctor.availability === 'Available Today' ? 'badge-success' : 'badge-info'}`}>
                    {doctor.availability}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">About</h3>
                <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-400">{doctor.bio}</p>
                <h3 className="mt-6 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <GraduationCap className="h-5 w-5 text-primary-600" /> Education
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{doctor.education}</p>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Details</h3>
                <div className="mt-2 space-y-1">
                  {details.map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0 dark:border-slate-800">
                      <span className="flex items-center gap-2 text-sm text-slate-500">
                        <Icon className="h-4 w-4 text-slate-400" /> {label}
                      </span>
                      <span className="text-right text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-8" hoverable={false}>
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Clock className="h-5 w-5 text-primary-600" /> Availability Schedule
            </h3>
            <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/70 dark:divide-slate-800 dark:border-slate-800">
              {schedule.map((row) => (
                <div key={row.day} className="flex items-center justify-between bg-slate-50/60 px-4 py-3 dark:bg-slate-800/40">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.day}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{row.hours}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Booking sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6" hoverable={false}>
            <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-teal-50/60 p-5 text-center dark:from-slate-800 dark:to-slate-800/40">
              <p className="text-sm text-slate-500">Consultation fee</p>
              <p className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white">Rs. {doctor.consultationFee}</p>
              <p className="mt-1 text-xs text-slate-500">per visit · {doctor.availability}</p>
            </div>

            <div className="mt-5 space-y-2.5">
              <Link to="/book" className="btn btn-primary btn-lg btn-full">
                <CalendarPlus className="h-5 w-5" /> Book Appointment
              </Link>
              <Button variant="outline" size="md" fullWidth icon={<Heart className="h-4.5 w-4.5" />}>
                Save to Favorites
              </Button>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 dark:border-slate-800">
              {[
                { Icon: BadgeCheck, text: 'Verified specialist' },
                { Icon: Clock, text: 'Instant confirmation' },
                { Icon: Wallet, text: 'eSewa & Khalti accepted' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <Icon className="h-4.5 w-4.5 text-primary-600" /> {text}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;