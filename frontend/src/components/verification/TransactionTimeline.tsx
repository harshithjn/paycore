import React from 'react';
import type { StateTransition } from '../../types';
import { CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';

interface TransactionTimelineProps {
  stateTransitions: StateTransition[];
  currentStatus: string;
}

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({
  stateTransitions,
  currentStatus
}) => {
  const getStatusIcon = (isActive: boolean, isFailed: boolean) => {
    if (isFailed) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (isActive) {
      return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusColor = (isActive: boolean, isFailed: boolean) => {
    if (isFailed) return 'border-red-500 bg-red-50';
    if (isActive) return 'border-blue-500 bg-blue-50';
    return 'border-green-500 bg-green-50';
  };

  const formatTimestamp = (timestamp: string) => {
    return timestamp ? new Date(timestamp).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) : 'N/A';
  };

  const timelineItems = stateTransitions.map((transition, index) => {
    const isActive = transition.toStatus === currentStatus;
    const isFailed = transition.toStatus === 'FAILED';
    const isLast = index === stateTransitions.length - 1;

    return (
      <div key={transition.id} className="flex items-start space-x-4">
        <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2
                  ${getStatusColor(isActive, isFailed)} bg-white z-10
                  transition-colors duration-300`}
                >
                  {getStatusIcon(isActive, isFailed)}
          </div>
          {!isLast && (
            <div className="w-0.5 h-12 bg-gray-200 mt-2" />
          )}
        </div>

        <div className="flex-1 pb-8">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900">
              {transition.toStatus}
            </h4>
            {transition.fromStatus && (
              <>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  from {transition.fromStatus}
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-gray-600 mb-2">
            {formatTimestamp(transition.transitionedAt)}
          </p>

          {transition.transitionReason && (
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              {transition.transitionReason}
            </p>
          )}
        </div>
      </div>
    );
  });

  if (stateTransitions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>No state transitions recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <h3 className="text-lg font-semibold mb-4">Transaction Timeline</h3>
      <div className="relative">
        {timelineItems}
      </div>
    </div>
  );
};
