import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  verifyKhaltiPayment,
  verifyEsewaPayment,
} from '../../services/paymentService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiArrowRight,
} from 'react-icons/fi';

const PaymentSuccess = () => {
    
 

  //  RENDER 
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <LoadingSpinner size="lg" />
          <h2 className="text-xl font-bold text-gray-900 mt-4">
            Verifying Payment...
          </h2>
          <p className="text-gray-600 mt-2">
            Please wait while we verify your payment with the gateway
          </p>
        </div>
      </div>
    );
  }

  const isSuccess = verificationResult?.success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {isSuccess ? (
            <FiCheckCircle size={48} className="text-green-600" />
          ) : (
            <FiXCircle size={48} className="text-red-600" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h2>

        <p className="text-gray-600 mb-6">
          {isSuccess
            ? 'Your payment has been processed successfully.'
            : error || 'There was an issue with your payment.'}
        </p>

        {/* Payment Details */}
        {isSuccess && verificationResult?.payment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold">
                Rs. {verificationResult.payment.amount?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-xs">
                {verificationResult.verification?.transaction_id ||
                  verificationResult.payment.transactionId}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {verificationResult.payment.status}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isSuccess && (
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <FiDownload /> Download Receipt
            </button>
          )}

          <Link
            to={
              isSuccess
                ? `/${localStorage.getItem('auth_role')?.toLowerCase() || ''}/billing`
                : '/'
            }
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium ${
              isSuccess ? 'text-gray-700' : 'text-blue-600 border-blue-600'
            }`}
          >
            {isSuccess ? (
              <>
                Back to Billing <FiArrowRight />
              </>
            ) : (
              'Try Again'
            )}
          </Link>
        </div>

        {isSuccess && (
          <p className="text-xs text-gray-500 mt-6">
            Redirecting to dashboard in 5 seconds...
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;