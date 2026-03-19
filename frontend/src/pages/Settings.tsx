import { useState, useEffect } from 'react';

import { Toast } from '../components/ui/Toast';
import { useMerchant } from '../context/MerchantContext';

export const Settings = () => {
  const { merchant, updateMerchant } = useMerchant();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [settings, setSettings] = useState({
    businessName: merchant?.businessName || merchant?.name || '',
    email: merchant?.email || '',
    phone: merchant?.phone || '',

    autoSettle: true,
    settlementFrequency: 'DAILY',
  });

  useEffect(() => {
    if (merchant) {
      setSettings(prev => ({
        ...prev,
        businessName: merchant.businessName || merchant.name,
        email: merchant.email,
        phone: merchant.phone || '',
      }));
    }
  }, [merchant]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMerchant({ name: settings.businessName, email: settings.email, phone: settings.phone, businessName: settings.businessName });
    setToast({ message: 'Settings saved successfully', type: 'success' });
  };

  return (
    <div>
      <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Settings</h1>

      <div className="max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Business Information */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-4">Business Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Settlement Preferences */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA] mb-4">Settlement Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#111] dark:text-[#EAEAEA]">Auto Settlement</div>
                  <div className="text-xs text-[#6B7280] mt-1">Automatically process settlements</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, autoSettle: !settings.autoSettle })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    settings.autoSettle ? 'bg-[#4F46E5]' : 'bg-[#E5E7EB] dark:bg-[#2A2A2A]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      settings.autoSettle ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm text-[#6B7280] mb-2">Settlement Frequency</label>
                <select
                  value={settings.settlementFrequency}
                  onChange={(e) => setSettings({ ...settings, settlementFrequency: e.target.value })}
                  className="input-field"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
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
