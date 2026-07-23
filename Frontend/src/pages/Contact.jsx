import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin } from '../components/ui/BrandIcons';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const contactInfo = [
  { Icon: MapPin, title: 'Address', details: 'Chabahil, Kathmandu, Nepal' },
  { Icon: Phone, title: 'Phone', details: '+977-1-444-5678' },
  { Icon: Mail, title: 'Email', details: 'hello@medicare.com.np' },
  { Icon: Clock, title: 'Working Hours', details: 'Sun–Fri: 8:00 AM – 8:00 PM' },
];

const socials = [Facebook, Twitter, Instagram, Linkedin];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="container-custom animate-fade-in-up py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="section-kicker"><MessageSquare className="h-4 w-4" /> Contact us</span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            We're here to help.
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Have questions? We'd love to hear from you. Send a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="p-8" hoverable={false}>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send a message</h3>

            {submitted && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                Thanks! Your message has been received.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <Input label="Your Name" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <Input label="Email Address" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <Input label="Subject" placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  className="input"
                  rows="4"
                  placeholder="Your message…"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" variant="primary" size="lg" fullWidth icon={<Send className="h-4.5 w-4.5" />}>
                Send Message
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-8" hoverable={false}>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Contact information</h3>
              <div className="mt-5 space-y-3">
                {contactInfo.map(({ Icon, title, details }) => (
                  <div key={title} className="flex items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8" hoverable={false}>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Follow us</h3>
              <div className="mt-5 flex gap-3">
                {socials.map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                    aria-label="Social link"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;