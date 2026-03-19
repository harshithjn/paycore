import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { settlementApi, type SettlementRequest, type SettlementResponse } from '../api/settlementApi';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Toast } from '../components/ui/Toast';
import { Download } from 'lucide-react';

export const Settlements = () => {
  const { merchantId } = useParams();
  const [settlements, setSettlements] = useState<SettlementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchSettlements = async () => {
    if (!merchantId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await settlementApi.getByMerchant(Number(merchantId));
      setSettlements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  const triggerSettlement = async (type: 'DAILY' | 'WEEKLY') => {
    if (!merchantId) return;

    setProcessing(true);

    try {
      const request: SettlementRequest = {
        merchantId: Number(merchantId),
        type,
      };

      const response = await settlementApi.processSettlement(request);
      
      if (response.status === 'COMPLETED') {
        setToast({ message: `${type} settlement processed successfully`, type: 'success' });
        fetchSettlements();
      } else {
        setToast({ message: response.message || 'Settlement failed', type: 'error' });
      }
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to process settlement', 
        type: 'error' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadReport = async (format: 'CSV' | 'JSON') => {
    if (!merchantId) return;

    try {
      const blob = await settlementApi.downloadReport(Number(merchantId), format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settlement_report_${merchantId}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setToast({ message: 'Report downloaded successfully', type: 'success' });
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to download report', 
        type: 'error' 
      });
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [merchantId]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Settlements</h1>
        <div className="card p-6">
          <LoadingSkeleton rows={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Settlements</h1>
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchSettlements} />
        </div>
      </div>
    );
  }

  const totalSettled = settlements
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + s.netAmount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">Settlements</h1>
        
        <div className="flex gap-3">
          <button
            onClick={() => downloadReport('CSV')}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <Download size={16} />
            CSV
          </button>
          <button
            onClick={() => downloadReport('JSON')}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <Download size={16} />
            JSON
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-6">
          <div className="text-sm text-[#6B7280] mb-2">Total Settled</div>
          <div className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">
            ₹{totalSettled.toFixed(2)}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm text-[#6B7280] mb-2">Settlement Count</div>
          <div className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">
            {settlements.length}
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-[#6B7280] mb-2">Trigger Settlement</div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => triggerSettlement('DAILY')}
                disabled={processing}
                className="btn-primary text-xs px-3 py-1.5"
              >
                Daily
              </button>
              <button
                onClick={() => triggerSettlement('WEEKLY')}
                disabled={processing}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Weekly
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="card">
        {settlements.length === 0 ? (
          <div className="p-6">
            <EmptyState 
              title="No settlements yet" 
              description="Settlements will appear here once processed"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Settlement ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Reference</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Transactions</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Date</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement) => (
                  <tr key={settlement.settlementId} className="table-row">
                    <td className="py-3 px-4 text-sm text-[#111] dark:text-[#EAEAEA] font-mono">
                      {settlement.settlementId.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {settlement.referenceNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {settlement.type}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-[#111] dark:text-[#EAEAEA]">
                      ₹{settlement.netAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {settlement.transactionCount}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={settlement.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {settlement.createdAt ? new Date(settlement.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
