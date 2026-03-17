import axios from './axios';
import type { PaymentInitiateRequest, PaymentInitiateResponse, Transaction } from '../types';

const API_BASE = '/api/payment';

export const paymentApi = {
  // Initiate a new payment
  initiatePayment: async (request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> => {
    const response = await axios.post(`${API_BASE}/initiate`, request);
    return response.data;
  },

  // Get transaction status
  getTransactionStatus: async (transactionId: string): Promise<Transaction> => {
    const response = await axios.get(`${API_BASE}/status/${transactionId}`);
    return response.data;
  },

  // Get all transactions for a merchant
  getMerchantTransactions: async (merchantId: number): Promise<Transaction[]> => {
    const response = await axios.get(`${API_BASE}/merchant/${merchantId}/transactions`);
    return response.data;
  },

  // Get available payment methods
  getPaymentMethods: async (): Promise<string[]> => {
    const response = await axios.get(`${API_BASE}/methods`);
    return response.data;
  }
};