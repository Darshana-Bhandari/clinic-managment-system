import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, CheckCircle2, XCircle, Loader2, Receipt } from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import StatusPill from '../../../components/sections/StatusPill';
import { currency } from '../../../utils/dashboardData';
import { getBills, updateBill, cancelBill } from '../../../services/billingService';
import { processPayment } from '../../../services/paymentServices';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['ALL', 'PAID', 'UNPAID', 'PENDING', 'CANCELLED'];

const API_STATUS_TO_DISPLAY = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  PARTIALLY_PAID: 'Partially Paid',
};

const normalizeBill = (b) => ({
  ...b,
  id: b.id || b._id || b.billId,
  invoiceNumber: b.invoiceNumber || b.invoiceNo || b.billNumber || `BILL-${b.id?.slice(-6) || ''}`,
  patientName: b.patient?.user?.fullName || b.patient?.name || b.patientName || 'Unknown Patient',
  patientEmail: b.patient?.user?.email || b.patientEmail || '',
  date: b.generatedAt || b.createdAt || b.date || new Date().toISOString(),
  status: API_STATUS_TO_DISPLAY[(b.status || '').toUpperCase()] || (b.status?.charAt(0).toUpperCase() + b.status?.slice(1).toLowerCase()) || 'Pending',
  totalAmount: Number(b.totalAmount || b.amount || b.grandTotal || 0),
});

const StaffBillingList = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBills = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getBills({ limit: 100 });
      const list = Array.isArray(data?.bills) ? data.bills : Array.isArray(data) ? data : [];
      const normalized = list.map(normalizeBill);
      setBills(normalized);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load bills');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const rows = useMemo(
    () =>
      bills.filter((b) => {
        const matchStatus =
          statusFilter === 'ALL' ||
          (b.status || '').toUpperCase() === statusFilter;
        const q = searchQuery.trim().toLowerCase();
        const matchQuery =
          !q ||
          String(b.invoiceNumber || '').toLowerCase().includes(q) ||
          String(b.patientName || '').toLowerCase().includes(q) ||
          String(b.id || '').toLowerCase().includes(q);
        return matchStatus && matchQuery;
      }),
    [statusFilter, searchQuery, bills]
  );

  const handleMarkPaid = async (bill) => {
    if (!window.confirm(`Mark invoice ${bill.invoiceNumber} as fully paid?`)) return;
    const id = bill.id || bill._id;
    try {
      setActionLoading(id);
      const totalPaid = bill.payments?.reduce((s, p) => s + (Number(p.amount) || 0), 0) || 0;
      const remaining = Number(bill.totalAmount) - totalPaid;
      if (remaining > 0) {
        await processPayment({
          billId: id,
          amount: remaining,
          method: 'CASH',
          paymentDate: new Date().toISOString(),
          reference: `Cash payment - ${bill.invoiceNumber}`,
        });
      }
      await updateBill(id, { status: 'PAID' });
      toast.success(`Invoice ${bill.invoiceNumber} marked as paid`);
      fetchBills();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update bill status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bill) => {
    if (!window.confirm(`Cancel invoice ${bill.invoiceNumber}? This action cannot be undone.`)) return;
    const id = bill.id || bill._id;
    try {
      setActionLoading(id);
      await cancelBill(id, 'Cancelled by staff');
      toast.success(`Invoice ${bill.invoiceNumber} cancelled`);
      fetchBills();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to cancel bill');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice #, patient, or ID…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button onClick={() => navigate('/staff/billing/new')} className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Receipt className="h-4 w-4" /> New Bill
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <SectionCard bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3 font-semibold">Invoice #</th>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Date</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/70">
              {rows.map((b) => {
                const unpaid = b.status !== 'Paid' && b.status !== 'Cancelled';
                const isActionLoading = actionLoading === (b.id || b._id);
                return (
                  <tr key={b.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{b.invoiceNumber}</p>
                      <p className="font-mono text-[11px] text-slate-400 mt-0.5">{b.id?.slice(-8)}</p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">
                      <p>{b.patientName}</p>
                      {b.patientEmail && <p className="text-xs text-slate-400 font-normal">{b.patientEmail}</p>}
                    </td>
                    <td className="hidden px-5 py-3 text-slate-600 dark:text-slate-300 md:table-cell">
                      {new Date(b.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {currency(b.totalAmount)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={b.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          title="View details"
                          onClick={() => navigate(`/staff/billing/${b.id || b._id}`)}
                          className="rounded-lg border border-primary-200 bg-primary-50 p-1.5 text-primary-600 hover:bg-primary-100 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-primary-400"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {unpaid && (
                          <button
                            title="Mark as paid"
                            disabled={isActionLoading}
                            onClick={() => handleMarkPaid(b)}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400 disabled:opacity-50"
                          >
                            {isActionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          </button>
                        )}
                        {unpaid && (
                          <button
                            title="Cancel"
                            disabled={isActionLoading}
                            onClick={() => handleCancel(b)}
                            className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-400 disabled:opacity-50"
                          >
                            {isActionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    No bills match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default StaffBillingList;