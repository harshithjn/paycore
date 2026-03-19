import apiClient from './client';
import type { PaymentInitiateRequest, PaymentInitiateResponse, Transaction } from '../types';

export const paymentApi = {
  initiatePayment: async (request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> => {
    const response = await apiClient.post('/api/payment/initiate', request);
    return response.data;
  },

  getTransactionStatus: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.get(`/api/payment/status/${transactionId}`);
    return response.data;
  },

  getMerchantTransactions: async (merchantId: number): Promise<Transaction[]> => {
    const response = await apiClient.get(`/api/payment/merchant/${merchantId}/transactions`);
    return response.data;
  },

  getPaymentMethods: async (): Promise<string[]> => {
    const response = await apiClient.get('/api/payment/methods');
    return response.data;
  },
};
