import { useState } from 'react';
import { Bell, CreditCard, Save, Building2 } from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}
    role="switch"
    aria-checked={checked}
  >
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'left-0.5 translate-x-5' : 'left-0.5'}`} />
  </button>
);

const Field = ({ label, defaultValue, type = 'text' }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <input type={type} defaultValue={defaultValue} className="input" />
  </label>
);

const StaffSetting = () => {
  const [notif, setNotif] = useState({ bookings: true, payments: true, noshow: false });
  const [pay, setPay] = useState({ esewa: true, khalti: true });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Clinic profile" subtitle="Shown on the public website">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white"><Building2 className="h-6 w-6" /></span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">MediCare Clinic</p>
              <p className="text-xs text-slate-400">Chabahil, Kathmandu</p>
            </div>
          </div>
          <Field label="Clinic name" defaultValue="MediCare Clinic" />
          <Field label="Phone" defaultValue="+977-1-444-5678" />
          <Field label="Email" defaultValue="hello@medicare.com.np" />
          <Field label="Address" defaultValue="Chabahil, Kathmandu, Nepal" />
          <button className="btn btn-primary btn-sm"><Save className="h-4 w-4" /> Save changes</button>
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard title="Notifications" subtitle="Real-time staff alerts">
          <ul className="space-y-4">
            {[
              { key: 'bookings', label: 'New online bookings', desc: 'Alert when a patient books from the website' },
              { key: 'payments', label: 'Payments received', desc: 'Alert on successful eSewa / Khalti payment' },
              { key: 'noshow', label: 'No-show reminders', desc: 'Daily digest of missed appointments' },
            ].map((n) => (
              <li key={n.key} className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300"><Bell className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{n.label}</p>
                    <p className="text-xs text-slate-400">{n.desc}</p>
                  </div>
                </div>
                <Toggle checked={notif[n.key]} onChange={(v) => setNotif((s) => ({ ...s, [n.key]: v }))} />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Payment gateways" subtitle="Nepali digital payments">
          <ul className="space-y-4">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"><CreditCard className="h-4 w-4" /></span><span className="text-sm font-semibold text-slate-800 dark:text-slate-200">eSewa</span></span>
              <Toggle checked={pay.esewa} onChange={(v) => setPay((s) => ({ ...s, esewa: v }))} />
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300"><CreditCard className="h-4 w-4" /></span><span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Khalti</span></span>
              <Toggle checked={pay.khalti} onChange={(v) => setPay((s) => ({ ...s, khalti: v }))} />
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
};

export default StaffSetting;
