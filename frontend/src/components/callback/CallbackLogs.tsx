import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { StatusBadge, type Status } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { apiFetch } from '../../lib/api';

interface CallbackLog {
  id: string;
  transactionId: string;
  statusSent: string;
  callbackUrl: string;
  responseCode: number;
  responseBody: string;
  retryCount: number;
  timestamp: string;
}

interface CallbackLogsProps {
  transactionId?: string;
}

export const CallbackLogs: React.FC<CallbackLogsProps> = ({ transactionId }) => {
  const [logs, setLogs] = useState<CallbackLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    fetchCallbackLogs();
  }, [transactionId, filter]);

  const fetchCallbackLogs = async () => {
    setLoading(true);
    try {
      let url = '/api/callbacks';
      
      if (transactionId) {
        url += `/transaction/${transactionId}`;
      } else if (filter === 'failed') {
        url += '/failed';
      } else {
        url += '/all';
      }

      const response = await apiFetch(url);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching callback logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'success') return log.responseCode >= 200 && log.responseCode < 300;
    if (filter === 'failed') return log.responseCode < 200 || log.responseCode >= 300;
    return true;
  });

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Callback Logs</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'success' | 'failed')}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">All Callbacks</option>
            <option value="success">Successful</option>
            <option value="failed">Failed</option>
          </select>
          <Button
            onClick={fetchCallbackLogs}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading callback logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No callback logs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <StatusBadge
                    status={log.statusSent as Status}
                  />
                  <span className="text-sm text-gray-600">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  {log.retryCount > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Retry #{log.retryCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono px-2 py-1 rounded ${
                    log.responseCode >= 200 && log.responseCode < 300
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {log.responseCode || 'No Response'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Transaction ID:</span>
                  <div className="font-mono text-gray-600 break-all">
                    {log.transactionId}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Callback URL:</span>
                  <div className="text-gray-600 break-all">
                    {log.callbackUrl === 'INTERNAL_LOG' ? (
                      <span className="italic text-gray-500">Internal Log Entry</span>
                    ) : log.callbackUrl === 'CUSTOM_EVENT' ? (
                      <span className="italic text-gray-500">Custom Event</span>
                    ) : (
                      log.callbackUrl
                    )}
                  </div>
                </div>
              </div>

              {log.responseBody && log.callbackUrl !== 'INTERNAL_LOG' && (
                <div className="mt-3">
                  <span className="font-medium text-gray-700">Response:</span>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                    {log.responseBody.length > 200 
                      ? `${log.responseBody.substring(0, 200)}...`
                      : log.responseBody
                    }
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};