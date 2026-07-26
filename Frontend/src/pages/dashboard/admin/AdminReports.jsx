
import { Download, TrendingUp, CalendarRange } from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import AreaChart from '../../../components/sections/AreaChart';
import DonutChart from '../../../components/sections/DonutChart';
import BarList from '../../../components/sections/BarList';
import StatCard from '../../../components/sections/StatCar';
import { revenueTrend, bookingSource, paymentMix, doctorLoad, currency } from '../../../utils/dashboardData';

const Reports = () => {
  const total = revenueTrend.reduce((s, d) => s + d.online + d.cash, 0);
  const online = revenueTrend.reduce((s, d) => s + d.online, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <CalendarRange className="h-4 w-4 text-slate-400" /> Jul 10 – Jul 23, 2026
        </div>
        <button className="btn btn-primary btn-sm"><Download className="h-4 w-4" /> Export report (CSV)</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={TrendingUp} label="Total revenue" value={currency(total)} delta={16.8} tone="emerald" />
        <StatCard icon={TrendingUp} label="Online revenue" value={currency(online)} delta={22.4} tone="primary" />
        <StatCard icon={TrendingUp} label="Avg. per day" value={currency(Math.round(total / revenueTrend.length))} delta={5.6} tone="sky" />
      </div>

      <SectionCard title="Revenue over time" subtitle="Online vs cash">
        <AreaChart data={revenueTrend} height={260} />
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Bookings by source">
          <DonutChart data={bookingSource} centerLabel="bookings" centerValue={bookingSource.reduce((s, d) => s + d.value, 0)} />
        </SectionCard>
        <SectionCard title="Payment methods">
          <DonutChart data={paymentMix} centerLabel="paid" centerValue="100%" />
        </SectionCard>
        <SectionCard title="Doctor load">
          <BarList items={doctorLoad.slice(0, 4)} unit="pts" />
        </SectionCard>
      </div>
    </div>
  );
};

export default Reports;