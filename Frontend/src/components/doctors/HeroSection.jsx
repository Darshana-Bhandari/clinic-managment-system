import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const HeroSection = () => {
  const highlights = [
    '500+ specialist doctors',
    'Same-day appointments',
    'Affordable care plans',
  ];

  const trustPoints = [
    { label: 'Verified doctors', value: '98%' },
    { label: 'Patient satisfaction', value: '4.9/5' },
    { label: 'Care coverage', value: '50+' },
    { label: 'Appointments', value: '1000+' },
  ];

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.3),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_45%,_#2563eb_100%)]">
      <div className="absolute inset-0 bg-[url('/src/assets/images/pattern.svg')] opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

      <div className="container-custom relative py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
              <span className="text-base">🏥</span>
              Trusted healthcare platform for modern clinics
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Discover world-class care with confidence.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-100 sm:text-xl">
              Connect with highly rated specialists, book appointments instantly, and experience healthcare designed around your needs.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/doctors">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  Book an Appointment
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" size="lg" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                  Explore Services
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm text-slate-100 backdrop-blur-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/30 bg-white/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">24/7 patient support</p>
                <p className="text-sm text-slate-600">From booking to follow-up care</p>
              </div>
              <span className="text-2xl">💬</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {trustPoints.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-primary-100 bg-primary-50 p-4">
              <p className="text-sm font-semibold text-primary-800">Why patients trust us</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2"><span className="text-primary-600">✓</span> Transparent physician profiles</li>
                <li className="flex items-center gap-2"><span className="text-primary-600">✓</span> Secure digital consultations</li>
                <li className="flex items-center gap-2"><span className="text-primary-600">✓</span> Consistent follow-up support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;