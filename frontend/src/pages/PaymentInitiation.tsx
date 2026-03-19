import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PaymentForm } from '../components/payment/PaymentForm';
import { TransactionStatus } from '../components/payment/TransactionStatus';
import { TransactionList } from '../components/payment/TransactionList';
import { Toast } from '../components/ui/Toast';
import { paymentApi } from '../api/paymentApi';
import { useMerchant } from '../context/MerchantContext';
import type { Transaction } from '../types';
import { RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PaymentInitiation = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const { merchant } = useMerchant();

  const merchantIdNum = merchantId ? parseInt(merchantId) : 1;

  useEffect(() => {
    if (merchant && merchant.id === merchantIdNum) {
      loadTransactions();
    }
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
      setToast({ message: 'Failed to load transactions', type: 'error' });
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handlePaymentInitiated = (transactionId: string) => {
    setToast({ message: 'Payment initiated successfully', type: 'success' });
    setGeneratedLink(`${window.location.origin}/pay/${transactionId}`);
    startPolling(transactionId);
    loadTransactions();
  };

  const startPolling = (transactionId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const transaction = await paymentApi.getTransactionStatus(transactionId);
        setCurrentTransaction(transaction);

        if (transaction.status === 'SUCCESS' || transaction.status === 'FAILED') {
          clearInterval(interval);
          setPollingInterval(null);
          loadTransactions();
          
          setToast({
            message: transaction.status === 'SUCCESS' 
              ? 'Payment completed successfully' 
              : transaction.failure_reason || 'Payment failed',
            type: transaction.status === 'SUCCESS' ? 'success' : 'error'
          });
        }
      } catch (error) {
        console.error('Error polling transaction status:', error);
      }
    }, 2000);

    setPollingInterval(interval);
  };

  const handleError = (error: string) => {
    setToast({ message: error, type: 'error' });
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setGeneratedLink(`${window.location.origin}/pay/${transaction.id}`);
    
    if (transaction.status === 'PROCESSING' || transaction.status === 'INITIATED') {
      startPolling(transaction.id);
    }
  };

  if (!merchant || merchant.id !== merchantIdNum) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-[#111] dark:text-[#EAEAEA]">Payment Initiation</h1>
          <p className="mt-2 text-[#6B7280]">
            Merchant ID: {merchantIdNum} | Initiate payments and track transaction status
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <PaymentForm
              merchantId={merchantIdNum}
              onPaymentInitiated={handlePaymentInitiated}
              onError={handleError}
            />

            {currentTransaction && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-[#111] dark:text-[#EAEAEA]">Current Transaction</h2>
                  {(currentTransaction.status === 'PROCESSING' || currentTransaction.status === 'INITIATED') && (
                    <div className="flex items-center text-sm text-[#4F46E5]">
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      Auto-refreshing...
                    </div>
                  )}
                </div>
                
                {(currentTransaction.status === 'INITIATED' || currentTransaction.status === 'PROCESSING') && generatedLink && (
                  <div className="mb-6 p-4 border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl">
                    <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-3">Scan or click to pay limit demo payment</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(generatedLink)}`} 
                          alt="Payment QR Code" 
                          className="w-24 h-24"
                        />
                      </div>
                      <div className="w-full">
                        <input 
                          type="text" 
                          readOnly 
                          value={generatedLink} 
                          className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 text-gray-600 dark:text-gray-300 mb-2 truncate"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(generatedLink); setToast({ message: 'Link copied', type: 'info' }) }}>
                            Copy Link
                          </Button>
                          <Button size="sm" onClick={() => window.open(generatedLink, '_blank')}>
                            Open Demo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <TransactionStatus transaction={currentTransaction} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-[#111] dark:text-[#EAEAEA]">Transaction History</h2>
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
