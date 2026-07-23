import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Microscope, ShieldCheck, Globe2, ArrowRight, Building2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const values = [
  { icon: HeartHandshake, title: 'Patient First', description: 'We prioritize patient care and comfort above all else.' },
  { icon: Microscope, title: 'Innovation', description: 'Embracing the latest medical technologies and treatments.' },
  { icon: ShieldCheck, title: 'Integrity', description: 'Honest and transparent healthcare services you can trust.' },
  { icon: Globe2, title: 'Community', description: 'Serving our community with dedication and compassion.' },
];

const stats = [
  { value: '15+', label: 'Years of care' },
  { value: '500+', label: 'Specialists' },
  { value: '10K+', label: 'Patients served' },
  { value: '4.9/5', label: 'Patient rating' },
];

const About = () => {
  return (
    <div className="container-custom animate-fade-in-up py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="section-kicker"><Building2 className="h-4 w-4" /> About us</span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Caring for Nepal, one patient at a time.
          </h1>
        </div>

        <Card className="mt-10 p-8 lg:p-10">
          <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            Welcome to <span className="font-semibold text-primary-700 dark:text-primary-400">MediCare</span>, your trusted
            healthcare partner in Nepal. We are dedicated to providing exceptional medical care with a focus on patient
            comfort and satisfaction.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            Our team of experienced doctors and healthcare professionals work tirelessly to ensure you receive the best
            possible treatment using modern medical facilities and technology.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 text-center dark:border-slate-800 dark:bg-slate-800/40">
                <div className="font-display text-2xl font-bold text-primary-700 dark:text-primary-400">{stat.value}</div>
                <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <h2 className="mt-14 text-center font-display text-2xl font-bold text-slate-900 dark:text-white">Our core values</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="flex items-start gap-4 p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/doctors">
            <Button variant="primary" size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
              Meet Our Doctors
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;