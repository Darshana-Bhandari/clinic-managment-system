import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiXCircle,
  FiArrowLeft,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';

const PaymentFailure = () => {


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
          <FiXCircle size={48} className="text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h2>
        <p className="text-gray-600 mb-6">{reason}</p>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex gap-3">
            <FiAlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-1">
                What to do next?
              </p>
              <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                <li>Make sure you have sufficient balance</li>
                <li>Check your internet connection</li>
                <li>Try a different payment method</li>
                <li>If money was deducted, it will be refunded within 3-5 business days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reference IDs */}
        {(pidx || transactionUuid) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-xs text-gray-500 mb-1">Reference ID</p>
            <p className="font-mono text-sm text-gray-700">
              {pidx || transactionUuid}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to={`/${localStorage.getItem('auth_role')?.toLowerCase() || ''}/billing`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <FiRefreshCw /> Try Again
          </Link>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            <FiArrowLeft /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;