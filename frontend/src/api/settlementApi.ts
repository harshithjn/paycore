import apiClient from './client';

export interface SettlementRequest {
  merchantId: number;
  type: 'DAILY' | 'WEEKLY' | 'MANUAL';
}

export interface SettlementResponse {
  settlementId: string;
  merchantId: number;
  grossAmount?: number;
  netAmount: number;
  platformFee?: number;
  status: string;
  type: string;
  transactionCount: number;
  periodStart?: string;
  periodEnd?: string;
  referenceNumber: string;
  createdAt: string;
  processedAt?: string;
  message?: string;
}

export const settlementApi = {
  processSettlement: async (request: SettlementRequest): Promise<SettlementResponse> => {
    const response = await apiClient.post('/api/settlement/process', request);
    return response.data;
  },

  getByMerchant: async (merchantId: number): Promise<SettlementResponse[]> => {
    const response = await apiClient.get(`/api/settlement/merchant/${merchantId}`);
    return response.data;
  },

  getById: async (settlementId: string): Promise<SettlementResponse> => {
    const response = await apiClient.get(`/api/settlement/${settlementId}`);
    return response.data;
  },

  downloadReport: async (merchantId: number, format: 'CSV' | 'JSON'): Promise<Blob> => {
    const response = await apiClient.get(`/api/settlement/report?merchantId=${merchantId}&format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Admin APIs
  getAllSettlements: async (): Promise<SettlementResponse[]> => {
    const response = await apiClient.get('/api/admin/settlements');
    return response.data;
  },

  triggerSettlement: async (request: SettlementRequest): Promise<SettlementResponse> => {
    const response = await apiClient.post('/api/admin/settlements/trigger', request);
    return response.data;
  },
};
