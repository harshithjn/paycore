import apiClient from './client';

export interface RefundRequest {
  transactionId: string;
  amount: number;
  type: 'FULL' | 'PARTIAL';
  reason?: string;
}

export interface RefundResponse {
  refundId: string;
  transactionId: string;
  amount: number;
  status: string;
  type: string;
  reason?: string;
  createdAt: string;
  processedAt?: string;
  message?: string;
}

export const refundApi = {
  processRefund: async (request: RefundRequest): Promise<RefundResponse> => {
    const response = await apiClient.post('/api/refund', request);
    return response.data;
  },

  getRefundsByTransaction: async (transactionId: string): Promise<RefundResponse[]> => {
    const response = await apiClient.get(`/api/refunds?transactionId=${transactionId}`);
    return response.data;
  },

  getRemainingAmount: async (transactionId: string): Promise<{ transactionId: string; remainingAmount: number }> => {
    const response = await apiClient.get(`/api/refunds/remaining/${transactionId}`);
    return response.data;
  },
};
