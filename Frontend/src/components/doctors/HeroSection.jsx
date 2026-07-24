import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  Check,
  Clock,
  Stethoscope,
  ArrowRight,
  Siren,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Carousel from '../ui/Carousel';

/**
 * Primary hero. Each carousel slide is the FULL hero moment — badge,
 * heading, subtitle, CTAs, and a themed live-preview card — scrolling
 * together as one block. Search and trust credentials stay anchored below
 * the carousel since they're utilities, not promo content.
 */

const SPECIALTIES = ['General Physician', 'Dermatology', 'Pediatrics', 'Dental', 'Gynecology'];

const credentials = [
  'No registration fees',
  'Direct SMS confirmations',
  'Instant live-queue tokens',
];

/* ---------- Themed preview cards, one per slide ---------- */

const BookingPreviewCard = ({ tokenNumber }) => (
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
        <p className="font-mono text-4xl font-bold tabular-nums text-teal-700">#{tokenNumber}</p>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700">
        <Clock className="h-4 w-4" /> ~8 min wait
      </div>
    </div>
    <div className="space-y-2 border-t border-slate-100 pt-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Dr. Anjali Shrestha</span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">Confirmed</span>
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
);

const EmergencyPreviewCard = () => (
  <div className="rounded-2xl border border-white/15 bg-white/95 p-5 text-slate-800 shadow-2xl shadow-rose-950/40">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dispatch tracker</span>
      <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" /> En route
      </span>
    </div>
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-xs text-slate-400">Responder ETA</p>
        <p className="font-mono text-4xl font-bold tabular-nums text-rose-600">6 min</p>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
        <MapPin className="h-4 w-4" /> 2.1 km away
      </div>
    </div>
    <div className="space-y-2 border-t border-slate-100 pt-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Responder</span>
        <span className="text-slate-700">Paramedic team B4</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Status</span>
        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600">Dispatched</span>
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
      <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />
      Live location shared with your emergency contact
    </div>
  </div>
);

const CheckupPreviewCard = () => (
  <div className="rounded-2xl border border-white/15 bg-white/95 p-5 text-slate-800 shadow-2xl shadow-violet-950/40">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Full-body checkup</span>
      <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">
        <Sparkles className="h-3 w-3" /> Popular
      </span>
    </div>
    <div className="flex items-end justify-between py-4">
      <div>
        <p className="text-xs text-slate-400">Package price</p>
        <p className="font-mono text-4xl font-bold tabular-nums text-violet-700">Rs.2,499</p>
      </div>
      <p className="pb-1 text-xs text-slate-400 line-through">Rs.3,800</p>
    </div>
    <div className="space-y-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
      <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-violet-500" strokeWidth={3} /> 42-parameter blood panel</div>
      <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-violet-500" strokeWidth={3} /> ECG + physician walkthrough</div>
    </div>
    <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
      <Clock className="h-3.5 w-3.5 text-violet-500" />
      Next available slot: this Saturday
    </div>
  </div>
);

/* ---------- Slide data ---------- */

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
    glow: 'bg-teal-600/15',
    Card: BookingPreviewCard,
    trustChip: '500+ patients booked this month',
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
    glow: 'bg-rose-500/12',
    Card: EmergencyPreviewCard,
    trustChip: 'Avg. dispatch time: 6 minutes',
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
      "Full-body screening packages with same-week slots and a physician walkthrough of every result — not just a PDF.",
    icon: HeartPulse,
    primaryCta: { label: 'View Checkup Packages', to: '/packages' },
    secondaryCta: { label: 'Talk to a Doctor', to: '/doctors' },
    glow: 'bg-violet-500/12',
    Card: CheckupPreviewCard,
    trustChip: '1,200+ checkups completed',
  },
];

