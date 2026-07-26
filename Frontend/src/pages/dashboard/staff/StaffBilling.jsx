
import { Download, Wallet, TrendingUp, Clock } from 'lucide-react';
import StatCard from '../../../components/sections/StatCar';
import SectionCard from '../../../components/sections/SectionCard';
import StatusPill from '../../../components/sections/StatusPill';
import { invoices, currency } from '../../../utils/dashboardData';

const methodTone = {
  eSewa: 'text-emerald-600 dark:text-emerald-400',
  Khalti: 'text-violet-600 dark:text-violet-400',
  Cash: 'text-amber-600 dark:text-amber-400',
  '—': 'text-slate-400',
};

const Billing = () => {
  const paid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Collected" value={currency(paid)} delta={14.2} tone="emerald" />
        <StatCard icon={Clock} label="Pending" value={currency(pending)} delta={-3.1} tone="amber" />
        <StatCard icon={TrendingUp} label="Online share" value="77%" delta={9.4} tone="primary" />
      </div>

      <SectionCard
        title="Invoices"
        subtitle="Most recent"
        bodyClassName="p-0"
        action={<button className="btn btn-outline btn-sm"><Download className="h-4 w-4" /> Export</button>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Invoice</th>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Date</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Method</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/70">
              {invoices.map((inv) => (
                <tr key={inv.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{inv.id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">{inv.patient}</td>
                  <td className="hidden px-5 py-3 text-slate-500 sm:table-cell">{inv.date}</td>
                  <td className={`hidden px-5 py-3 font-medium md:table-cell ${methodTone[inv.method] || 'text-slate-500'}`}>{inv.method}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">{currency(inv.amount)}</td>
                  <td className="px-5 py-3"><StatusPill status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default Billing;