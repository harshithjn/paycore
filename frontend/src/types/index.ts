export interface Transaction {
  id: string;
  amount: number;
  status: 'success' | 'failed' | 'pending' | 'processing' | 'created';
  paymentMethod: string;
  merchantTransactionId: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
  callbackSent: boolean;
  upiTransactionId?: string;
  failureReason?: string;
}

export interface Payment {
  id: string;
  merchantTransactionId: string;
  amount: number;
  status: 'created' | 'initiated' | 'processing' | 'success' | 'failed';
  paymentMethod: string;
  customerDetails: {
    email?: string;
    phone?: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paymentUrl?: string;
}

export interface Refund {
  id: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  reason: string;
  createdAt: string;
  processedAt?: string;
  refundTransactionId?: string;
}

export interface Settlement {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'settled' | 'failed';
  settlementDate: string;
  transactionCount: number;
  fees: number;
  netAmount: number;
  utr?: string;
}

export interface KPIData {
  totalVolume: number;
  successfulPayments: number;
  failedPayments: number;
  refundAmount: number;
  totalTransactions: number;
  successRate: number;
}

export interface ChartData {
  date: string;
  volume: number;
  successful: number;
  failed: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: 'publishable' | 'secret';
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}