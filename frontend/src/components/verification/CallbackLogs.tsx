import React from 'react';
import type { CallbackLog } from '../../types';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';

interface CallbackLogsProps {
  callbackLogs: CallbackLog[];
}

export const CallbackLogs: React.FC<CallbackLogsProps> = ({ callbackLogs }) => {
  const getStatusIcon = (responseCode?: number) => {
    if (!responseCode) {
      return <Clock className="w-4 h-4 text-gray-500" />;
    }
    if (responseCode >= 200 && responseCode < 300) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (responseCode?: number) => {
    if (!responseCode) return 'text-gray-600';
    if (responseCode >= 200 && responseCode < 300) return 'text-green-600';
    return 'text-red-600';
  };

  const formatTimestamp = (timestamp: string) => {
    return timestamp ? new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) : 'N/A';
  };

  const formatResponseBody = (responseBody?: string) => {
    if (!responseBody) return 'No response';

    try {
      const parsed = JSON.parse(responseBody);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return responseBody;
    }
  };

  if (callbackLogs.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Callback Logs</h3>
        <div className="text-center py-8 text-gray-500">
          <ExternalLink className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No callbacks sent yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Callback Logs</h3>

      <div className="space-y-4">
        {callbackLogs.map((log) => (
          <div key={log.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(log.responseCode)}
                <span className="font-medium text-sm">
                  Status: {log.statusSent}
                </span>
                {log.responseCode && (
                  <span className={`text-sm font-mono ${getStatusColor(log.responseCode)}`}>
                    HTTP {log.responseCode}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500">
                {formatTimestamp(log.timestamp)}
              </div>
            </div>

            {log.callbackUrl && (
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Callback URL
                </label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">
                  {log.callbackUrl}
                </p>
              </div>
            )}

            {log.responseBody && (
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Response
                </label>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {formatResponseBody(log.responseBody)}
                </pre>
              </div>
            )}

            {log.retryCount > 0 && (
              <div className="flex items-center space-x-1 text-xs text-orange-600">
                <Clock className="w-3 h-3" />
                <span>Retried {log.retryCount} times</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
