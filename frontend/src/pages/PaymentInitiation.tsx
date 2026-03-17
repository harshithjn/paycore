import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PaymentForm } from '../components/payment/PaymentForm';
import { TransactionStatus } from '../components/payment/TransactionStatus';
import { TransactionList } from '../components/payment/TransactionList';
import { useToast } from '../components/ui/Toast';
import { paymentApi } from '../api/paymentApi';
import type { Transaction } from '../types';
import { RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PaymentInitiation: React.FC = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const { addToast, ToastContainer } = useToast();
  
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  const merchantIdNum = merchantId ? parseInt(merchantId) : 1;

  useEffect(() => {
    loadTransactions();
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [merchantId]);

  const loadTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const data = await paymentApi.getMerchantTransactions(merchantIdNum);
      setTransactions(data);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load transactions'
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handlePaymentInitiated = (transactionId: string) => {
    addToast({
      type: 'success',
      title: 'Payment Initiated',
      message: 'Payment has been initiated successfully'
    });

    // Start polling for transaction status
    startPolling(transactionId);
    loadTransactions();
  };

  const startPolling = (transactionId: string) => {
    // Clear existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      try {
        const transaction = await paymentApi.getTransactionStatus(transactionId);
        setCurrentTransaction(transaction);

        // Stop polling if transaction is complete
        if (transaction.status === 'SUCCESS' || transaction.status === 'FAILED') {
          clearInterval(interval);
          setPollingInterval(null);
          loadTransactions(); // Refresh the list
          
          addToast({
            type: transaction.status === 'SUCCESS' ? 'success' : 'error',
            title: `Payment ${transaction.status === 'SUCCESS' ? 'Successful' : 'Failed'}`,
            message: transaction.status === 'SUCCESS' 
              ? 'Payment completed successfully' 
              : transaction.failure_reason || 'Payment failed'
          });
        }
      } catch (error) {
        console.error('Error polling transaction status:', error);
      }
    }, 2000);

    setPollingInterval(interval);
  };

  const handleError = (error: string) => {
    addToast({
      type: 'error',
      title: 'Error',
      message: error
    });
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    
    // Start polling if transaction is still processing
    if (transaction.status === 'PROCESSING' || transaction.status === 'INITIATED') {
      startPolling(transaction.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Initiation</h1>
          <p className="mt-2 text-gray-600">
            Merchant ID: {merchantIdNum} | Initiate payments and track transaction status
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Form */}
          <div className="space-y-6">
            <PaymentForm
              merchantId={merchantIdNum}
              onPaymentInitiated={handlePaymentInitiated}
              onError={handleError}
            />

            {/* Current Transaction Status */}
            {currentTransaction && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Current Transaction</h2>
                  {(currentTransaction.status === 'PROCESSING' || currentTransaction.status === 'INITIATED') && (
                    <div className="flex items-center text-sm text-blue-600">
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      Auto-refreshing...
                    </div>
                  )}
                </div>
                <TransactionStatus transaction={currentTransaction} />
              </div>
            )}
          </div>

          {/* Right Column - Transaction List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <Button
                onClick={loadTransactions}
                disabled={isLoadingTransactions}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <TransactionList
              transactions={transactions}
              onTransactionClick={handleTransactionClick}
            />
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};