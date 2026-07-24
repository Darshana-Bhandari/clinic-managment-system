import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Check, Clock, Stethoscope, ArrowRight, Siren, HeartPulse } from 'lucide-react';
import Carousel from '../ui/Carousel';

/**
 * Primary hero for the booking product. A rotating message carousel on the
 * left (badge + heading + subtitle + CTAs swap every few seconds) paired
 * with a persistent quick-search and a live "queue token" preview card on
 * the right — the differentiator (instant token, SMS confirm) stays visible
 * no matter which promo message is currently showing.
 */

const SPECIALTIES = ['General Physician', 'Dermatology', 'Pediatrics', 'Dental', 'Gynecology'];

const credentials = [
  'No registration fees',
  'Direct SMS confirmations',
  'Instant live-queue tokens',
];

const slidesData = [
  {
    badge: 'Now serving patients at Chabahil, Kathmandu',
    heading: (
      <>
        Compassionate Care,
        <br />
        <span className="text-amber-300">Instantly Booked.</span>
      </>
    ),
    subtitle:
      'Book an appointment online in under a minute. Say goodbye to long phone queues and tedious clinic waiting lines.',
    icon: Calendar,
    primaryCta: { label: 'Book Appointment', to: '/book' },
    secondaryCta: { label: 'Find a Doctor', to: '/doctors' },
  },
  {
    badge: '24/7 emergency dispatch, live now',
    heading: (
      <>
        Every Minute Matters,
        <br />
        <span className="text-amber-300">We Respond Fast.</span>
      </>
    ),
    subtitle:
      'One tap connects you to the nearest available responder. Real-time dispatch tracking, no hold music, no delays.',
    icon: Siren,
    primaryCta: { label: 'Request Emergency Help', to: '/emergency' },
    secondaryCta: { label: 'How Dispatch Works', to: '/emergency#how-it-works' },
  },
  {
    badge: 'New: preventive checkup packages',
    heading: (
      <>
        Know Your Health,
        <br />
        <span className="text-amber-300">Before It's Urgent.</span>
      </>
    ),
    subtitle:
      'Full-body screening packages with same-week slots and a physician walkthrough of every result — not just a PDF.',
    icon: HeartPulse,
    primaryCta: { label: 'View Checkup Packages', to: '/packages' },
    secondaryCta: { label: 'Talk to a Doctor', to: '/doctors' },
  },
];

const HeroSection = () => {
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(41);
  const [mounted, setMounted] = useState(false);
  const tickRef = useRef(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    let ticks = 0;
    tickRef.current = window.setInterval(() => {
      ticks += 1;
      setTokenNumber((n) => n + 1);
      if (ticks >= 3) window.clearInterval(tickRef.current);
    }, 3400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(tickRef.current);
    };
  }, []);

  const filteredSpecialties = query
    ? SPECIALTIES.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : SPECIALTIES;

  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(135deg,_#022c22_0%,_#0f766e_48%,_#0d9488_100%)] py-20 text-white lg:py-28"
      id="hero-section"
    >
      <style>{`
        @keyframes hero-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-rise { animation: hero-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-rise { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-teal-400/20 blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          {/* Copy column — rotating message carousel */}
          <div className="max-w-xl">
            <Carousel
              intervalMs={6500}
              slides={slidesData.map((slide, i) => {
                const Icon = slide.icon;
                return (
                  <div key={i} className="flex flex-col gap-6">
                    <span className="hero-rise inline-flex items-center gap-1.5 self-start rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-teal-50">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      {slide.badge}
                    </span>

                    <h1 className="hero-rise font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                      {slide.heading}
                    </h1>

                    <p className="hero-rise max-w-lg text-lg leading-relaxed text-teal-50/90 sm:text-xl">
                      {slide.subtitle}
                    </p>

                    <div className="hero-rise mt-1 flex flex-col gap-4 sm:flex-row">
                      <Link to={slide.primaryCta.to} className="btn btn-accent btn-lg group">
                        <Icon className="h-5 w-5" /> {slide.primaryCta.label}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                      <Link
                        to={slide.secondaryCta.to}
                        className="btn btn-lg border border-white/20 bg-white/10 text-white hover:bg-white/20"
                      >
                        <Stethoscope className="h-5 w-5" /> {slide.secondaryCta.label}
                      </Link>
                    </div>
                  </div>
                );
              })}
            />

            {/* Quick specialty search — persistent across every slide */}
            <div className="hero-rise mt-6">
              <label htmlFor="hero-doctor-search" className="sr-only">
                Search by specialty or doctor name
              </label>
              <div
                className={`flex items-center gap-2 rounded-xl border bg-white/10 px-4 py-3 backdrop-blur-sm transition-colors ${
                  searchFocused ? 'border-amber-300/70 bg-white/15' : 'border-white/20'
                }`}
              >
                <Search className="h-5 w-5 shrink-0 text-teal-100" />
                <input
                  id="hero-doctor-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search a specialty — e.g. Dermatology"
                  className="w-full bg-transparent text-sm text-white placeholder:text-teal-100/60 focus:outline-none sm:text-base"
                />
                <Link
                  to={query ? `/book?specialty=${encodeURIComponent(query)}` : '/book'}
                  className="hidden shrink-0 items-center gap-1 rounded-lg bg-amber-300 px-3 py-1.5 text-sm font-semibold text-teal-950 transition-transform hover:scale-105 sm:inline-flex"
                >
                  Search <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {filteredSpecialties.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-teal-50/80 transition-colors hover:border-amber-300/60 hover:text-amber-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-rise mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-teal-100">
              {credentials.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-300" strokeWidth={3} /> {item}
                </div>
              ))}
            </div>
          </div>

          {/* Live preview card — shows the product's actual differentiator */}
          <div
            className={`hero-rise relative mx-auto w-full max-w-sm transition-all duration-700 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="rounded-2xl border border-white/15 bg-white/95 p-5 text-slate-800 shadow-2xl shadow-teal-950/40">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Live queue &middot; Chabahil Branch
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-xs text-slate-400">Your token</p>
                  <p className="font-mono text-4xl font-bold tabular-nums text-teal-700">
                    #{tokenNumber}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700">
                  <Clock className="h-4 w-4" /> ~8 min wait
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Dr. Anjali Shrestha</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    Confirmed
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">General Physician</span>
                  <span className="text-slate-400">Today, 3:40 PM</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
                SMS confirmation sent to +977 98••••••21
              </div>
            </div>

            <div className="absolute -left-4 -top-4 hidden rounded-xl border border-white/20 bg-teal-950/80 px-3 py-2 text-xs font-semibold text-teal-50 shadow-lg backdrop-blur sm:block">
              500+ patients booked this month
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;