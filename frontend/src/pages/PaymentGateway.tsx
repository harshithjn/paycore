import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentApi } from '../api/paymentApi';
import { apiFetch } from '../lib/api';
import { Toast } from '../components/ui/Toast';
import { CreditCard, Smartphone, Building, Wallet, Percent } from 'lucide-react';

export const PaymentGateway = () => {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'method' | 'link'>('amount');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  
  const [formData, setFormData] = useState({
    amount: '',
    customerEmail: '',
    customerPhone: '',
  });

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!merchantId || !formData.amount) {
      setToast({ message: 'Please enter amount', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const response = await paymentApi.initiatePayment({
        merchantId: Number(merchantId),
        amount: parseFloat(formData.amount),
        paymentMethod: 'UPI',
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
      });

      setTransactionId(response.transactionId);
      setStep('method');
      setToast({ message: 'Payment created successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to create payment', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/gateway/generate-link/${transactionId}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      setPaymentLink(data.paymentLink);
      setQrCode(data.qrCodeData);
      setStep('link');
    } catch (err) {
      setToast({ message: 'Failed to generate payment link', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copied to clipboard', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-[#111] dark:text-[#EAEAEA]">Create Payment</h1>
          <p className="mt-2 text-[#6B7280]">Generate payment link or QR code for customers</p>
        </div>

        {/* Step 1: Amount */}
        {step === 'amount' && (
          <div className="card p-6">
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Payment Details</h2>
            
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-2">
                  Amount (₹) <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field text-2xl font-medium"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Customer Email</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="input-field"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Customer Phone</label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="input-field"
                  placeholder="+91 9876543210"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
                {loading ? 'Creating...' : 'Continue'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Choose Method */}
        {step === 'method' && (
          <div className="card p-6">
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-2">Choose Payment Option</h2>
            <p className="text-sm text-[#6B7280] mb-6">Amount: ₹{formData.amount}</p>
            
            <div className="space-y-3">
              <button
                onClick={handleGenerateLink}
                className="w-full flex items-center gap-4 p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#EEF2FF] dark:bg-[#4F46E5] dark:bg-opacity-20 flex items-center justify-center">
                  <Smartphone size={20} className="text-[#4F46E5]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">UPI / QR Code</div>
                  <div className="text-xs text-[#6B7280]">Pay using any UPI app</div>
                </div>
              </button>

              <button
                onClick={() => navigate(`/payment/${transactionId}/card`)}
                className="w-full flex items-center gap-4 p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#ECFDF5] dark:bg-[#059669] dark:bg-opacity-20 flex items-center justify-center">
                  <CreditCard size={20} className="text-[#059669]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">Credit / Debit Card</div>
                  <div className="text-xs text-[#6B7280]">Visa, Mastercard, RuPay</div>
                </div>
              </button>

              <button
                onClick={() => navigate(`/payment/${transactionId}/netbanking`)}
                className="w-full flex items-center gap-4 p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] dark:bg-[#D97706] dark:bg-opacity-20 flex items-center justify-center">
                  <Building size={20} className="text-[#D97706]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">Net Banking</div>
                  <div className="text-xs text-[#6B7280]">All major banks supported</div>
                </div>
              </button>

              <button
                disabled
                className="w-full flex items-center gap-4 p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg opacity-50 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] dark:bg-[#2A2A2A] flex items-center justify-center">
                  <Wallet size={20} className="text-[#6B7280]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#6B7280]">Wallets</div>
                  <div className="text-xs text-[#6B7280]">Coming soon</div>
                </div>
              </button>

              <button
                disabled
                className="w-full flex items-center gap-4 p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg opacity-50 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] dark:bg-[#2A2A2A] flex items-center justify-center">
                  <Percent size={20} className="text-[#6B7280]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#6B7280]">EMI</div>
                  <div className="text-xs text-[#6B7280]">Coming soon</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep('amount')}
              className="btn-secondary w-full mt-6"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Payment Link & QR */}
        {step === 'link' && (
          <div className="card p-6">
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Payment Link Generated</h2>
            
            <div className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="inline-block p-6 bg-white rounded-lg border border-[#E5E7EB]">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                    alt="Payment QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-[#6B7280] mt-3">Scan with any UPI app</p>
              </div>

              {/* Payment Link */}
              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Payment Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentLink}
                    readOnly
                    className="input-field flex-1 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(paymentLink)}
                    className="btn-secondary"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('amount');
                    setFormData({ amount: '', customerEmail: '', customerPhone: '' });
                  }}
                  className="btn-secondary flex-1"
                >
                  New Payment
                </button>
                <button
                  onClick={() => navigate(`/merchant/${merchantId}/transactions`)}
                  className="btn-primary flex-1"
                >
                  View Transactions
                </button>
              </div>
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
