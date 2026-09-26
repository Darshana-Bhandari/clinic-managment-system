import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/authHooks';
import { getBillSummary } from '../../../services/billingService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import PaymentModal from '../../../components/ui/PaymentModal';
import toast from 'react-hot-toast';
import {
  DollarSign,
  Eye,
  CreditCard,
  Search,
} from 'lucide-react';

const PatientBills = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bills, setBills] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = useCallback(async () => {
    try {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      const patientId = user?.patientId || user?.profile?.patientId || user?.id;
      if (patientId) {
        const data = await getBillSummary({ patientId });
        setBills(Array.isArray(data?.bills) ? data.bills : Array.isArray(data) ? data : []);
      } else {
        setBills([]);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load bills');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handlePayClick = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  const filteredBills = statusFilter === 'ALL'
    ? bills
    : bills.filter((b) => b.status === statusFilter);

  const getStatusBadge = (status) => {
    const styles = {
      UNPAID: 'bg-red-100 text-red-800',
      PAID: 'bg-green-100 text-green-800',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      REFUNDED: 'bg-purple-100 text-purple-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading bills..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bills</h1>
        <p className="text-gray-600 mt-1">View and pay your hospital bills</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
          </select>
        </div>
      </div>

      {filteredBills.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm text-center py-16">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No bills found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBills.map((bill) => {
            const totalPaid =
              bill.payments?.reduce((s, p) => s + p.amount, 0) || 0;
            const remaining = bill.totalAmount - totalPaid;
            const canPay =
              bill.status !== 'PAID' &&
              bill.status !== 'CANCELLED' &&
              remaining > 0;

            return (
              <div
                key={bill.id}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-mono text-sm text-gray-500">
                      {bill.invoiceNumber || bill.id}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(bill.generatedAt || bill.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                      bill.status
                    )}`}
                  >
                    {bill.status?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rs. {bill.totalAmount?.toLocaleString()}
                  </p>
                  {totalPaid > 0 && (
                    <div className="mt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-green-600">
                          Paid: Rs. {totalPaid.toLocaleString()}
                        </span>
                        {remaining > 0 && (
                          <span className="text-red-600">
                            Due: Rs. {remaining.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {bill.items?.length > 0 && (
                  <div className="mb-4 text-xs text-gray-500">
                    {bill.items.slice(0, 2).map((item, i) => (
                      <p key={i} className="truncate">
                        • {item.description || item.name}
                      </p>
                    ))}
                    {bill.items.length > 2 && (
                      <p className="text-gray-400">
                        +{bill.items.length - 2} more items
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t">
                  <Link
                    to={`/patient/billing/${bill.id}`}
                    className="flex-1 text-center py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium inline-flex items-center justify-center gap-1"
                  >
                    <Eye size={14} /> View
                  </Link>
                  {canPay && (
                    <button
                      onClick={() => handlePayClick(bill)}
                      className="flex-1 text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium inline-flex items-center justify-center gap-1"
                    >
                      <CreditCard size={14} /> Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bill={selectedBill}
        onSuccess={fetchBills}
      />
    </div>
  );
};

export default PatientBills;