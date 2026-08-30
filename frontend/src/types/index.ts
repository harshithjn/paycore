export interface Transaction {
  id: string;
  merchantId: number;
  amount: number;
  status: 'CREATED' | 'INITIATED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'SETTLED';
  paymentMethod: string;
  merchantTransactionId?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
  upiTransactionId?: string;
  failureReason?: string;
  callbackUrl?: string;
  callbackSent?: boolean;
  verificationAttempts?: number;
  lastVerifiedAt?: string;
  totalRefunded?: number;
}

export interface CallbackLog {
  id: string;
  transactionId: string;
  statusSent: string;
  callbackUrl?: string;
  responseCode?: number;
  responseBody?: string;
  timestamp: string;
  retryCount: number;
}

export interface StateTransition {
  id: string;
  transactionId: string;
  fromStatus?: string;
  toStatus: string;
  transitionReason?: string;
  transitionedAt: string;
}

export interface VerificationAttempt {
  id: string;
  transactionId: string;
  verificationType: string;
  status: string;
  verificationData: any;
  verifiedAt: string;
}

export interface TransactionStatusData {
  transaction: Transaction;
  callbackLogs: CallbackLog[];
  stateTransitions: StateTransition[];
  verificationAttempts: VerificationAttempt[];
  stateMetadata: {
    currentState: string;
    description: string;
    isTerminal: boolean;
    allowsVerification: boolean;
    validNextStates: string[];
  };
}

export interface PaymentInitiateRequest {
  merchantId: number;
  amount: number;
  paymentMethod: string;
  merchantTransactionId?: string;
  customerEmail?: string;
  customerPhone?: string;
  callbackUrl?: string;
}

export interface PaymentInitiateResponse {
  transactionId: string;
  merchantId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  message: string;
  createdAt: string;
  merchantTransactionId?: string;
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

export interface PaymentLink {
  id: string;
  merchantId: number;
  linkCode: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  isReusable: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  paymentCount: number;
  totalCollected: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiLog {
  id: number;
  merchantId: number;
  apiKey: string;
  method: string;
  endpoint: string;
  statusCode: number;
  requestBody?: string;
  responseSummary?: string;
  ipAddress?: string;
  createdAt: string;
}
