import { useState } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { Toast } from '../components/ui/Toast';

export const ApiKeys = () => {
  const [showSecret, setShowSecret] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const publishableKey = 'pk_test_51234567890abcdef';
  const secretKey = 'sk_test_51234567890abcdef_secret';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copied to clipboard', type: 'success' });
  };

  return (
    <div>
      <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">API Keys</h1>

      <div className="max-w-3xl space-y-4">
        {/* Publishable Key */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-[#111] dark:text-[#EAEAEA] mb-1">Publishable Key</h3>
              <p className="text-xs text-[#6B7280]">Use this in your client-side code</p>
            </div>
            <span className="px-2 py-1 bg-[#ECFDF5] dark:bg-[#064E3B] dark:bg-opacity-30 text-[#059669] dark:text-[#34D399] text-xs rounded-md">
              Active
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-[#F9FAFB] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg text-sm text-[#111] dark:text-[#EAEAEA] font-mono">
              {publishableKey}
            </code>
            <button
              onClick={() => copyToClipboard(publishableKey)}
              className="p-2 hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors"
            >
              <Copy size={18} className="text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Secret Key */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-[#111] dark:text-[#EAEAEA] mb-1">Secret Key</h3>
              <p className="text-xs text-[#6B7280]">Keep this secure, never expose in client code</p>
            </div>
            <span className="px-2 py-1 bg-[#ECFDF5] dark:bg-[#064E3B] dark:bg-opacity-30 text-[#059669] dark:text-[#34D399] text-xs rounded-md">
              Active
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-[#F9FAFB] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg text-sm text-[#111] dark:text-[#EAEAEA] font-mono">
              {showSecret ? secretKey : '••••••••••••••••••••••••••••'}
            </code>
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="p-2 hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors"
            >
              {showSecret ? <EyeOff size={18} className="text-[#6B7280]" /> : <Eye size={18} className="text-[#6B7280]" />}
            </button>
            <button
              onClick={() => copyToClipboard(secretKey)}
              className="p-2 hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors"
            >
              <Copy size={18} className="text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 bg-[#FEF3C7] dark:bg-[#78350F] dark:bg-opacity-30 border border-[#D97706] dark:border-[#D97706] rounded-lg">
          <p className="text-sm text-[#D97706] dark:text-[#FCD34D]">
            Never share your secret key. Anyone with this key can perform actions on your behalf.
          </p>
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
