import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCard, Smartphone, ShieldCheck, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const DemoCheckout: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [cvv, setCvv] = useState('');
  
  useEffect(() => {
    if (transactionId) {
      loadTransaction(transactionId);
    }
  }, [transactionId]);

  const loadTransaction = async (id: string) => {
    try {
      const data = await paymentApi.getTransactionStatus(id);
      setTransaction(data);
      if (data.status === 'SUCCESS') setStatus('success');
      if (data.status === 'FAILED') setStatus('failed');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Demo Logic: CVV 111 = decline
    const newStatus = cvv === '111' ? 'FAILED' : 'SUCCESS';
    const failureReason = cvv === '111' ? 'Declined by Bank' : undefined;

    try {
      // Direct API call to update status on backend
      await fetch(`http://localhost:8081/api/transaction/${transactionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, failureReason })
      });
      setStatus(newStatus.toLowerCase() as any);
    } catch (err) {
      console.error('Payment update failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
        Transaction not found or expired.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] flex flex-col font-sans text-[#111] dark:text-[#EAEAEA]">
      <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full">
        
        {/* Left Side: Order Details */}
        <div className="md:w-[45%] bg-white dark:bg-[#111] border-r border-[#E5E7EB] dark:border-[#2A2A2A] p-8 md:p-12 hidden md:block">
          <div className="sticky top-12">
            <h2 className="text-xl font-medium mb-1 truncate text-gray-500">PayCore Demo Checkout</h2>
            <div className="text-4xl font-semibold mt-4 mb-8 text-[#111] dark:text-white">
              ₹{(transaction.amount || 0).toFixed(2)}
            </div>
            
            <div className="space-y-4 text-sm text-[#6B7280] dark:text-gray-400 border-t border-[#E5E7EB] dark:border-[#2A2A2A] pt-6">
              <div className="flex justify-between">
                <span>Transaction ID</span>
                <span className="text-[#111] dark:text-[#EAEAEA] font-medium">{transaction.id?.split('-')[0]}...</span>
              </div>
              <div className="flex justify-between">
                <span>Method</span>
                <span className="text-[#111] dark:text-[#EAEAEA] font-medium uppercase">{transaction.payment_method}</span>
              </div>
            </div>
            
            <div className="mt-12 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl flex items-start gap-3 border border-indigo-100 dark:border-indigo-900/30">
              <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-800 dark:text-indigo-300">
                This is a secure, encrypted demo checkout. No funds will be captured. 
                <br /><strong className="mt-1 block">Demo Tip: Use CVV 111 to simulate a declined payment.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-full md:w-[55%] p-6 md:p-12 relative">
          
          <div className="md:hidden mb-8 pb-6 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
            <h2 className="text-sm font-medium text-gray-500">Demo Order</h2>
            <div className="text-3xl font-semibold mt-1">₹{(transaction.amount || 0).toFixed(2)}</div>
          </div>

          <h2 className="text-2xl font-medium mb-8">Payment Details</h2>

          {status === 'success' && (
            <div className="absolute inset-0 z-10 bg-[#FAFAFA]/90 dark:bg-[#0B0B0C]/90 backdrop-blur-sm flex items-center justify-center p-8">
              <div className="text-center transform animate-in zoom-in duration-300">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-medium mb-2">Payment Successful</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 w-64 mx-auto">Your test payment was processed and the transaction is complete.</p>
                <button 
                  onClick={() => window.close()} 
                  className="bg-[#111] dark:bg-white text-white dark:text-[#111] px-6 py-2.5 rounded-lg font-medium hover:bg-black/80 dark:hover:bg-gray-200 transition-all font-sm w-full"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="absolute inset-0 z-10 bg-[#FAFAFA]/90 dark:bg-[#0B0B0C]/90 backdrop-blur-sm flex items-center justify-center p-8">
              <div className="text-center transform animate-in zoom-in duration-300">
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-medium mb-2">Payment Declined</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 w-64 mx-auto">The bank rejected the payment. This usually happens if the CVV was 111.</p>
                <button 
                  onClick={() => window.close()} 
                  className="w-full bg-white dark:bg-[#111] text-[#111] dark:text-white border border-[#E5E7EB] dark:border-[#2A2A2A] px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-all font-sm"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-xl overflow-x-auto scroller-hide">
              <button className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-[#2A2A2A] text-sm font-medium rounded-lg shadow-sm">
                <CreditCard className="w-4 h-4" /> Card
              </button>
              <button disabled className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-200/50 dark:hover:bg-[#222]">
                UPI
              </button>
              <button disabled className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-200/50 dark:hover:bg-[#222]">
                <Smartphone className="w-4 h-4" /> Wallet
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card number</label>
                <input 
                  type="text" 
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl text-sm focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all placeholder:text-gray-400"
                  defaultValue="4242 4242 4242 4242" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry date</label>
                  <input 
                    type="text" 
                    placeholder="MM / YY"
                    className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl text-sm focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all placeholder:text-gray-400"
                    defaultValue="12 / 28" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVC / CVV</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={4}
                    className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl text-sm focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full relative flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#4F46E5] hover:bg-indigo-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                     <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Pay ₹{(transaction.amount || 0).toFixed(2)}
                      <ArrowRight className="absolute right-4 w-5 h-5 text-indigo-300" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
