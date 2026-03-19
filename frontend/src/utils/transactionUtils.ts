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
    paymentMethod: transaction.paymentMethod,
    merchantTransactionId: transaction.merchantTransactionId || '',
    customerEmail: transaction.customerEmail,
    customerPhone: transaction.customerPhone,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    callbackSent: true, // Default for compatibility
    upiTransactionId: transaction.upiTransactionId,
    failureReason: transaction.failureReason
  };
}

// Convert legacy transaction to new format
export function fromLegacyTransaction(legacyTransaction: LegacyTransaction): Transaction {
  return {
    id: legacyTransaction.id,
    merchantId: 1, // Default merchant ID
    amount: legacyTransaction.amount,
    status: legacyTransaction.status?.toUpperCase() as any,
    paymentMethod: legacyTransaction.paymentMethod,
    merchantTransactionId: legacyTransaction.merchantTransactionId,
    customerEmail: legacyTransaction.customerEmail,
    customerPhone: legacyTransaction.customerPhone,
    createdAt: legacyTransaction.createdAt,
    updatedAt: legacyTransaction.updatedAt,
    upiTransactionId: legacyTransaction.upiTransactionId,
    failureReason: legacyTransaction.failureReason
  };
}