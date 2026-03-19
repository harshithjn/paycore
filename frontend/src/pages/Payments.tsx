import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentApi } from '../api/paymentApi';
import type { PaymentInitiateRequest } from '../types';
import { Toast } from '../components/ui/Toast';

export const Payments = () => {
  const { merchantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'UPI',
    merchantTransactionId: '',
    customerEmail: '',
    customerPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!merchantId || !formData.amount) {
      setToast({ message: 'Please fill required fields', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const request: PaymentInitiateRequest = {
        merchantId: Number(merchantId),
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        merchantTransactionId: formData.merchantTransactionId || undefined,
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
      };

      const response = await paymentApi.initiatePayment(request);
      
      setToast({ message: `Payment initiated: ${response.transactionId}`, type: 'success' });
      
      // Reset form
      setFormData({
        amount: '',
        paymentMethod: 'UPI',
        merchantTransactionId: '',
        customerEmail: '',
        customerPhone: '',
      });

      // Navigate to transactions after 2 seconds
      setTimeout(() => {
        navigate(`/merchant/${merchantId}/transactions`);
      }, 2000);
      
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to initiate payment', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Initiate Payment</h1>

      <div className="max-w-2xl">
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                Amount <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                Payment Method <span className="text-[#DC2626]">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="input-field"
              >
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="NET_BANKING">Net Banking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                Merchant Transaction ID
              </label>
              <input
                type="text"
                value={formData.merchantTransactionId}
                onChange={(e) => setFormData({ ...formData, merchantTransactionId: e.target.value })}
                className="input-field"
                placeholder="Optional reference ID"
              />
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                Customer Email
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="input-field"
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-[#6B7280] mb-2">
                Customer Phone
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="input-field"
                placeholder="+1234567890"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : 'Initiate Payment'}
              </button>
            </div>
          </form>
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
