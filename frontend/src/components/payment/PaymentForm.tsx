import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { paymentApi } from '../../api/paymentApi';
import type { PaymentInitiateRequest } from '../../types';

interface PaymentFormProps {
  merchantId: number;
  onPaymentInitiated: (transactionId: string) => void;
  onError: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  merchantId,
  onPaymentInitiated,
  onError
}) => {
  const [formData, setFormData] = useState<PaymentInitiateRequest>({
    merchantId,
    amount: 0,
    paymentMethod: 'UPI',
    merchantTransactionId: '',
    customerEmail: '',
    customerPhone: ''
  });
  
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentApi.getPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) {
        setFormData(prev => ({ ...prev, paymentMethod: methods[0] }));
      }
    } catch (error) {
      onError('Failed to load payment methods');
    } finally {
      setIsLoadingMethods(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      onError('Amount must be greater than 0');
      return;
    }

    setIsLoading(true);
    try {
      const response = await paymentApi.initiatePayment(formData);
      onPaymentInitiated(response.transactionId);
    } catch (error: any) {
      onError(error.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  if (isLoadingMethods) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-gray-600">Loading payment methods...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Initiate Payment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount || ''}
            onChange={handleInputChange}
            min="0.01"
            step="0.01"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="merchantTransactionId" className="block text-sm font-medium text-gray-700 mb-1">
            Merchant Transaction ID (Optional)
          </label>
          <input
            type="text"
            id="merchantTransactionId"
            name="merchantTransactionId"
            value={formData.merchantTransactionId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter merchant transaction ID"
          />
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Customer Email (Optional)
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter customer email"
          />
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Customer Phone (Optional)
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter customer phone"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Initiating Payment...
            </>
          ) : (
            'Initiate Payment'
          )}
        </Button>
      </form>
    </Card>
  );
};