import React from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  Wallet,
  MapPin,
  Search,
  CalendarCheck,
  HeartHandshake,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  Star,
  Heart,
  Brain,
  Baby,
  Bone,
  Eye,
  Smile,
  Quote,
  Phone,
} from 'lucide-react';
import HeroSection from '../components/doctors/HeroSection.jsx';
import DoctorCard from '../components/doctors/DoctorCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { doctorsData } from '../utils/dummyData';

const specialties = [
  { icon: Heart, tone: 'rose', label: 'Cardiology', path: '/services/cardiology' },
  { icon: Brain, tone: 'violet', label: 'Neurology', path: '/services/neurology' },
  { icon: Baby, tone: 'sky', label: 'Pediatrics', path: '/services/pediatrics' },
  { icon: Bone, tone: 'slate', label: 'Orthopedics', path: '/services/orthopedics' },
  { icon: Eye, tone: 'teal', label: 'Ophthalmology', path: '/services/ophthalmology' },
  { icon: Smile, tone: 'cyan', label: 'Dentistry', path: '/services/dentistry' },
];

const toneClasses = {
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-300',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-300',
};

const features = [
  { icon: Stethoscope, title: 'Expert doctors', description: 'Board-certified specialists with years of hands-on clinical experience.' },
  { icon: Building2, title: 'Modern facilities', description: 'Contemporary care spaces equipped for advanced diagnostics and comfort.' },
  { icon: Wallet, title: 'Flexible payments', description: 'Simple billing with eSewa, Khalti, and pay-at-clinic options.' },
  { icon: MapPin, title: 'Convenient access', description: 'Easy appointments, fast support, and dependable follow-through.' },
];

const steps = [
  { icon: Search, title: 'Choose your specialist', description: 'Explore verified doctors by specialty, location, and availability.' },
  { icon: CalendarCheck, title: 'Book in minutes', description: 'Pick a time that works for you and confirm your visit instantly.' },
  { icon: HeartHandshake, title: 'Receive attentive care', description: 'Meet your care team with transparent follow-ups and ongoing support.' },
];

const stats = [
  { icon: Stethoscope, value: '500+', label: 'Doctors' },
  { icon: HeartHandshake, value: '50+', label: 'Specialties' },
  { icon: Star, value: '4.9/5', label: 'Average Rating' },
  { icon: Users, value: '10K+', label: 'Appointments' },
];

const testimonials = [
  { name: 'Anita Shrestha', location: 'Kathmandu', initials: 'AS', tone: 'rose', quote: 'Booked a cardiologist in two minutes and got an SMS token instantly. No more waiting in long queues — this is how healthcare should work.' },
  { name: 'Bikash Thapa', location: 'Lalitpur', initials: 'BT', tone: 'teal', quote: 'The live queue meant I arrived right when it was my turn. Paid with eSewa from my phone. Genuinely the smoothest clinic experience I have had.' },
  { name: 'Sunita Rai', location: 'Bhaktapur', initials: 'SR', tone: 'violet', quote: 'Clear doctor profiles helped me pick the right specialist for my child. Friendly staff and a follow-up reminder afterward. Highly recommended.' },
];

const differentiators = [
  '24/7 emergency support and seamless appointment coordination.',
  'Modern telehealth and in-person visits designed for flexibility.',
  'Clear communication, transparent care plans, and dependable follow-up.',
];

const featuredDoctors = [...doctorsData]
  .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
  .slice(0, 3);

