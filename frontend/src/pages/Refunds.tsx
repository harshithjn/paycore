import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { mockRefunds, mockTransactions } from '../data/mockData';
import type { Refund } from '../types';
import { Plus, Search, Calendar, Eye } from 'lucide-react';

export const Refunds: React.FC = () => {
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const filteredRefunds = mockRefunds.filter(refund => {
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    const matchesSearch = refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Refunds</h1>
          <p className="text-gray-600 dark:text-gray-400">Process and track payment refunds</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Refund
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Refunds</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₹8,750</div>
          <div className="text-sm text-green-600">+2.5% from last month</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">2</div>
          <div className="text-sm text-orange-600">Processing</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">15</div>
          <div className="text-sm text-green-600">This month</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">98.2%</div>
          <div className="text-sm text-green-600">Excellent</div>
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
                placeholder="Search by refund ID or transaction ID..."
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
              <option value="success">Success</option>
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

      {/* Refunds Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Refund Requests ({filteredRefunds.length})
          </h3>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Refund ID</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Processed</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRefunds.map((refund) => (
              <TableRow key={refund.id}>
                <TableCell className="font-mono text-sm">
                  {refund.id}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {refund.transactionId}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(refund.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={refund.status as any} />
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {refund.reason}
                </TableCell>
                <TableCell>{formatDate(refund.createdAt)}</TableCell>
                <TableCell>
                  {refund.processedAt ? (
                    formatDate(refund.processedAt)
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRefund(refund)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Refund Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Refund Request"
        size="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction ID
            </label>
            <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">Select a transaction</option>
              {mockTransactions
                .filter(t => t.status === 'success')
                .map(transaction => (
                  <option key={transaction.id} value={transaction.id}>
                    {transaction.id} - {formatCurrency(transaction.amount)}
                  </option>
                ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Refund Amount (INR)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Refund Type
              </label>
              <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="full">Full Refund</option>
                <option value="partial">Partial Refund</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Refund Reason
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Explain the reason for refund..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Refund
            </Button>
          </div>
        </form>
      </Modal>

      {/* Refund Details Modal */}
      <Modal
        isOpen={!!selectedRefund}
        onClose={() => setSelectedRefund(null)}
        title="Refund Details"
        size="lg"
      >
        {selectedRefund && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Refund ID
                </label>
                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {selectedRefund.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <StatusBadge status={selectedRefund.status as any} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction ID
                </label>
                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {selectedRefund.transactionId}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <p className="text-lg font-semibold">{formatCurrency(selectedRefund.amount)}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Refund Reason
              </label>
              <p className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{selectedRefund.reason}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Created At
                </label>
                <p>{formatDate(selectedRefund.createdAt)}</p>
              </div>
              {selectedRefund.processedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Processed At
                  </label>
                  <p>{formatDate(selectedRefund.processedAt)}</p>
                </div>
              )}
            </div>
            
            {selectedRefund.refundTransactionId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Refund Transaction ID
                </label>
                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {selectedRefund.refundTransactionId}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};