import apiClient from './client';

export const verificationApi = {
  verifyTransaction: async (transactionId: string): Promise<any> => {
    const response = await apiClient.post(`/api/verification/verify/${transactionId}`);
    return response.data;
  },

  getVerificationStatus: async (transactionId: string): Promise<any> => {
    const response = await apiClient.get(`/api/verification/status/${transactionId}`);
    return response.data;
  },

  getTransactionStatus: async (transactionId: string): Promise<any> => {
    const response = await apiClient.get(`/api/transaction/status/${transactionId}`);
    return response.data;
  },

  getMerchantTransactions: async (merchantId: number): Promise<any[]> => {
    const response = await apiClient.get(`/api/payment/merchant/${merchantId}/transactions`);
    return response.data;
  },
};
