import { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  History,
  Plus,
  Copy,
  ExternalLink,
  RefreshCw,
  Shield,
  Power,
  PowerOff,
  Terminal,
  Play
} from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { developerApi } from '../api/developerApi';
import type { PaymentLink, ApiLog } from '../types';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';

export const DeveloperPortal = () => {
  const { merchant } = useMerchant();
  const [activeTab, setActiveTab] = useState<'links' | 'logs' | 'test'>('links');
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({
    title: '',
    description: '',
    amount: '',
    isReusable: true
  });

  const [testPayload, setTestPayload] = useState('{\n  "title": "API Test Link",\n  "amount": 500.00,\n  "isReusable": true\n}');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (merchant) {
      if (activeTab === 'links') loadLinks();
      if (activeTab === 'logs') loadLogs();
    }
  }, [merchant, activeTab]);

  const loadLinks = async () => {
    if (!merchant) return;
    setIsLoading(true);
    try {
      const data = await developerApi.getPaymentLinks(merchant.id);
      setLinks(data);
    } catch (error) {
      setToast({ message: 'Failed to load payment links', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async () => {
    if (!merchant) return;
    setIsLoading(true);
    try {
      const data = await developerApi.getApiLogs(merchant.id);
      setLogs(data);
    } catch (error) {
      setToast({ message: 'Failed to load API logs', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant) return;

    try {
      await developerApi.createPaymentLink(merchant.id, {
        title: newLink.title,
        description: newLink.description,
        amount: parseFloat(newLink.amount),
        isReusable: newLink.isReusable
      });
      setToast({ message: 'Payment link created successfully', type: 'success' });
      setIsModalOpen(false);
      setNewLink({ title: '', description: '', amount: '', isReusable: true });
      loadLinks();
    } catch (error) {
      setToast({ message: 'Failed to create link', type: 'error' });
    }
  };

  const toggleLinkStatus = async (linkCode: string) => {
    if (!merchant) return;
    try {
      await developerApi.togglePaymentLink(merchant.id, linkCode);
      setToast({ message: 'Status updated', type: 'success' });
      loadLinks();
    } catch (error) {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const runApiTest = async () => {
    if (!merchant || !merchant.apiKey) {
      setToast({ message: 'API key not found', type: 'error' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const payload = JSON.parse(testPayload);
      const result = await developerApi.createLinkViaApi(merchant.apiKey, payload);
      setTestResult(result);
      setToast({ message: 'API Request successful', type: 'success' });
    } catch (error: any) {
      setTestResult({ error: error.message });
      setToast({ message: 'API Request failed', type: 'error' });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copied to clipboard', type: 'info' });
  };

  const getLinkUrl = (code: string) => `${window.location.origin}/pay/link/${code}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">Developer Portal</h1>
          <p className="text-[#6B7280] text-sm mt-1">Manage reusable payment links and monitor API activity</p>
        </div>

        <div className="flex bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${activeTab === 'links' ? 'bg-[#F3F4F6] dark:bg-[#1A1A1A] text-[#111] dark:text-[#EAEAEA]' : 'text-[#6B7280]'}`}
          >
            <LinkIcon size={16} />
            Payment Links
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${activeTab === 'logs' ? 'bg-[#F3F4F6] dark:bg-[#1A1A1A] text-[#111] dark:text-[#EAEAEA]' : 'text-[#6B7280]'}`}
          >
            <History size={16} />
            API Logs
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${activeTab === 'test' ? 'bg-[#F3F4F6] dark:bg-[#1A1A1A] text-[#111] dark:text-[#EAEAEA]' : 'text-[#6B7280]'}`}
          >
            <Terminal size={16} />
            Sandbox
          </button>
        </div>
      </div>

      {activeTab === 'links' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA]">Your Payment Links</h2>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus size={18} />
              Create New Link
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link) => (
              <div key={link.id} className="card p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-[#111] dark:text-[#EAEAEA] line-clamp-1">{link.title}</h3>
                    <p className="text-xs text-[#6B7280]">{link.linkCode}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    link.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {link.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-semibold text-[#111] dark:text-[#EAEAEA]">₹{link.amount.toFixed(2)}</span>
                  <span className="text-xs text-[#6B7280]">per payment</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-2 bg-[#F9FAFB] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg">
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Payments</p>
                    <p className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">{link.paymentCount}</p>
                  </div>
                  <div className="p-2 bg-[#F9FAFB] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg">
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Collected</p>
                    <p className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">₹{link.totalCollected.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs py-1.5"
                      onClick={() => copyToClipboard(getLinkUrl(link.linkCode))}
                    >
                      <Copy size={14} className="mr-1.5" />
                      Copy URL
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs py-1.5"
                      onClick={() => window.open(getLinkUrl(link.linkCode), '_blank')}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    className={`w-full text-xs py-1.5 ${link.status === 'ACTIVE' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                    onClick={() => toggleLinkStatus(link.linkCode)}
                  >
                    {link.status === 'ACTIVE' ? (
                      <><PowerOff size={14} className="mr-1.5" /> Deactivate Link</>
                    ) : (
                      <><Power size={14} className="mr-1.5" /> Activate Link</>
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {links.length === 0 && !isLoading && (
              <div className="col-span-full py-12 text-center card">
                <LinkIcon size={40} className="mx-auto text-[#D1D5DB] mb-3" />
                <p className="text-[#6B7280]">No payment links created yet</p>
                <Button variant="ghost" className="mt-2" onClick={() => setIsModalOpen(true)}>
                  Create your first link
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA]">API Request Logs</h2>
            <Button variant="outline" size="sm" onClick={loadLogs} disabled={isLoading}>
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] dark:bg-[#111] border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                    <th className="py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Method</th>
                    <th className="py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Endpoint</th>
                    <th className="py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">API Key</th>
                    <th className="py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Timestamp</th>
                    <th className="py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors">
                      <td className="py-4 px-6 text-sm">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'POST' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20' : 'bg-green-50 text-green-700 dark:bg-green-900/20'
                        }`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-[#111] dark:text-[#EAEAEA] font-mono">{log.endpoint}</td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`flex items-center gap-1.5 ${
                          log.statusCode >= 400 ? 'text-red-500' : 'text-green-500'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                             log.statusCode >= 400 ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-[#6B7280] font-mono">{log.apiKey || 'Session'}</td>
                      <td className="py-4 px-6 text-sm text-[#6B7280]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <button className="text-indigo-600 hover:text-indigo-700 font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#6B7280]">No API logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'test' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] flex items-center gap-2">
                <Shield size={20} className="text-indigo-600" />
                API Sandbox
              </h2>
              <p className="text-[#6B7280] text-sm mt-1">Test the Payment Link API directly from your browser.</p>
            </div>

            <div className="card p-6 bg-[#0B0B0C] border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                   POST /api/v1/payment-links
                </span>
                <span className="text-[10px] text-[#6B7280] font-mono">Content-Type: application/json</span>
              </div>

              <div className="mb-4">
                <label className="text-[10px] text-[#6B7280] font-medium uppercase mb-2 block">X-Api-Key</label>
                <div className="px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-xs text-[#EAEAEA] font-mono">
                  {merchant?.apiKey ? `${merchant.apiKey.substring(0, 12)}...` : 'Not Set'}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[10px] text-[#6B7280] font-medium uppercase mb-2 block">Request Body (JSON)</label>
                <textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  className="w-full h-40 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-4 text-xs text-[#34D399] font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <Button
                onClick={runApiTest}
                disabled={isTesting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 py-2"
              >
                {isTesting ? <RefreshCw className="animate-spin mr-2" /> : <Play size={16} className="mr-2" />}
                Send Request
              </Button>
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA]">Response</h2>
                {testResult && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    testResult.error ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'
                  }`}>
                    {testResult.error ? 'ERROR' : '200 OK'}
                  </span>
                )}
             </div>

             <div className="card p-0 bg-[#0B0B0C] border-[#2A2A2A] min-h-[400px] flex flex-col">
                {testResult ? (
                  <pre className="p-6 text-xs text-indigo-300 font-mono overflow-auto flex-1">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-[#6B7280] space-y-3 opacity-50">
                    <Terminal size={48} strokeWidth={1} />
                    <p className="text-sm">Response will appear here</p>
                  </div>
                )}

                {testResult && !testResult.error && (
                  <div className="p-4 border-t border-[#2A2A2A] bg-[#1a1a1b]">
                    <p className="text-xs text-[#EAEAEA] mb-3">Your payment link is live!</p>
                    <div className="flex gap-2">
                       <Button size="sm" onClick={() => window.open(testResult.paymentUrl, '_blank')} className="flex-1 text-xs">
                          <ExternalLink size={14} className="mr-2" />
                          View Page
                       </Button>
                       <Button size="sm" variant="outline" onClick={() => copyToClipboard(testResult.paymentUrl)} className="text-xs">
                          <Copy size={14} />
                       </Button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[#E5E7EB] dark:border-[#2A2A2A] flex justify-between items-center">
              <h3 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA]">Create Reusable Link</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B7280] hover:text-[#111] dark:hover:text-[#EAEAEA]">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] uppercase mb-1">Link Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Donation for Event, Monthly Fee"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  className="w-full bg-[#F9FAFB] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-[#111] dark:text-[#EAEAEA] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] uppercase mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Describe what people are paying for..."
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  className="w-full bg-[#F9FAFB] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm text-[#111] dark:text-[#EAEAEA] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] uppercase mb-1">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">₹</span>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="0.00"
                    value={newLink.amount}
                    onChange={(e) => setNewLink({ ...newLink, amount: e.target.value })}
                    className="w-full bg-[#F9FAFB] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg pl-8 pr-4 py-2.5 text-sm font-medium text-[#111] dark:text-[#EAEAEA] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                <div className="bg-indigo-600 rounded-lg p-2 text-white">
                  <RefreshCw size={18} />
                </div>
                <div className="flex-1">
                   <p className="text-xs font-medium text-indigo-900 dark:text-indigo-200">Reusable Link</p>
                   <p className="text-[10px] text-indigo-700/70 dark:text-indigo-400/70">Collect multiple payments from different people using this single link.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLink.isReusable}
                    onChange={(e) => setNewLink({ ...newLink, isReusable: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Create Link</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