const Home = () => {
  return (
    <div>
      <HeroSection />

      {/* Browse by specialty */}
      <div className="container-custom pt-16 lg:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="section-kicker"><Stethoscope className="h-4 w-4" /> Browse by specialty</span>
            <h2 className="section-title">Find the right care, fast.</h2>
          </div>
          <Link to="/services" className="hidden items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 sm:flex">
            View all specialties <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {specialties.map(({ icon: Icon, tone, label, path }) => (
            <Link
              key={label}
              to={path}
              className="card card-hover group flex flex-col items-center gap-3 p-5 text-center"
            >
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${toneClasses[tone]} transition-transform group-hover:scale-110`}>
                <Icon className="h-7 w-7" />
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="container-custom py-16 lg:py-20">
        {/* Why choose us */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-kicker"><ShieldCheck className="h-4 w-4" /> Why choose us</span>
          <h2 className="section-title">Thoughtful care for every step of your health journey.</h2>
          <p className="section-copy">
            We combine medical excellence with a smooth digital experience so every appointment feels effortless.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
            </Card>
          ))}
        </div>

        {/* Featured doctors */}
        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <span className="section-kicker"><Stethoscope className="h-4 w-4" /> Meet our doctors</span>
              <h2 className="section-title">Top-rated specialists, ready to help.</h2>
            </div>
            <Link to="/book">
              <Button variant="outline" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                View all doctors
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="section-shell p-8 lg:p-10">
            <span className="section-kicker"><CalendarCheck className="h-4 w-4" /> How it works</span>
            <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              A smoother path to better care.
            </h3>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
              From booking to follow-up, every step is designed to feel effortless and clear.
            </p>

            <div className="mt-8 space-y-4">
              {steps.map(({ icon: Icon, title, description }, index) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-500/25">
                    <Icon className="h-5 w-5" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{title}</h4>
                    <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-shell p-8 lg:p-10">
            <span className="section-kicker"><HeartHandshake className="h-4 w-4" /> Patient-first experience</span>
            <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Care that feels personal, proactive, and reassuring.
            </h3>

            <div className="mt-8 rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 to-teal-50/60 p-6 dark:border-primary-900/40 dark:from-slate-800/60 dark:to-slate-800/30">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700 dark:text-primary-300">What patients love</p>
              <ul className="mt-4 space-y-3.5">
                {[
                  'Transparent physician profiles and treatment guidance.',
                  'Flexible telehealth and in-person visits around your routine.',
                  'Dependable follow-up from booking through recovery.',
                ].map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-sm leading-6">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <Clock className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-display text-lg font-bold text-slate-900 dark:text-white">Same-day</p>
                  <p className="text-xs text-slate-500">appointments</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <ShieldCheck className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="font-display text-lg font-bold text-slate-900 dark:text-white">Secure</p>
                  <p className="text-xs text-slate-500">online payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-kicker"><Quote className="h-4 w-4" /> Patient stories</span>
            <h2 className="section-title">Loved by patients across the valley.</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="flex flex-col p-6">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="mt-4 flex-1 leading-7 text-slate-600 dark:text-slate-300">“{t.quote}”</p>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${toneClasses[t.tone]}`}>
                    {t.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.location}, Nepal</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact + differentiators */}
        <div className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-primary-900 p-8 text-white lg:p-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-500/20 blur-3xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.25em] !text-primary-300">Our impact</p>
            <h3 className="relative mt-3 font-display text-2xl font-bold !text-white [text-wrap:balance]">
              Trusted by patients who expect more.
            </h3>
            <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <Icon className="h-5 w-5 text-primary-300" />
                  <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-8 lg:p-10">
            <span className="section-kicker"><Star className="h-4 w-4" /> What sets us apart</span>
            <ul className="mt-6 space-y-4">
              {differentiators.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-6">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link to="/book">
                <Button variant="primary" size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                  Find Your Doctor
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="relative mt-16 overflow-hidden rounded-[32px] bg-gradient-to-r from-primary-700 via-primary-600 to-teal-500 p-8 text-white shadow-xl shadow-primary-900/20 sm:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-100">Ready to get started?</p>
              <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Book your visit and experience modern care today.</h3>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link to="/book">
                <Button variant="accent" size="lg" icon={<CalendarCheck className="h-5 w-5" />}>Book Appointment</Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" icon={<Phone className="h-5 w-5" />} className="border border-white/25 bg-white/10 text-white hover:bg-white/20">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;