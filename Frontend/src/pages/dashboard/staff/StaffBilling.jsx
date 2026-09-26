import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBill } from '../../../services/billingService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import PaymentModal from '../../../components/ui/PaymentModal';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Printer,
  CreditCard,
  CheckCircle2,
  Smartphone,
  FileText,
} from 'lucide-react';

const StaffBilling = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ==================== FETCH ====================
  const fetchBill = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBill(id);
      setBill(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch bill';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchBill, 0);
    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ==================== RENDER ====================
  if (!id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/staff/billing')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invalid bill</h1>
            <p className="text-gray-600 mt-1">No bill ID was provided in the URL.</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-semibold mb-2">Cannot display bill</p>
          <p className="text-sm text-red-600 mb-4">Please select a bill from the billing list.</p>
          <button
            onClick={() => navigate('/staff/billing')}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-medium text-sm"
          >
            <ArrowLeft size={16} /> Back to Billing List
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" text="Loading bill..." />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/staff/billing')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bill Details</h1>
            <p className="text-gray-600 mt-1">Bill not found</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-semibold mb-2">{error || 'Bill not found'}</p>
          <p className="text-sm text-red-600 mb-4">The requested bill may have been deleted or the ID is incorrect.</p>
          <button
            onClick={() => navigate('/staff/billing')}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-medium text-sm"
          >
            <ArrowLeft size={16} /> Back to Billing List
          </button>
        </div>
      </div>
    );
  }

  const totalPaid = bill.payments?.reduce((s, p) => s + p.amount, 0) || 0;
  const remaining = bill.totalAmount - totalPaid;
  const canPay = bill.status !== 'PAID' && bill.status !== 'CANCELLED' && remaining > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/staff/billing')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bill Details</h1>
            <p className="text-gray-600 mt-1 font-mono">{bill.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <FiPrinter /> Print
          </button>
          {canPay && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <FiCreditCard /> Process Payment
            </button>
          )}
        </div>
      </div>

      {/* Payment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            Rs. {bill.totalAmount?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            Rs. {totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">Remaining</p>
          <p className="text-2xl font-bold text-red-600">
            Rs. {remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-xl shadow-sm p-8 print:shadow-none" id="invoice">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Healthcare System</h2>
            <p className="text-gray-600 text-sm mt-1">123 Medical Street</p>
            <p className="text-gray-600 text-sm">Kathmandu, Nepal</p>
            <p className="text-gray-600 text-sm">+977 9800000000</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Invoice #:</span> {bill.invoiceNumber}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Bill #:</span> {bill.billNumber}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span>{' '}
              {new Date(bill.generatedAt).toLocaleDateString()}
            </p>
            <span
              className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
                bill.status === 'PAID'
                  ? 'bg-green-100 text-green-800'
                  : bill.status === 'UNPAID'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {bill.status}
            </span>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">BILL TO:</h4>
          <p className="font-medium text-gray-900">
            {bill.patient?.user?.fullName || 'N/A'}
          </p>
          <p className="text-gray-600 text-sm">{bill.patient?.user?.email}</p>
          <p className="text-gray-600 text-sm">{bill.patient?.user?.phone}</p>
          {bill.patient?.address && (
            <p className="text-gray-600 text-sm">{bill.patient.address}</p>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                Description
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                Qty
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                Unit Price
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bill.items?.map((item, i) => (
              <tr key={i}>
                <td className="py-3 px-4 text-sm text-gray-900">
                  {item.description}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 text-center">
                  {item.quantity}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 text-right">
                  Rs. {item.unitPrice}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                  Rs. {item.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">Rs. {bill.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">Rs. {bill.tax}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">
                  -Rs. {bill.discount}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-lg">
                Rs. {bill.totalAmount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {bill.payments?.length > 0 && (
          <div className="pt-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-4">Payment History</h4>
            <div className="space-y-3">
              {bill.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      {payment.method === 'ONLINE' ? (
                        <FiSmartphone className="text-green-600" size={16} />
                      ) : (
                        <FiCheckCircle className="text-green-600" size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Rs. {payment.amount?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {payment.method} •{' '}
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-600">
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-medium text-green-600">
                  Rs. {totalPaid.toLocaleString()}
                </span>
              </div>
              {remaining > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-red-600">
                    Rs. {remaining.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bill={bill}
        onSuccess={fetchBill}
      />
    </div>
  );
};

export default StaffBilling;