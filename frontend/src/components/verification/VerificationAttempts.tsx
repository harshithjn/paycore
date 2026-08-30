import React from 'react';
import type { VerificationAttempt } from '../../types';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '../ui/Card';

interface VerificationAttemptsProps {
  verificationAttempts: VerificationAttempt[];
}

export const VerificationAttempts: React.FC<VerificationAttemptsProps> = ({
  verificationAttempts
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'PROCESSING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'FAILED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
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

  const formatVerificationData = (data: any) => {
    if (!data || Object.keys(data).length === 0) {
      return 'No verification data';
    }

    return JSON.stringify(data, null, 2);
  };

  if (verificationAttempts.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Verification Attempts</h3>
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No verification attempts yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Verification Attempts</h3>

      <div className="space-y-4">
        {verificationAttempts.map((attempt, index) => (
          <div key={attempt.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(attempt.status)}
                <div>
                  <span className="font-medium text-sm">
                    {attempt.verificationType} Verification
                  </span>
                  <span className={`
                    ml-2 px-2 py-1 text-xs rounded-full border
                    ${getStatusColor(attempt.status)}
                  `}>
                    {attempt.status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Attempt #{verificationAttempts.length - index}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">
                Verified at: {formatTimestamp(attempt.verifiedAt)}
              </p>
            </div>

            {attempt.verificationData && Object.keys(attempt.verificationData).length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Verification Data
                </label>
                <details className="group">
                  <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                    Show verification details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto border">
                    {formatVerificationData(attempt.verificationData)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
