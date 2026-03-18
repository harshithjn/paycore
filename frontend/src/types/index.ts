export interface Transaction {
  id: string;
  merchant_id: number;
  amount: number;
  status: 'CREATED' | 'INITIATED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'SETTLED';
  payment_method: string;
  merchant_transaction_id?: string;
  customer_email?: string;
  customer_phone?: string;
  created_at: string;
  updated_at: string;
  upi_transaction_id?: string;
  failure_reason?: string;
  callback_url?: string;
  callback_sent?: boolean;
  verification_attempts?: number;
  last_verified_at?: string;
}

export interface CallbackLog {
  id: string;
  transaction_id: string;
  status_sent: string;
  callback_url?: string;
  response_code?: number;
  response_body?: string;
  timestamp: string;
  retry_count: number;
}

export interface StateTransition {
  id: string;
  transaction_id: string;
  from_status?: string;
  to_status: string;
  transition_reason?: string;
  transitioned_at: string;
}

export interface VerificationAttempt {
  id: string;
  transaction_id: string;
  verification_type: string;
  status: string;
  verification_data: any;
  verified_at: string;
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