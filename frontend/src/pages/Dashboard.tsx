import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { transactionApi } from '../api/transactionApi';

import type { Transaction } from '../types';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

export const Dashboard = () => {
  const { merchantId } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!merchantId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const txns = await transactionApi.getAll(Number(merchantId));
      setTransactions(txns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [merchantId]);

  const calculateKPIs = () => {
    const total = transactions.length;
    const successful = transactions.filter(t => t.status === 'SUCCESS').length;
    const failed = transactions.filter(t => t.status === 'FAILED').length;
    const totalVolume = transactions
      .filter(t => t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0);
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return { total, successful, failed, totalVolume, successRate };
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Dashboard</h1>
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  const kpis = calculateKPIs();

  return (
    <div>
      <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">Total Volume</span>
            <DollarSign size={18} className="text-[#6B7280]" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">
            ₹{kpis.totalVolume.toFixed(2)}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">Transactions</span>
            <Activity size={18} className="text-[#6B7280]" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">
            {kpis.total}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">Successful</span>
            <TrendingUp size={18} className="text-[#059669]" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-medium text-[#059669]">
            {kpis.successful}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">Success Rate</span>
            <TrendingDown size={18} className="text-[#6B7280]" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">
            {kpis.successRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-4">Recent Transactions</h2>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280]">
            No transactions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Method</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((txn) => (
                  <tr key={txn.id} className="table-row">
                    <td className="py-3 px-4 text-sm text-[#111] dark:text-[#EAEAEA] font-mono">
                      {txn.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-sm text-[#111] dark:text-[#EAEAEA]">
                      ₹{txn.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {txn.paymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`status-badge status-${txn.status.toLowerCase()}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
