import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, SearchX, Check, Stethoscope, CalendarDays, CalendarPlus, Heart, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const serviceData = {
  cardiology: {
    title: 'Cardiology',
    Icon: Heart,
    tone: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300',
    description: 'Comprehensive heart care services',
    longDescription:
      'Our cardiology department provides state-of-the-art care for all heart conditions, from routine screenings to advanced interventional procedures. Our team combines clinical expertise with the latest diagnostic technology to keep your heart healthy.',
    doctors: ['Dr. Ram Sharma', 'Dr. Hari Adhikari'],
    procedures: ['ECG / EKG', 'Echocardiogram', 'Cardiac Catheterization', 'Angioplasty'],
    availability: 'Monday – Saturday',
  },
  dermatology: {
    title: 'Dermatology',
    Icon: Sparkles,
    tone: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
    description: 'Expert skin care services',
    longDescription:
      'Our dermatology department offers comprehensive skin care for medical, surgical, and cosmetic needs. From acne to advanced laser therapy, our specialists deliver personalized treatment plans for healthy, confident skin.',
    doctors: ['Dr. Sita Gurung'],
    procedures: ['Skin Examination', 'Biopsy', 'Laser Treatment', 'Acne Therapy'],
    availability: 'Monday – Friday',
  },
};

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = serviceData[serviceId];

  if (!service) {
    return (
      <div className="container-custom py-16">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <SearchX className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white">Service not found</h1>
          <p className="mt-2 text-slate-500">
            Details for this service are coming soon. Explore our full range of services meanwhile.
          </p>
          <Link to="/services" className="mt-6 inline-block">
            <Button variant="primary" icon={<ArrowLeft className="h-4 w-4" />}>Back to Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { Icon } = service;

  return (
    <div className="container-custom animate-fade-in-up py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary-700 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <Card className="p-6 sm:p-8" hoverable={false}>
        <div className="flex items-center gap-4">
          <span className={`flex h-16 w-16 items-center justify-center rounded-3xl ${service.tone}`}>
            <Icon className="h-8 w-8" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">{service.title}</h1>
            <p className="text-slate-500">{service.description}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">About this service</h3>
            <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-400">{service.longDescription}</p>

            <h3 className="mt-6 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Stethoscope className="h-5 w-5 text-primary-600" /> Available doctors
            </h3>
            <ul className="mt-3 space-y-2">
              {service.doctors.map((d) => (
                <li key={d} className="flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50/60 px-3.5 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Procedures</h3>
            <ul className="mt-3 space-y-2">
              {service.procedures.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <h3 className="mt-6 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <CalendarDays className="h-5 w-5 text-primary-600" /> Availability
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{service.availability}</p>

            <Link to="/doctors" className="mt-6 block">
              <Button variant="primary" size="lg" fullWidth icon={<CalendarPlus className="h-5 w-5" />}>
                Book an Appointment
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ServiceDetail;