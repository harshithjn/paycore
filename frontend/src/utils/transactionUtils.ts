import type { Transaction } from '../types';

// Legacy transaction interface for backward compatibility
export interface LegacyTransaction {
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

// Convert new Transaction to legacy format for existing components
export function toLegacyTransaction(transaction: Transaction): LegacyTransaction {
  return {
    id: transaction.id,
    amount: transaction.amount,
    status: transaction.status.toLowerCase() as any,
    paymentMethod: transaction.payment_method,
    merchantTransactionId: transaction.merchant_transaction_id || '',
    customerEmail: transaction.customer_email,
    customerPhone: transaction.customer_phone,
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at,
    callbackSent: true, // Default for compatibility
    upiTransactionId: transaction.upi_transaction_id,
    failureReason: transaction.failure_reason
  };
}

// Convert legacy transaction to new format
export function fromLegacyTransaction(legacyTransaction: LegacyTransaction): Transaction {
  return {
    id: legacyTransaction.id,
    merchant_id: 1, // Default merchant ID
    amount: legacyTransaction.amount,
    status: legacyTransaction.status.toUpperCase() as any,
    payment_method: legacyTransaction.paymentMethod,
    merchant_transaction_id: legacyTransaction.merchantTransactionId,
    customer_email: legacyTransaction.customerEmail,
    customer_phone: legacyTransaction.customerPhone,
    created_at: legacyTransaction.createdAt,
    updated_at: legacyTransaction.updatedAt,
    upi_transaction_id: legacyTransaction.upiTransactionId,
    failure_reason: legacyTransaction.failureReason
  };
}