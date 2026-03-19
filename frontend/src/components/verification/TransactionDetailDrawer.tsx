import React, { useState, useEffect } from 'react';
import type { TransactionStatusData } from '../../types';
import { verificationApi } from '../../api/verificationApi';
import { TransactionTimeline } from './TransactionTimeline';
import { CallbackLogs } from './CallbackLogs';
import { VerificationAttempts } from './VerificationAttempts';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Toast } from '../ui/Toast';
import { 
  X, 
  RefreshCw, 
  Shield, 
  CreditCard, 
  Smartphone, 
  Building,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TransactionDetailDrawerProps {
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  transactionId,
  isOpen,
  onClose
}) => {
  const [statusData, setStatusData] = useState<TransactionStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (isOpen && transactionId) {
      loadTransactionStatus();
    }
  }, [isOpen, transactionId]);

  const loadTransactionStatus = async () => {
    setIsLoading(true);
    try {
      const data = await verificationApi.getTransactionStatus(transactionId);
      setStatusData(data);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Failed to load transaction details', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTransaction = async () => {
    if (!statusData) return;

    setIsVerifying(true);
    try {
      await verificationApi.verifyTransaction(transactionId);
      
      setToast({ message: 'Verification started successfully', type: 'success' });

      // Reload status after verification
      setTimeout(() => {
        loadTransactionStatus();
      }, 2000);

    } catch (error: any) {
      setToast({ 
        message: error.response?.data?.error || 'Failed to verify transaction', 
        type: 'error' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'UPI':
        return <Smartphone className="w-5 h-5" />;
      case 'CARD':
        return <CreditCard className="w-5 h-5" />;
      case 'NETBANKING':
        return <Building className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PROCESSING':
      case 'INITIATED':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Transaction Details</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={loadTransactionStatus}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading transaction details...</span>
              </div>
            ) : statusData ? (
              <div className="p-6 space-y-6">
                {/* Transaction Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Transaction Summary</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(statusData.transaction.status)}
                      <span className="font-medium">
                        {statusData.transaction.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Transaction ID
                      </label>
                      <p className="text-sm font-mono bg-white p-2 rounded border">
                        {statusData.transaction.id}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Amount
                      </label>
                      <p className="text-lg font-semibold">
                        {formatAmount(statusData.transaction.amount)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Payment Method
                      </label>
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(statusData.transaction.payment_method)}
                        <span className="font-medium">
                          {statusData.transaction.payment_method}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Callback Status
                      </label>
                      <div className="flex items-center space-x-2">
                        {statusData.transaction.callback_sent ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm">
                          {statusData.transaction.callback_sent ? 'Sent' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Button */}
                  {statusData.stateMetadata.allowsVerification && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        onClick={handleVerifyTransaction}
                        disabled={isVerifying}
                        className="w-full"
                      >
                        {isVerifying ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Verify Transaction
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* State Metadata */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">State Information</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    {statusData.stateMetadata.description}
                  </p>
                  {statusData.stateMetadata.validNextStates.length > 0 && (
                    <div>
                      <span className="text-xs text-blue-700">
                        Valid next states: {statusData.stateMetadata.validNextStates.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <TransactionTimeline
                  stateTransitions={statusData.stateTransitions}
                  currentStatus={statusData.transaction.status}
                />

                {/* Verification Attempts */}
                <VerificationAttempts
                  verificationAttempts={statusData.verificationAttempts}
                />

                {/* Callback Logs */}
                <CallbackLogs callbackLogs={statusData.callbackLogs} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Failed to load transaction details</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};