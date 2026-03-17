import type { Transaction, Payment, Refund, Settlement, KPIData, ChartData, ApiKey } from '../types';

export const mockTransactions: Transaction[] = [
  {
    id: 'txn_1234567890',
    merchant_id: 1,
    amount: 2500.00,
    status: 'SUCCESS',
    payment_method: 'UPI',
    merchant_transaction_id: 'MERCH_TXN_001',
    customer_email: 'customer@example.com',
    customer_phone: '+91-9876543210',
    created_at: '2024-03-15T10:30:00Z',
    updated_at: '2024-03-15T10:31:00Z',
    upi_transaction_id: 'UPI123456789'
  },
  {
    id: 'txn_1234567891',
    merchant_id: 1,
    amount: 1200.00,
    status: 'FAILED',
    payment_method: 'UPI',
    merchant_transaction_id: 'MERCH_TXN_002',
    customer_email: 'user@example.com',
    customer_phone: '+91-9876543211',
    created_at: '2024-03-15T09:15:00Z',
    updated_at: '2024-03-15T09:16:00Z',
    failure_reason: 'Insufficient balance'
  },
  {
    id: 'txn_1234567892',
    merchant_id: 1,
    amount: 5000.00,
    status: 'PROCESSING',
    payment_method: 'UPI',
    merchant_transaction_id: 'MERCH_TXN_003',
    customer_email: 'buyer@example.com',
    customer_phone: '+91-9876543212',
    created_at: '2024-03-15T11:45:00Z',
    updated_at: '2024-03-15T11:45:00Z'
  },
  {
    id: 'txn_1234567893',
    merchant_id: 1,
    amount: 750.00,
    status: 'SUCCESS',
    payment_method: 'UPI',
    merchant_transaction_id: 'MERCH_TXN_004',
    customer_email: 'client@example.com',
    customer_phone: '+91-9876543213',
    created_at: '2024-03-14T16:20:00Z',
    updated_at: '2024-03-14T16:21:00Z',
    upi_transaction_id: 'UPI123456790'
  },
  {
    id: 'txn_1234567894',
    merchant_id: 1,
    amount: 3200.00,
    status: 'CREATED',
    payment_method: 'UPI',
    merchant_transaction_id: 'MERCH_TXN_005',
    customer_email: 'shopper@example.com',
    customer_phone: '+91-9876543214',
    created_at: '2024-03-15T12:00:00Z',
    updated_at: '2024-03-15T12:00:00Z'
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'pay_1234567890',
    merchantTransactionId: 'MERCH_PAY_001',
    amount: 1500.00,
    status: 'success',
    paymentMethod: 'UPI',
    customerDetails: {
      email: 'customer@example.com',
      phone: '+91-9876543210',
      name: 'John Doe'
    },
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:02:00Z',
    paymentUrl: 'https://gateway.example.com/pay/pay_1234567890'
  },
  {
    id: 'pay_1234567891',
    merchantTransactionId: 'MERCH_PAY_002',
    amount: 2200.00,
    status: 'created',
    paymentMethod: 'UPI',
    customerDetails: {
      email: 'user@example.com',
      phone: '+91-9876543211',
      name: 'Jane Smith'
    },
    createdAt: '2024-03-15T11:30:00Z',
    updatedAt: '2024-03-15T11:30:00Z',
    expiresAt: '2024-03-15T12:30:00Z',
    paymentUrl: 'https://gateway.example.com/pay/pay_1234567891'
  }
];

export const mockRefunds: Refund[] = [
  {
    id: 'ref_1234567890',
    transactionId: 'txn_1234567890',
    amount: 2500.00,
    status: 'success',
    reason: 'Customer requested refund',
    createdAt: '2024-03-15T14:00:00Z',
    processedAt: '2024-03-15T14:05:00Z',
    refundTransactionId: 'REF_TXN_001'
  },
  {
    id: 'ref_1234567891',
    transactionId: 'txn_1234567893',
    amount: 375.00,
    status: 'processing',
    reason: 'Partial refund - damaged goods',
    createdAt: '2024-03-15T13:30:00Z'
  }
];

export const mockSettlements: Settlement[] = [
  {
    id: 'set_1234567890',
    amount: 45000.00,
    status: 'settled',
    settlementDate: '2024-03-14T18:00:00Z',
    transactionCount: 25,
    fees: 900.00,
    netAmount: 44100.00,
    utr: 'UTR123456789'
  },
  {
    id: 'set_1234567891',
    amount: 32000.00,
    status: 'processing',
    settlementDate: '2024-03-15T18:00:00Z',
    transactionCount: 18,
    fees: 640.00,
    netAmount: 31360.00
  }
];

export const mockKPIData: KPIData = {
  totalVolume: 125000.00,
  successfulPayments: 89,
  failedPayments: 11,
  refundAmount: 5500.00,
  totalTransactions: 100,
  successRate: 89.0
};

export const mockChartData: ChartData[] = [
  { date: '2024-03-08', volume: 15000, successful: 12, failed: 3 },
  { date: '2024-03-09', volume: 18000, successful: 15, failed: 2 },
  { date: '2024-03-10', volume: 22000, successful: 18, failed: 4 },
  { date: '2024-03-11', volume: 19000, successful: 16, failed: 1 },
  { date: '2024-03-12', volume: 25000, successful: 20, failed: 2 },
  { date: '2024-03-13', volume: 21000, successful: 17, failed: 3 },
  { date: '2024-03-14', volume: 28000, successful: 22, failed: 1 },
  { date: '2024-03-15', volume: 32000, successful: 25, failed: 2 }
];

export const mockApiKeys: ApiKey[] = [
  {
    id: 'key_1234567890',
    name: 'Production Key',
    key: 'pk_live_1234567890abcdef',
    type: 'publishable',
    createdAt: '2024-01-15T10:00:00Z',
    lastUsed: '2024-03-15T11:30:00Z',
    isActive: true
  },
  {
    id: 'key_1234567891',
    name: 'Production Secret',
    key: 'sk_live_1234567890abcdef',
    type: 'secret',
    createdAt: '2024-01-15T10:00:00Z',
    lastUsed: '2024-03-15T10:45:00Z',
    isActive: true
  },
  {
    id: 'key_1234567892',
    name: 'Test Key',
    key: 'pk_test_1234567890abcdef',
    type: 'publishable',
    createdAt: '2024-02-01T10:00:00Z',
    lastUsed: '2024-03-10T14:20:00Z',
    isActive: true
  }
];