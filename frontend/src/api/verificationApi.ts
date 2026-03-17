import axios from './axios';
import type { TransactionStatusData, Transaction } from '../types';

const API_BASE = '/api/verification';

export const verificationApi = {
  // Get detailed transaction status with logs and transitions
  getTransactionStatus: async (transactionId: string): Promise<TransactionStatusData> => {
    const response = await axios.get(`${API_BASE}/status?id=${transactionId}`);
    return response.data;
  },

  // Verify transaction with payment provider
  verifyTransaction: async (transactionId: string): Promise<any> => {
    const response = await axios.post(`${API_BASE}/verify`, { transactionId });
    return response.data;
  },

  // Get merchant transactions with filtering
  getMerchantTransactions: async (
    merchantId: number, 
    filters?: {
      status?: string;
      payment_method?: string;
      from_date?: string;
      to_date?: string;
    }
  ): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_method) params.append('payment_method', filters.payment_method);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);

    const queryString = params.toString();
    const url = `${API_BASE}/merchant/${merchantId}/transactions${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url);
    return response.data;
  }
};