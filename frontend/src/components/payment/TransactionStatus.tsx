import React from 'react';
import type { Transaction } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Card } from '../ui/Card';
import { Clock, CreditCard, Smartphone, Building, AlertCircle, CheckCircle } from 'lucide-react';

interface TransactionStatusProps {
  transaction: Transaction;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ transaction }) => {
  const getPaymentMethodIcon = (method: string) => {
    switch (method.toUpperCase()) {
      case 'UPI':
        return <Smartphone className="w-5 h-5" />;
      case 'CARD':
        return <CreditCard className="w-5 h-5" />;
      case 'NETBANKING':
        return <Building className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Transaction Details</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon(transaction.status)}
          <StatusBadge status={transaction.status.toLowerCase() as any} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Transaction ID
          </label>
          <p className="text-sm font-mono bg-gray-50 p-2 rounded border">
            {transaction.id}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Amount
          </label>
          <p className="text-lg font-semibold text-gray-900">
            {formatAmount(transaction.amount)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Payment Method
          </label>
          <div className="flex items-center space-x-2">
            {getPaymentMethodIcon(transaction.payment_method)}
            <span className="text-sm font-medium">{transaction.payment_method}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Created At
          </label>
          <p className="text-sm text-gray-700">
            {formatDate(transaction.created_at)}
          </p>
        </div>

        {transaction.merchant_transaction_id && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Merchant Transaction ID
            </label>
            <p className="text-sm font-mono bg-gray-50 p-2 rounded border">
              {transaction.merchant_transaction_id}
            </p>
          </div>
        )}

        {transaction.upi_transaction_id && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Payment Transaction ID
            </label>
            <p className="text-sm font-mono bg-gray-50 p-2 rounded border">
              {transaction.upi_transaction_id}
            </p>
          </div>
        )}

        {transaction.customer_email && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Customer Email
            </label>
            <p className="text-sm text-gray-700">{transaction.customer_email}</p>
          </div>
        )}

        {transaction.customer_phone && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Customer Phone
            </label>
            <p className="text-sm text-gray-700">{transaction.customer_phone}</p>
          </div>
        )}

        {transaction.failure_reason && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-red-600 mb-1">
              Failure Reason
            </label>
            <p className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
              {transaction.failure_reason}
            </p>
          </div>
        )}
      </div>

      {/* Transaction Lifecycle Visualization */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Transaction Lifecycle</h4>
        <div className="flex items-center space-x-2">
          {['CREATED', 'INITIATED', 'PROCESSING', 'SUCCESS'].map((status, index) => {
            const isActive = transaction.status === status;
            const isPassed = ['CREATED', 'INITIATED', 'PROCESSING'].indexOf(transaction.status) > index;
            const isFailed = transaction.status === 'FAILED' && index <= 2;
            
            return (
              <React.Fragment key={status}>
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
                    ${isActive ? 'bg-blue-500 text-white' : ''}
                    ${isPassed ? 'bg-green-500 text-white' : ''}
                    ${isFailed && index <= 2 ? 'bg-red-500 text-white' : ''}
                    ${!isActive && !isPassed && !isFailed ? 'bg-gray-200 text-gray-600' : ''}
                  `}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`
                      flex-1 h-1 rounded
                      ${isPassed || (isFailed && index < 2) ? 'bg-green-500' : ''}
                      ${isFailed && index === 2 ? 'bg-red-500' : ''}
                      ${!isPassed && !isFailed ? 'bg-gray-200' : ''}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Created</span>
          <span>Initiated</span>
          <span>Processing</span>
          <span>Complete</span>
        </div>
      </div>
    </Card>
  );
};