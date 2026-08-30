import { useState } from 'react';
import { Copy, Eye, EyeOff, RefreshCw, Book, Terminal, Shield } from 'lucide-react';
import { Toast } from '../components/ui/Toast';
import { useMerchant } from '../context/MerchantContext';
import { developerApi } from '../api/developerApi';
import { Button } from '../components/ui/Button';

export const ApiKeys = () => {
  const { merchant, updateMerchant } = useMerchant();
  const [showSecret, setShowSecret] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const publishableKey = `pk_live_${merchant?.id}test${merchant?.id}`;
  const secretKey = merchant?.apiKey || 'Not generated yet';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copied to clipboard', type: 'info' });
  };

  const handleRegenerate = async () => {
    if (!merchant || !window.confirm('Are you sure? Your old key will stop working immediately.')) return;

    setIsRegenerating(true);
    try {
      const response = await developerApi.regenerateApiKey(merchant.id);
      updateMerchant({ apiKey: response.apiKey });
      setToast({ message: 'API key regenerated successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to regenerate API key', type: 'error' });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">API Keys</h1>
        <p className="text-[#6B7280] text-sm mt-1">Use these keys to authenticate your API requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#111] dark:text-[#EAEAEA] mb-1 uppercase tracking-wider">Publishable Key</h3>
                <p className="text-xs text-[#6B7280]">Use this in your client-side code</p>
              </div>
              <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold rounded uppercase tracking-wider">
                Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 bg-[#F9FAFB] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl text-xs text-[#111] dark:text-[#EAEAEA] font-mono overflow-x-auto">
                {publishableKey}
              </code>
              <button
                onClick={() => copyToClipboard(publishableKey)}
                className="p-3 hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] rounded-xl transition-colors border border-transparent hover:border-[#E5E7EB] dark:hover:border-[#2A2A2A]"
              >
                <Copy size={18} className="text-[#6B7280]" />
              </button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#111] dark:text-[#EAEAEA] mb-1 uppercase tracking-wider">Secret Key</h3>
                <p className="text-xs text-[#6B7280]">Keep this secure, never expose in client code</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                <RefreshCw size={14} className={isRegenerating ? 'animate-spin mr-2' : 'mr-2'} />
                Regenerate
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 bg-[#F9FAFB] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl text-xs text-[#111] dark:text-[#EAEAEA] font-mono overflow-x-auto">
                {showSecret ? secretKey : '••••••••••••••••••••••••••••••••••••••••'}
              </code>
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-3 hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] rounded-xl transition-colors"
              >
                {showSecret ? <EyeOff size={18} className="text-[#6B7280]" /> : <Eye size={18} className="text-[#6B7280]" />}
              </button>
              <button
                onClick={() => copyToClipboard(secretKey)}
                className="p-3 hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] rounded-xl transition-colors"
              >
                <Copy size={18} className="text-[#6B7280]" />
              </button>
            </div>
          </div>

          <div className="mt-12">
             <div className="flex items-center gap-2 mb-6">
                <Book className="text-[#4F46E5]" size={20} />
                <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA]">Quick Integration</h2>
             </div>

             <div className="space-y-4">
                <div className="p-6 bg-[#0B0B0C] rounded-2xl border border-[#2A2A2A]">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Create Payment Link</span>
                      <span className="text-[10px] text-[#6B7280] font-mono">POST /api/v1/payment-links</span>
                   </div>
                  <pre className="text-xs text-[#34D399] font-mono overflow-x-auto p-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
{`curl -X POST https://api.paycore.harshithj.me/api/v1/payment-links \\
  -H "X-Api-Key: YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Donation for Hospital",
    "amount": 1000.00,
    "isReusable": true
  }'`}
                   </pre>
                </div>

                <div className="p-6 bg-[#0B0B0C] rounded-2xl border border-[#2A2A2A]">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">List Links</span>
                      <span className="text-[10px] text-[#6B7280] font-mono">GET /api/v1/payment-links</span>
                   </div>
                   <pre className="text-xs text-[#34D399] font-mono overflow-x-auto p-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
{`curl -H "X-Api-Key: YOUR_SECRET_KEY" \\
  https://api.paycore.harshithj.me/api/v1/payment-links`}
                   </pre>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-3xl shadow-sm">
             <Terminal className="mb-4 text-indigo-600 dark:text-indigo-400" size={32} />
             <h3 className="text-lg font-semibold mb-2 text-[#111] dark:text-[#EAEAEA]">Developer Sandbox</h3>
             <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
               Use the Developer Sandbox to test your API integration without writing any code. Create links, simulate customer flows, and monitor logs.
             </p>
             <Button
               variant="outline"
               className="w-full border-[#E5E7EB] dark:border-[#2A2A2A] text-[#111] dark:text-[#EAEAEA] hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A]"
               onClick={() => window.location.href = window.location.href.split('api-keys')[0] + 'developer'}
             >
               Go to Portal
             </Button>
          </div>

          <div className="p-6 bg-[#FEF3C7] dark:bg-[#78350F] dark:bg-opacity-30 border border-[#D97706] dark:border-[#D97706] rounded-2xl">
            <h4 className="flex items-center gap-2 text-sm font-bold text-[#D97706] dark:text-[#FCD34D] mb-2 uppercase tracking-wider">
               <Shield size={16} />
               Security Warning
            </h4>
            <p className="text-xs text-[#B45309] dark:text-[#FCD34D]/80 leading-relaxed">
              Never share your secret key. Anyone with this key can perform actions on your behalf including creating and managing payments.
            </p>
          </div>
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
