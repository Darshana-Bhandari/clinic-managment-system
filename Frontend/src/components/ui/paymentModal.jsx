import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiX,
  FiCreditCard,
  FiDollarSign,
  FiSmartphone,
  FiCheck,
} from 'react-icons/fi';
import {
  processPayment,
  initiateKhaltiPayment,
  initiateEsewaPayment,
} from '../../services/paymentServices';
import LoadingSpinner from '../ui/LoadingSpinner';

const PaymentModal = ({ isOpen, onClose, bill, onSuccess }) => {
  const [method, setMethod] = useState('CASH');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate remaining balance
  const totalPaid = bill?.payments?.reduce((s, p) => s + p.amount, 0) || 0;
  const remaining = (bill?.totalAmount || 0) - totalPaid;

  React.useEffect(() => {
    if (isOpen) {
      setAmount(remaining.toString());
      setMethod('CASH');
    }
  }, [isOpen, remaining]);

  if (!isOpen || !bill) return null;

  // ==================== HANDLERS ====================
  const handleCashCardPayment = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    if (Number(amount) > remaining) {
      toast.error(`Amount cannot exceed remaining balance of Rs. ${remaining}`);
      return;
    }

    setIsProcessing(true);
    try {
      await processPayment({
        billId: bill.id,
        amount: Number(amount),
        method,
      });
      toast.success('Payment processed successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKhaltiPayment = async () => {
    setIsProcessing(true);
    try {
      const result = await initiateKhaltiPayment({
        amount: Math.round(Number(amount) * 100), // Convert to paisa
        purchaseOrderId: `BILL-${bill.billNumber}-${Date.now()}`,
        purchaseOrderName: `Bill Payment - ${bill.invoiceNumber}`,
        customerName: bill.patient?.user?.fullName,
        customerEmail: bill.patient?.user?.email,
        customerPhone: bill.patient?.user?.phone,
        paymentType: 'BILL',
        referenceId: bill.id,
      });

      // Store payment info for verification on return
      localStorage.setItem(
        'pending_payment',
        JSON.stringify({
          gateway: 'khalti',
          pidx: result.pidx,
          billId: bill.id,
          amount: Number(amount),
        })
      );

      // Redirect to Khalti
      window.location.href = result.paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Khalti payment failed');
      setIsProcessing(false);
    }
  };

  const handleEsewaPayment = async () => {
    setIsProcessing(true);
    try {
      const result = await initiateEsewaPayment({
        amount: Number(amount),
        purchaseOrderId: `BILL-${bill.billNumber}-${Date.now()}`,
        purchaseOrderName: `Bill Payment - ${bill.invoiceNumber}`,
        customerName: bill.patient?.user?.fullName,
        customerEmail: bill.patient?.user?.email,
        customerPhone: bill.patient?.user?.phone,
        paymentType: 'BILL',
        referenceId: bill.id,
      });

      // Store for verification
      localStorage.setItem(
        'pending_payment',
        JSON.stringify({
          gateway: 'esewa',
          transactionUuid: result.transactionUuid,
          billId: bill.id,
          amount: Number(amount),
        })
      );

      // Redirect to eSewa
      window.location.href = result.paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'eSewa payment failed');
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (method === '_KHALTI') return handleKhaltiPayment();
    if (method === 'ESEWA') return handleEsewaPayment();
    return handleCashCardPayment();
  };

  //RENDER 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-xl font-bold text-gray-900">Process Payment</h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Bill Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Invoice #</span>
              <span className="font-mono font-medium">{bill.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold">
                Rs. {bill.totalAmount?.toLocaleString()}
              </span>
            </div>
            {totalPaid > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Already Paid</span>
                <span className="font-medium text-green-600">
                  Rs. {totalPaid.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-blue-200 mt-2">
              <span className="font-semibold text-gray-700">Remaining</span>
              <span className="font-bold text-lg text-blue-700">
                Rs. {remaining.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Pay (Rs.)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={remaining}
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: Rs. {remaining.toLocaleString()}
            </p>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'CASH',
                  label: 'Cash',
                  icon: FiDollarSign,
                  color: 'text-green-600',
                },
               
               
                {
                  id: 'KHALTI',
                  label: 'Pay with Khalti',
                  icon: FiSmartphone,
                  color: 'text-purple-600',
                  badge: 'Recommended',
                },
                {
                  id: 'ESEWA',
                  label: 'Pay with eSewa',
                  icon: FiSmartphone,
                  color: 'text-green-600',
                },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    disabled={isProcessing}
                    className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } disabled:opacity-50`}
                  >
                    <Icon size={20} className={m.color} />
                    <span className="flex-1 text-left font-medium text-gray-900">
                      {m.label}
                    </span>
                    {m.badge && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {m.badge}
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <FiCheck size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info for Online Payments */}
          {(method === 'ONLINE_KHALTI' || method === 'ONLINE_ESEWA') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                You will be redirected to{' '}
                <strong>
                  {method === 'ONLINE_KHALTI' ? 'Khalti' : 'eSewa'}
                </strong>{' '}
                to complete your payment. After successful payment, you'll be
                redirected back.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing || !amount || Number(amount) <= 0}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" /> Processing...
              </>
            ) : (
              `Pay Rs. ${Number(amount).toLocaleString()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;