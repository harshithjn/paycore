import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { transactionApi } from '../api/transactionApi';
import { settlementApi } from '../api/settlementApi';
import type { Transaction } from '../types';
import type { SettlementResponse } from '../api/settlementApi';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { Download } from 'lucide-react';
import { Toast } from '../components/ui/Toast';

export const Reports = () => {
  const { merchantId } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settlements, setSettlements] = useState<SettlementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!merchantId) return;
      
      setLoading(true);
      try {
        const [txns, settles] = await Promise.all([
          transactionApi.getAll(Number(merchantId)),
          settlementApi.getByMerchant(Number(merchantId)),
        ]);
        setTransactions(txns);
        setSettlements(settles);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [merchantId]);

  const downloadReport = async (format: 'CSV' | 'JSON') => {
    if (!merchantId) return;

    try {
      const blob = await settlementApi.downloadReport(Number(merchantId), format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${merchantId}_${Date.now()}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setToast({ message: 'Report downloaded', type: 'success' });
    } catch (err) {
      setToast({ message: 'Download failed', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const totalVolume = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSettled = settlements
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + s.netAmount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">Reports</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-6">
          <div className="text-sm text-[#6B7280] mb-2">Total Transaction Volume</div>
          <div className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">
            ₹{totalVolume.toFixed(2)}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm text-[#6B7280] mb-2">Total Settled</div>
          <div className="text-2xl font-medium text-[#059669]">
            ₹{totalSettled.toFixed(2)}
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm text-[#6B7280] mb-2">Settlements</div>
          <div className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">
            {settlements.length}
          </div>
        </div>
      </div>

      {/* Download Reports */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-4">Download Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => downloadReport('CSV')}
            className="flex items-center justify-center gap-3 p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors duration-150"
          >
            <Download size={20} className="text-[#6B7280]" />
            <div className="text-left">
              <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">CSV Report</div>
              <div className="text-xs text-[#6B7280]">Download as spreadsheet</div>
            </div>
          </button>

          <button
            onClick={() => downloadReport('JSON')}
            className="flex items-center justify-center gap-3 p-4 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors duration-150"
          >
            <Download size={20} className="text-[#6B7280]" />
            <div className="text-left">
              <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">JSON Report</div>
              <div className="text-xs text-[#6B7280]">Download as JSON</div>
            </div>
          </button>
        </div>
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
