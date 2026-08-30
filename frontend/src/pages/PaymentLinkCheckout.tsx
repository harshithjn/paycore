import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { developerApi } from '../api/developerApi';
import { Toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { CreditCard, Smartphone, Building, CheckCircle, XCircle, Shield } from 'lucide-react';

export const PaymentLinkCheckout = () => {
  const { linkCode } = useParams();
  const [linkDetails, setLinkDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const [customerData, setCustomerData] = useState({
    email: '',
    phone: '',
  });

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
    fetchLinkDetails();
  }, [linkCode]);

  const fetchLinkDetails = async () => {
    if (!linkCode) return;

    try {
      const data = await developerApi.getLinkDetails(linkCode);
      setLinkDetails(data);
    } catch (err: any) {
      setToast({ message: 'Payment link not found or inactive', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCode) return;

    setProcessing(true);

    try {
      const response = await developerApi.processLinkPayment(linkCode, {
        paymentMethod: paymentMethod?.toUpperCase() || 'UPI',
        customerEmail: customerData.email,
        customerPhone: customerData.phone,
      });

      if (response.status === 'SUCCESS') {
        setPaymentComplete(true);
        setToast({ message: 'Payment successful!', type: 'success' });
      } else {
        setToast({ message: response.message || 'Payment failed', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Payment processing failed', type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-[#6B7280] font-medium">Loading payment secure checkout...</div>
        </div>
      </div>
    );
  }

  if (!linkDetails || linkDetails.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-[#DC2626]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#111] dark:text-[#EAEAEA] mb-3">Link Inactive</h2>
          <p className="text-[#6B7280]">This payment link has been deactivated or does not exist. Please contact the merchant for a new link.</p>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-center max-w-sm px-6 card p-10 shadow-xl border-green-100 dark:border-green-900/20">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-[#059669]" />
          </div>
          <h2 className="text-2xl font-bold text-[#111] dark:text-[#EAEAEA] mb-4">Payment Successful!</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6B7280]">Amount Paid</span>
              <span className="font-semibold text-[#111] dark:text-[#EAEAEA]">₹{linkDetails.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6B7280]">Paid to</span>
              <span className="font-medium text-[#111] dark:text-[#EAEAEA]">{linkDetails.merchantName}</span>
            </div>
          </div>
          <p className="text-xs text-[#6B7280]">A confirmation has been sent to the merchant. You can close this window now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 dark:shadow-none">
            {linkDetails.merchantName.charAt(0)}
          </div>
          <h1 className="text-xl font-semibold text-[#111] dark:text-[#EAEAEA]">{linkDetails.merchantName}</h1>
        </div>

        <div className="card p-8 mb-8 shadow-sm border-[#E5E7EB] dark:border-[#2A2A2A]">
          <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-1">{linkDetails.title}</h2>
          <p className="text-sm text-[#6B7280] mb-6">{linkDetails.description || 'Secure payment via PayCore'}</p>

          <div className="flex items-baseline gap-1 mb-8">
             <span className="text-4xl font-bold text-[#111] dark:text-[#EAEAEA]">₹{linkDetails.amount.toFixed(2)}</span>
             <span className="text-sm text-[#6B7280] font-medium uppercase tracking-wider">{linkDetails.currency}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] uppercase mb-1.5">Your Email</label>
              <input
                type="email"
                placeholder="customer@example.com"
                value={customerData.email}
                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                className="w-full bg-[#F9FAFB] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {!paymentMethod && (
          <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest px-1">Select Payment Method</h3>

            <button
              onClick={() => setPaymentMethod('upi')}
              className="w-full flex items-center gap-4 p-5 bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
            >
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Smartphone size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-[#111] dark:text-[#EAEAEA]">UPI</div>
                <div className="text-xs text-[#6B7280]">GPay, PhonePe, Paytm</div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className="w-full flex items-center gap-4 p-5 bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
            >
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <CreditCard size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-[#111] dark:text-[#EAEAEA]">Credit / Debit Cards</div>
                <div className="text-xs text-[#6B7280]">Visa, Mastercard, RuPay</div>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('netbanking')}
              className="w-full flex items-center gap-4 p-5 bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
            >
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Building size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-[#111] dark:text-[#EAEAEA]">Net Banking</div>
                <div className="text-xs text-[#6B7280]">All major Indian banks</div>
              </div>
            </button>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="card p-8 animate-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setPaymentMethod(null)}
              className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 block"
            >
              ← Change Method
            </button>
            <h3 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Enter Card Details</h3>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase mb-1.5">Card Number</label>
                <input
                  type="text" required maxLength={16}
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-[#F9FAFB] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0000 0000 0000 0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase mb-1.5">Expiry</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="MM" maxLength={2} className="w-full bg-[#F9FAFB] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl px-3 py-3 text-sm text-center" />
                    <input type="text" placeholder="YY" maxLength={2} className="w-full bg-[#F9FAFB] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl px-3 py-3 text-sm text-center" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase mb-1.5">CVV</label>
                  <input type="password" placeholder="***" maxLength={3} className="w-full bg-[#F9FAFB] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-center" />
                </div>
              </div>
              <Button type="submit" disabled={processing} className="w-full py-4 rounded-xl mt-4">
                {processing ? 'Processing...' : `Pay ₹${linkDetails.amount.toFixed(2)}`}
              </Button>
            </form>
          </div>
        )}

        {paymentMethod === 'upi' && (
          <div className="card p-8 animate-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setPaymentMethod(null)}
              className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 block"
            >
              ← Change Method
            </button>
            <h3 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Pay via UPI</h3>
            <form onSubmit={handlePayment} className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 bg-[#F9FAFB] dark:bg-[#1A1A1A] rounded-2xl border-2 border-dashed border-[#E5E7EB] dark:border-[#2A2A2A] mb-4">
                <div className="bg-white p-3 rounded-xl mb-4 shadow-sm">
                   <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=paycore@demo&am=${linkDetails.amount}&cu=INR`}
                    alt="UPI QR"
                    className="w-32 h-32"
                   />
                </div>
                <p className="text-xs text-[#6B7280] text-center">Scan QR with any UPI app to pay</p>
              </div>

              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-[#E5E7EB] dark:border-[#2A2A2A]"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-[#6B7280] uppercase tracking-widest">or enter VPA</span>
                <div className="flex-grow border-t border-[#E5E7EB] dark:border-[#2A2A2A]"></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] uppercase mb-1.5">UPI ID</label>
                <input
                  type="text" required
                  value={upiData.upiId}
                  onChange={(e) => setUpiData({ ...upiData, upiId: e.target.value })}
                  className="w-full bg-[#F9FAFB] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="yourname@upi"
                />
              </div>
              <Button type="submit" disabled={processing} className="w-full py-4 rounded-xl">
                {processing ? 'Verifying payment...' : `Confirm Payment ₹${linkDetails.amount.toFixed(2)}`}
              </Button>
            </form>
          </div>
        )}

        {paymentMethod === 'netbanking' && (
          <div className="card p-8 animate-in slide-in-from-right-4 duration-300">
            <button
              onClick={() => setPaymentMethod(null)}
              className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 block"
            >
              ← Change Method
            </button>
            <h3 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Select Bank</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['HDFC', 'SBI', 'ICICI', 'AXIS', 'KOTAK', 'PNB'].map((bank) => (
                <button
                  key={bank}
                  onClick={handlePayment}
                  disabled={processing}
                  className="p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors text-center font-bold text-sm text-[#111] dark:text-[#EAEAEA]"
                >
                  {bank}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-center flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-[#6B7280]">
             <Shield size={14} />
             <span className="text-[10px] font-bold uppercase tracking-widest">PCI-DSS Compliant Secure Payment</span>
          </div>
          <p className="text-[10px] text-[#9CA3AF]">Powered by <span className="font-bold text-indigo-600">PayCore</span> Gateway</p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
