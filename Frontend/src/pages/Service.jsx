import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  Brain,
  Baby,
  Bone,
  Flower2,
  Eye,
  Ear,
  Wind,
  Smile,
  Pill,
  Ambulance,
  Check,
  ArrowRight,
  HeartPulse,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const services = [
  { icon: Heart, tone: 'rose', title: 'Cardiology', description: 'Comprehensive heart care including diagnosis, treatment, and prevention of cardiovascular disease.', features: ['Heart checkups', 'ECG/EKG', 'Cardiac surgery', 'Rehabilitation'], path: '/services/cardiology' },
  { icon: Sparkles, tone: 'amber', title: 'Dermatology', description: 'Expert skin care for all conditions including acne, eczema, and cosmetic procedures.', features: ['Skin consultation', 'Acne treatment', 'Laser therapy', 'Cosmetic'], path: '/services/dermatology' },
  { icon: Brain, tone: 'violet', title: 'Neurology', description: 'Advanced diagnosis and treatment for disorders of the nervous system and brain.', features: ['Stroke care', 'Epilepsy', 'Neuro exams', 'Brain surgery'], path: '/services/neurology' },
  { icon: Baby, tone: 'sky', title: 'Pediatrics', description: 'Comprehensive healthcare for children from birth through adolescence.', features: ['Well-baby visits', 'Vaccinations', 'Development', 'Surgery'], path: '/services/pediatrics' },
  { icon: Bone, tone: 'slate', title: 'Orthopedics', description: 'Specialized care for bones, joints, ligaments, and musculoskeletal conditions.', features: ['Fracture care', 'Joint replacement', 'Sports medicine', 'Therapy'], path: '/services/orthopedics' },
  { icon: Flower2, tone: 'pink', title: 'Gynecology', description: "Comprehensive women's health services from adolescence through menopause.", features: ['Annual exams', 'Pregnancy care', 'Menopause', 'Surgery'], path: '/services/gynecology' },
  { icon: Eye, tone: 'teal', title: 'Ophthalmology', description: 'Complete eye care including diagnosis and treatment of eye conditions.', features: ['Eye exams', 'Cataract surgery', 'LASIK', 'Glaucoma'], path: '/services/ophthalmology' },
  { icon: Ear, tone: 'indigo', title: 'ENT', description: 'Specialized care for ear, nose, and throat conditions.', features: ['Hearing tests', 'Sinus treatment', 'Tonsillectomy', 'Balance'], path: '/services/ent' },
  { icon: Wind, tone: 'emerald', title: 'Psychiatry', description: 'Mental health services for depression, anxiety, and other conditions.', features: ['Evaluation', 'Therapy', 'Medication', 'Crisis care'], path: '/services/psychiatry' },
  { icon: Smile, tone: 'cyan', title: 'Dentistry', description: 'Complete dental care including preventive, restorative, and cosmetic dentistry.', features: ['Cleanings', 'Fillings', 'Root canals', 'Orthodontics'], path: '/services/dentistry' },
  { icon: Pill, tone: 'blue', title: 'Pharmacy', description: 'Full-service pharmacy with prescription fulfillment and medication counseling.', features: ['Prescriptions', 'Counseling', 'Delivery', 'Health products'], path: '/services/pharmacy' },
  { icon: Ambulance, tone: 'red', title: 'Emergency Care', description: '24/7 emergency medical services for urgent and life-threatening conditions.', features: ['24/7 available', 'Trauma care', 'Ambulance', 'Critical care'], path: '/services/emergency' },
];

const toneClasses = {
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  pink: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-300',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-300',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-300',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300',
};

const Services = () => {
  return (
    <div className="container-custom animate-fade-in-up py-16 sm:py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="section-kicker"><HeartPulse className="h-4 w-4" /> Our services</span>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Complete care across every specialty.
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          A wide range of medical services to meet all your healthcare needs — with expertise and compassion.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map(({ icon: Icon, tone, title, description, features, path }) => (
          <Card key={title} className="group flex h-full flex-col p-6">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
            <ul className="mt-4 grid grid-cols-2 gap-1.5">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary-600" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to={path}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800"
            >
              Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <div className="section-shell relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-teal-50/50 p-8 text-center dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50 sm:p-12">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Need help choosing a service?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
            Our team is here to help you find the right care for your needs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact">
              <Button variant="primary" size="lg">Contact Us</Button>
            </Link>
            <Link to="/doctors">
              <Button variant="outline" size="lg">Find a Doctor</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;