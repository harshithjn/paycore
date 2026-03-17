import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useParams } from 'react-router-dom';
import { Save, AlertTriangle, CheckCircle, Globe, Bell, Shield, CreditCard } from 'lucide-react';

export const Settings: React.FC = () => {
  const { merchantId } = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [webhookUrl, setWebhookUrl] = useState('https://your-domain.com/webhook');
  const [isWebhookVerified, setIsWebhookVerified] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Merchant Profile', icon: CreditCard },
    { id: 'webhook', name: 'Webhook Settings', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const handleWebhookTest = () => {
    // Simulate webhook verification
    setTimeout(() => {
      setIsWebhookVerified(true);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your merchant account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <Card className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Merchant Profile
              </h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Merchant ID
                    </label>
                    <input
                      type="text"
                      value={merchantId}
                      disabled
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Acme Corporation"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      defaultValue="merchant@acme.com"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue="+91-9876543210"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Address
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="123 Business Street, Tech Park, Bangalore, Karnataka 560001"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      defaultValue="29ABCDE1234F1Z5"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      defaultValue="ABCDE1234F"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'webhook' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Webhook Configuration
              </h3>
              
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Webhook Integration
                      </h4>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                        Configure your webhook endpoint to receive real-time payment notifications. 
                        This is crucial for implementing the Observer pattern in your payment system.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Webhook URL
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="https://your-domain.com/webhook"
                    />
                    <Button variant="outline" onClick={handleWebhookTest}>
                      Test Webhook
                    </Button>
                  </div>
                  {isWebhookVerified && (
                    <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Webhook verified successfully
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Events to Subscribe
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'payment.success', label: 'Payment Successful', description: 'Triggered when a payment is completed successfully' },
                      { id: 'payment.failed', label: 'Payment Failed', description: 'Triggered when a payment fails' },
                      { id: 'payment.pending', label: 'Payment Pending', description: 'Triggered when a payment is pending' },
                      { id: 'refund.processed', label: 'Refund Processed', description: 'Triggered when a refund is processed' },
                      { id: 'settlement.completed', label: 'Settlement Completed', description: 'Triggered when settlement is completed' },
                    ].map((event) => (
                      <div key={event.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <input
                          type="checkbox"
                          id={event.id}
                          defaultChecked
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor={event.id} className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.label}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Webhook Security
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Webhook Secret Key (for signature verification):
                    </p>
                    <code className="text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded border">
                      whsec_1234567890abcdef1234567890abcdef
                    </code>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Webhook Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification Preferences
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Email Notifications
                  </h4>
                  <div className="space-y-3">
                    {[
                      { id: 'email_transactions', label: 'Transaction Alerts', description: 'Get notified about successful and failed transactions' },
                      { id: 'email_settlements', label: 'Settlement Reports', description: 'Daily settlement summary emails' },
                      { id: 'email_refunds', label: 'Refund Notifications', description: 'Alerts when refunds are processed' },
                      { id: 'email_security', label: 'Security Alerts', description: 'Important security-related notifications' },
                    ].map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.label}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {notification.description}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id={notification.id}
                          defaultChecked
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    SMS Notifications
                  </h4>
                  <div className="space-y-3">
                    {[
                      { id: 'sms_critical', label: 'Critical Alerts Only', description: 'High-priority security and system alerts' },
                      { id: 'sms_settlements', label: 'Settlement Confirmations', description: 'SMS when settlements are processed' },
                    ].map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.label}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {notification.description}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id={notification.id}
                          defaultChecked={notification.id === 'sms_critical'}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Security Settings
              </h3>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Security Recommendations
                      </h4>
                      <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                        <li>Enable two-factor authentication for enhanced security</li>
                        <li>Regularly rotate your API keys</li>
                        <li>Monitor login activity and API usage</li>
                        <li>Use strong, unique passwords</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Two-Factor Authentication
                  </h4>
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        2FA Status
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Password Settings
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Login Activity
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last login:</span>
                        <span className="text-gray-600 dark:text-gray-400">Today at 2:30 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="text-gray-600 dark:text-gray-400">Bangalore, India</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Device:</span>
                        <span className="text-gray-600 dark:text-gray-400">Chrome on macOS</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Update Security Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};