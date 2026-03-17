import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { mockSettlements } from '../data/mockData';
import type { Settlement } from '../types';
import { Download, Search, Calendar, Eye, FileText } from 'lucide-react';

export const Settlements: React.FC = () => {
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });

  const filteredSettlements = mockSettlements.filter(settlement => {
    const matchesStatus = statusFilter === 'all' || settlement.status === statusFilter;
    const matchesSearch = settlement.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (settlement.utr?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  });

  const totalSettled = mockSettlements
    .filter(s => s.status === 'settled')
    .reduce((sum, s) => sum + s.netAmount, 0);

  const totalPending = mockSettlements
    .filter(s => s.status === 'processing' || s.status === 'pending')
    .reduce((sum, s) => sum + s.netAmount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settlements</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your settlement reports and payouts</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Settled</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalSettled)}
          </div>
          <div className="text-sm text-green-600">This month</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Settlement</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalPending)}
          </div>
          <div className="text-sm text-orange-600">Processing</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Settlement Cycle</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">T+1</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Business days</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fees</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₹1,540</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">This month</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by settlement ID or UTR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="settled">Settled</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="sm:w-48">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>
        </div>
      </Card>

      {/* Settlements Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Settlement Reports ({filteredSettlements.length})
          </h3>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Settlement ID</TableHead>
              <TableHead>Gross Amount</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead>Net Amount</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Settlement Date</TableHead>
              <TableHead>UTR</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSettlements.map((settlement) => (
              <TableRow key={settlement.id}>
                <TableCell className="font-mono text-sm">
                  {settlement.id}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(settlement.amount)}
                </TableCell>
                <TableCell className="text-red-600 dark:text-red-400">
                  -{formatCurrency(settlement.fees)}
                </TableCell>
                <TableCell className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(settlement.netAmount)}
                </TableCell>
                <TableCell>{settlement.transactionCount}</TableCell>
                <TableCell>
                  <StatusBadge status={settlement.status as any} />
                </TableCell>
                <TableCell>{formatDate(settlement.settlementDate)}</TableCell>
                <TableCell>
                  {settlement.utr ? (
                    <span className="font-mono text-sm">{settlement.utr}</span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSettlement(settlement)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Download Report"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Settlement Details Modal */}
      <Modal
        isOpen={!!selectedSettlement}
        onClose={() => setSelectedSettlement(null)}
        title="Settlement Details"
        size="lg"
      >
        {selectedSettlement && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Settlement ID
                </label>
                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {selectedSettlement.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <StatusBadge status={selectedSettlement.status as any} />
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Amount Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gross Amount:</span>
                  <span className="font-semibold">{formatCurrency(selectedSettlement.amount)}</span>
                </div>
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>Platform Fees:</span>
                  <span>-{formatCurrency(selectedSettlement.fees)}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between text-lg font-semibold text-green-600 dark:text-green-400">
                  <span>Net Amount:</span>
                  <span>{formatCurrency(selectedSettlement.netAmount)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction Count
                </label>
                <p className="text-lg font-semibold">{selectedSettlement.transactionCount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Settlement Date
                </label>
                <p>{formatDate(selectedSettlement.settlementDate)}</p>
              </div>
            </div>

            {selectedSettlement.utr && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  UTR (Unique Transaction Reference)
                </label>
                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {selectedSettlement.utr}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Transactions
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};