import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ message, type, duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success'
    ? 'bg-[#ECFDF5] dark:bg-[#064E3B] border-[#059669]'
    : type === 'error'
    ? 'bg-[#FEF2F2] dark:bg-[#7F1D1D] border-[#DC2626]'
    : 'bg-white dark:bg-[#1A1A1A] border-[#E5E7EB] dark:border-[#2A2A2A]';

  const textColor = type === 'success'
    ? 'text-[#059669] dark:text-[#34D399]'
    : type === 'error'
    ? 'text-[#DC2626] dark:text-[#F87171]'
    : 'text-[#111] dark:text-[#EAEAEA]';

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border ${bgColor} ${textColor} shadow-lg transition-all duration-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{message}</span>
        <button onClick={() => { setIsVisible(false); setTimeout(onClose, 200); }} className="ml-2 hover:opacity-70">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
