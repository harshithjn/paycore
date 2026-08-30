import apiClient from './client';
import type { PaymentLink, ApiLog } from '../types';

export const developerApi = {
  getPaymentLinks: async (merchantId: number): Promise<PaymentLink[]> => {
    const response = await apiClient.get(`/api/merchant/${merchantId}/payment-links`);
    return response.data;
  },

  createPaymentLink: async (merchantId: number, data: { title: string; description?: string; amount: number; isReusable: boolean }): Promise<PaymentLink> => {
    const response = await apiClient.post(`/api/merchant/${merchantId}/payment-links`, data);
    return response.data;
  },

  togglePaymentLink: async (merchantId: number, linkCode: string): Promise<PaymentLink> => {
    const response = await apiClient.patch(`/api/merchant/${merchantId}/payment-links/${linkCode}/toggle`);
    return response.data;
  },

  getApiLogs: async (merchantId: number): Promise<ApiLog[]> => {
    const response = await apiClient.get(`/api/merchant/${merchantId}/api-logs`);
    return response.data;
  },

  regenerateApiKey: async (merchantId: number): Promise<{ apiKey: string; message: string }> => {
    const response = await apiClient.post(`/api/merchant/${merchantId}/regenerate-key`);
    return response.data;
  },

  getLinkDetails: async (linkCode: string): Promise<any> => {
    const response = await apiClient.get(`/api/v1/payment-links/${linkCode}`);
    return response.data;
  },

  processLinkPayment: async (linkCode: string, data: { paymentMethod: string; customerEmail?: string; customerPhone?: string }): Promise<any> => {
    const response = await apiClient.post(`/api/v1/payment-links/${linkCode}/pay`, data);
    return response.data;
  },

  createLinkViaApi: async (apiKey: string, data: any): Promise<any> => {
    const response = await apiClient.post('/api/v1/payment-links', data, {
      headers: { 'X-Api-Key': apiKey }
    });
    return response.data;
  }
};
