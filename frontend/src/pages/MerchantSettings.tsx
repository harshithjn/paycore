import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';

interface Merchant {
  id: number;
  name: string;
  email: string;
  webhookUrl: string;
  isActive: boolean;
}

export const MerchantSettings: React.FC = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ id: string; title: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchMerchant();
    fetchWebhookUrl();
  }, [merchantId]);

  const fetchMerchant = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/merchant/${merchantId}`);
      if (response.ok) {
        const data = await response.json();
        setMerchant(data);
      }
    } catch (error) {
      console.error('Error fetching merchant:', error);
    }
  };

  const fetchWebhookUrl = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/merchant/${merchantId}/webhook`);
      if (response.ok) {
        const data = await response.json();
        setWebhookUrl(data.webhookUrl || '');
      }
    } catch (error) {
      console.error('Error fetching webhook URL:', error);
    }
  };

  const handleSaveWebhook = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/merchant/${merchantId}/webhook`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl }),
      });

      if (response.ok) {
        setToast({ id: '1', title: 'Webhook URL updated successfully!', type: 'success' });
      } else {
        setToast({ id: '2', title: 'Failed to update webhook URL', type: 'error' });
      }
    } catch (error) {
      setToast({ id: '3', title: 'Error updating webhook URL', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      setToast({ id: '4', title: 'Please save a webhook URL first', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Create a test transaction to trigger webhook
      const testPayload = {
        merchantId: parseInt(merchantId!),
        amount: 1.00,
        paymentMethod: 'UPI',
        merchantTransactionId: `TEST_${Date.now()}`,
        customerEmail: 'test@example.com',
        callbackUrl: webhookUrl
      };

      const response = await fetch('http://localhost:8081/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        setToast({ id: '5', title: 'Test transaction created! Check your webhook endpoint.', type: 'success' });
      } else {
        setToast({ id: '6', title: 'Failed to create test transaction', type: 'error' });
      }
    } catch (error) {
      setToast({ id: '7', title: 'Error creating test transaction', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Merchant Settings</h1>
        <p className="text-gray-600">Configure webhook notifications and merchant preferences</p>
      </div>

      {merchant && (
        <div className="grid gap-6">
          {/* Merchant Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Merchant Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant ID
                </label>
                <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {merchant.id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {merchant.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {merchant.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  merchant.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {merchant.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </Card>

          {/* Webhook Configuration */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Webhook Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook/payment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This URL will receive POST requests when transaction status changes
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveWebhook}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Saving...' : 'Save Webhook URL'}
                </Button>
                
                <Button
                  onClick={testWebhook}
                  disabled={loading || !webhookUrl}
                  variant="outline"
                >
                  Test Webhook
                </Button>
              </div>
            </div>
          </Card>

          {/* Webhook Payload Example */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Webhook Payload Example</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">
{`{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "merchantTransactionId": "ORDER_12345",
  "status": "SUCCESS",
  "amount": 100.00,
  "paymentMethod": "UPI",
  "timestamp": "2024-01-15T10:30:00Z",
  "failureReason": null,
  "upiTransactionId": "UPI12345678"
}`}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your webhook endpoint should respond with HTTP 200 status code to acknowledge receipt
            </p>
          </Card>
        </div>
      )}

      {toast && (
        <Toast
          id={toast.id}
          title={toast.title}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};