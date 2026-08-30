import React from 'react';
import type { Transaction } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Card } from '../ui/Card';
import { CreditCard, Smartphone, Building } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionClick
}) => {
  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'UPI':
        return <Smartphone className="w-4 h-4" />;
      case 'CARD':
        return <CreditCard className="w-4 h-4" />;
      case 'NETBANKING':
        return <Building className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return dateString ? new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';
  };

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No transactions found</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`
              p-4 hover:bg-gray-50 transition-colors
              ${onTransactionClick ? 'cursor-pointer' : ''}
            `}
            onClick={() => onTransactionClick?.(transaction)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getPaymentMethodIcon(transaction.paymentMethod)}
                  <span className="text-sm font-medium text-gray-900">
                    {transaction.paymentMethod}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(transaction.createdAt)}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatAmount(transaction.amount)}
                  </div>
                  {transaction.merchantTransactionId && (
                    <div className="text-xs text-gray-500 font-mono">
                      {transaction.merchantTransactionId}
                    </div>
                  )}
                </div>
                <StatusBadge status={transaction.status.toLowerCase() as any} />
              </div>
            </div>

            {transaction.failureReason && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                {transaction.failureReason}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