const HeroSection = () => {
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(41);
  const [activeSlide, setActiveSlide] = useState(0);
  const tickRef = useRef(null);

  useEffect(() => {
    let ticks = 0;
    tickRef.current = window.setInterval(() => {
      ticks += 1;
      setTokenNumber((n) => n + 1);
      if (ticks >= 3) window.clearInterval(tickRef.current);
    }, 3400);
    return () => window.clearInterval(tickRef.current);
  }, []);

  const filteredSpecialties = query
    ? SPECIALTIES.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : SPECIALTIES;

  return (
    <section
      className="relative overflow-hidden bg-[#03211b] py-10 text-white lg:py-14"
      id="hero-section"
    >
      {/* ---------- Layered background (deep, professional teal) ---------- */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(135%_130%_at_50%_-20%,#0b5148_0%,#073a33_45%,#04231d_100%)]" />
      <div className="hero-aurora pointer-events-none absolute -left-40 -top-44 h-[34rem] w-[34rem] rounded-full bg-teal-600/20 blur-[140px]" />
      <div className="hero-aurora-2 pointer-events-none absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-emerald-700/20 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(75%_65%_at_50%_0%,#000_15%,transparent_80%)]" />

      <style>{`
        @keyframes hero-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-rise-card {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes aurora-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.12); }
        }
        @keyframes aurora-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1.05); }
          50% { transform: translate(-36px, 24px) scale(0.95); }
        }
        .hero-aurora { animation: aurora-drift 16s ease-in-out infinite; }
        .hero-aurora-2 { animation: aurora-drift-2 20s ease-in-out infinite; }
        .hero-anim > * { opacity: 0; animation: hero-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .hero-anim > *:nth-child(1) { animation-delay: 0.04s; }
        .hero-anim > *:nth-child(2) { animation-delay: 0.12s; }
        .hero-anim > *:nth-child(3) { animation-delay: 0.20s; }
        .hero-anim > *:nth-child(4) { animation-delay: 0.28s; }
        @media (prefers-reduced-motion: reduce) {
          .hero-aurora, .hero-aurora-2 { animation: none; }
        }
        .hero-anim-card { animation: hero-rise-card 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-anim > *, .hero-anim-card { animation: none; opacity: 1; }
        }
      `}</style>

      {/* Per-slide color accent — shifts hue as the carousel advances */}
      <div
        className={`pointer-events-none absolute right-0 top-1/4 h-[30rem] w-[30rem] translate-x-1/4 rounded-full blur-[120px] transition-colors duration-1000 ${slidesData[activeSlide].glow}`}
      />

      <div className="container-custom relative z-10">
        {/* Top trust bar */}
        <div className="mb-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/10 pb-4 text-sm text-teal-50/80">
          <span className="flex items-center gap-2 font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-300" /> NMC-registered clinicians
          </span>
          <span className="hidden h-4 w-px bg-white/15 sm:block" />
          <span className="flex items-center gap-2">
            <span className="text-amber-300">★★★★★</span> 4.9 from 2,300+ patients
          </span>
          <span className="hidden h-4 w-px bg-white/15 sm:block" />
          <span className="flex items-center gap-2">
            <Siren className="h-4 w-4 text-rose-300" /> 24/7 emergency dispatch
          </span>
        </div>

        <Carousel
          intervalMs={7000}
          onSlideChange={setActiveSlide}
          className="pb-2"
          slides={slidesData.map((slide, i) => {
            const Icon = slide.icon;
            const PreviewCard = slide.Card;
            const active = i === activeSlide;
            return (
              <div key={i} className="grid min-h-[320px] items-center gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
                {/* Copy — remounts + staggers in when its slide becomes active */}
                <div
                  key={active ? `copy-on-${i}` : `copy-off-${i}`}
                  className={`flex max-w-xl flex-col gap-5 ${active ? 'hero-anim' : ''}`}
                >
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-teal-50">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    {slide.badge}
                  </span>

                  <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.15rem]">
                    {slide.heading}
                  </h1>

                  <p className="max-w-lg text-base leading-relaxed text-teal-50/90 sm:text-lg">
                    {slide.subtitle}
                  </p>

                  <div className="mt-1 flex flex-col gap-4 sm:flex-row">
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

                {/* Themed preview card — travels with its slide */}
                <div
                  key={active ? `card-on-${i}` : `card-off-${i}`}
                  className={`relative mx-auto w-full max-w-sm ${active ? 'hero-anim-card' : ''}`}
                >
                  {/* soft glow + gradient ring behind the card for depth */}
                  <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-white/10 blur-2xl" />
                  <div className="rounded-[1.4rem] bg-gradient-to-br from-white/20 via-white/5 to-transparent p-px shadow-2xl shadow-teal-950/60">
                    <PreviewCard tokenNumber={tokenNumber} />
                  </div>

                  {/* floating accent pills */}
                  <div className="absolute -left-4 -top-4 hidden rounded-xl border border-white/20 bg-teal-950/85 px-3 py-2 text-xs font-semibold text-teal-50 shadow-lg backdrop-blur sm:block">
                    {slide.trustChip}
                  </div>
                  <div className="absolute -bottom-4 -right-3 hidden items-center gap-1.5 rounded-xl border border-white/20 bg-white/95 px-3 py-2 text-xs font-bold text-teal-800 shadow-lg sm:flex">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified &amp; secure
                  </div>
                </div>
              </div>
            );
          })}
        />

        {/* Anchored utilities — persistent regardless of active slide */}
        <div className="mx-auto mt-2 max-w-xl lg:mx-0">
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

        {/* ---------- Stats strip ---------- */}
        <div className="mt-8 grid grid-cols-2 divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm sm:grid-cols-4 sm:divide-x">
          {[
            { value: '10,000+', label: 'Appointments booked' },
            { value: '120+', label: 'Specialist doctors' },
            { value: '~6 min', label: 'Avg. emergency response' },
            { value: '4.9/5', label: 'Patient rating' },
          ].map((stat) => (
            <div key={stat.label} className="px-5 py-3.5 text-center sm:text-left">
              <p className="font-display text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
              <p className="mt-0.5 text-xs text-teal-100/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;