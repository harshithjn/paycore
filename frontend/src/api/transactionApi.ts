import apiClient from './client';
import type { Transaction, TransactionStatusData } from '../types';

export const transactionApi = {
  getAll: async (merchantId: number): Promise<Transaction[]> => {
    const response = await apiClient.get(`/api/payment/merchant/${merchantId}/transactions`);
    return response.data;
  },

  getById: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.get(`/api/payment/status/${transactionId}`);
    return response.data;
  },

  getStatusWithDetails: async (transactionId: string): Promise<TransactionStatusData> => {
    const response = await apiClient.get(`/api/transaction/status/${transactionId}`);
    return response.data;
  },
};
