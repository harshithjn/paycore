import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { paymentApi } from '../api/paymentApi';
import type { Transaction } from '../types';
import { Toast } from '../components/ui/Toast';
import { CreditCard, Smartphone, Building, CheckCircle, XCircle } from 'lucide-react';

export const CustomerPayment = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cvv: '',
    expiryMonth: '',
    expiryYear: '',
    cardholderName: '',
  });

  const [upiData, setUpiData] = useState({
    upiId: '',
  });

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  const fetchTransaction = async () => {
    if (!transactionId) return;
    
    try {
      const data = await paymentApi.getTransactionStatus(transactionId);
      setTransaction(data);
      
      if (data.status === 'SUCCESS') {
        setPaymentComplete(true);
      }
    } catch (err) {
      setToast({ message: 'Transaction not found', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch('http://localhost:8081/api/gateway/pay/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          ...cardData,
        }),
      });

      const data = await response.json();
      
      if (data.status === 'SUCCESS') {
        setPaymentComplete(true);
        setToast({ message: 'Payment successful!', type: 'success' });
        fetchTransaction();
      } else {
        setToast({ message: data.message || 'Payment failed', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Payment processing failed', type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleUPIPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch('http://localhost:8081/api/gateway/pay/upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          ...upiData,
        }),
      });

      const data = await response.json();
      
      if (data.status === 'SUCCESS') {
        setPaymentComplete(true);
        setToast({ message: 'Payment successful!', type: 'success' });
        fetchTransaction();
      } else {
        setToast({ message: data.message || 'Payment failed', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Payment processing failed', type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-[#6B7280]">Loading...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-center">
          <XCircle size={48} className="text-[#DC2626] mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#111] dark:text-[#EAEAEA]">Transaction not found</h2>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle size={64} className="text-[#059669] mx-auto mb-4" />
          <h2 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-2">Payment Successful!</h2>
          <p className="text-[#6B7280]">Amount: ₹{transaction.amount.toFixed(2)}</p>
          <p className="text-sm text-[#6B7280] mt-2">Transaction ID: {transaction.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="card p-6 mb-6">
          <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-2">Complete Payment</h1>
          <div className="text-3xl font-medium text-[#4F46E5] mb-4">₹{transaction.amount.toFixed(2)}</div>
          <p className="text-sm text-[#6B7280]">Transaction ID: {transaction.id.substring(0, 8)}...</p>
        </div>

        {!paymentMethod && (
          <div className="card p-6">
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-4">Select Payment Method</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('upi')}
                className="w-full flex items-center gap-4 p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <Smartphone size={24} className="text-[#4F46E5]" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">UPI</div>
                  <div className="text-xs text-[#6B7280]">Google Pay, PhonePe, Paytm</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className="w-full flex items-center gap-4 p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <CreditCard size={24} className="text-[#059669]" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">Card</div>
                  <div className="text-xs text-[#6B7280]">Credit / Debit / RuPay</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('netbanking')}
                className="w-full flex items-center gap-4 p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <Building size={24} className="text-[#D97706]" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">Net Banking</div>
                  <div className="text-xs text-[#6B7280]">All major banks</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Card Payment Form */}
        {paymentMethod === 'card' && (
          <div className="card p-6">
            <button
              onClick={() => setPaymentMethod(null)}
              className="text-sm text-[#4F46E5] mb-4"
            >
              ← Back
            </button>
            
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-4">Card Details</h2>
            
            <form onSubmit={handleCardPayment} className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '') })}
                  className="input-field font-mono"
                  placeholder="1234 5678 9012 3456"
                />
                <p className="text-xs text-[#6B7280] mt-1">Use any 16-digit number</p>
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardData.cardholderName}
                  onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                  className="input-field"
                  placeholder="JOHN DOE"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Month</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={cardData.expiryMonth}
                    onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value.replace(/\D/g, '') })}
                    className="input-field"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Year</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={cardData.expiryYear}
                    onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value.replace(/\D/g, '') })}
                    className="input-field"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                    className="input-field"
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FEF3C7] dark:bg-[#78350F] dark:bg-opacity-30 rounded-lg">
                <p className="text-xs text-[#D97706] dark:text-[#FCD34D]">
                  Test: Use CVV 111 to simulate declined payment
                </p>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="btn-primary w-full"
              >
                {processing ? 'Processing...' : `Pay ₹${transaction.amount.toFixed(2)}`}
              </button>
            </form>
          </div>
        )}

        {/* UPI Payment Form */}
        {paymentMethod === 'upi' && (
          <div className="card p-6">
            <button
              onClick={() => setPaymentMethod(null)}
              className="text-sm text-[#4F46E5] mb-4"
            >
              ← Back
            </button>
            
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-4">UPI Payment</h2>
            
            <form onSubmit={handleUPIPayment} className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-2">UPI ID</label>
                <input
                  type="text"
                  required
                  value={upiData.upiId}
                  onChange={(e) => setUpiData({ ...upiData, upiId: e.target.value })}
                  className="input-field"
                  placeholder="yourname@upi"
                />
                <p className="text-xs text-[#6B7280] mt-1">Enter any UPI ID (demo mode)</p>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="btn-primary w-full"
              >
                {processing ? 'Processing...' : `Pay ₹${transaction.amount.toFixed(2)}`}
              </button>
            </form>
          </div>
        )}

        {/* Net Banking */}
        {paymentMethod === 'netbanking' && (
          <div className="card p-6">
            <button
              onClick={() => setPaymentMethod(null)}
              className="text-sm text-[#4F46E5] mb-4"
            >
              ← Back
            </button>
            
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-4">Net Banking</h2>
            
            <div className="space-y-3 mb-6">
              {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'].map((bank) => (
                <button
                  key={bank}
                  onClick={async () => {
                    setProcessing(true);
                    setTimeout(async () => {
                      await handleUPIPayment({ preventDefault: () => {} } as any);
                    }, 1500);
                  }}
                  disabled={processing}
                  className="w-full p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors text-left"
                >
                  <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">{bank}</div>
                </button>
              ))}
            </div>
          </div>
        )}
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
