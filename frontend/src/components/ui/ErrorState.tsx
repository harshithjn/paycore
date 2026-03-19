interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FEF2F2] dark:bg-[#7F1D1D] dark:bg-opacity-30 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#DC2626] dark:text-[#F87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-1">Failed to load data</h3>
      <p className="text-sm text-[#6B7280] mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Retry
        </button>
      )}
    </div>
  );
};
