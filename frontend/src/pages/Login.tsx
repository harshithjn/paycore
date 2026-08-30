import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, UserRound } from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { Button } from '../components/ui/Button';
import apiClient from '../api/client';

const GUEST_EMAIL = 'guest@paycore.demo';
const GUEST_PASSWORD = 'guest-demo-1234';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useMerchant();

  const loginWithCredentials = async (loginEmail: string, loginPassword: string) => {
    const loginRes = await apiClient.post('/api/merchant/login', {
      email: loginEmail,
      password: loginPassword,
    });
    const { merchantId } = loginRes.data;

    const detailsRes = await apiClient.get(`/api/merchant/${merchantId}`);
    const merchant = detailsRes.data;

    login({
      id: merchant.id,
      name: merchant.name,
      logo: merchant.name?.charAt(0)?.toUpperCase() || '',
      email: merchant.email,
      phone: merchant.phone || '',
      businessName: merchant.businessName || '',
    });

    navigate(`/merchant/${merchant.id}/dashboard`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await loginWithCredentials(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    setError('');

    try {
      await loginWithCredentials(GUEST_EMAIL, GUEST_PASSWORD);
    } catch {
      try {
        await apiClient.post('/api/merchant/register', {
          name: 'Guest User',
          email: GUEST_EMAIL,
          password: GUEST_PASSWORD,
          businessName: 'PayCore Demo',
        });
        await loginWithCredentials(GUEST_EMAIL, GUEST_PASSWORD);
      } catch (err: any) {
        setError(err.message || 'Unable to start guest session');
      }
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0B0B0C] p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-xl shadow-sm border border-[#E5E7EB] dark:border-[#2A2A2A] overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] dark:bg-[#1A1A1A] flex items-center justify-center">
              <Zap className="h-6 w-6 text-[#111] dark:text-[#EAEAEA]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-[#111] dark:text-[#EAEAEA] mb-2">
            Welcome back
          </h2>
          <p className="text-center text-sm text-[#6B7280] mb-8">
            Log in to manage your payments
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#9CA3AF]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#0B0B0C] text-[#111] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#111] focus:border-[#111] dark:focus:ring-[#EAEAEA] dark:focus:border-[#EAEAEA] transition-colors sm:text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#9CA3AF]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#0B0B0C] text-[#111] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#111] focus:border-[#111] dark:focus:ring-[#EAEAEA] dark:focus:border-[#EAEAEA] transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGuestLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-[#111] hover:bg-[#333] dark:bg-[#EAEAEA] dark:text-[#111] dark:hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111] transition-colors mt-2"
            >
              {isLoading ? 'Signing in...' : (
                <span className="flex items-center">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB] dark:border-[#2A2A2A]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-[#111] text-[#9CA3AF]">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGuestLogin}
            disabled={isLoading || isGuestLoading}
            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-[#374151] dark:text-[#D1D5DB] bg-white dark:bg-[#0B0B0C] border-[#E5E7EB] dark:border-[#2A2A2A] hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111] transition-colors"
          >
            {isGuestLoading ? 'Starting guest session...' : (
              <span className="flex items-center">
                <UserRound className="mr-2 h-4 w-4" />
                Continue as Guest
              </span>
            )}
          </Button>
          <p className="mt-2 text-center text-xs text-[#9CA3AF]">
            No account needed — explore the dashboard instantly.
          </p>

          <p className="mt-8 text-center text-sm text-[#6B7280]">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-[#111] dark:text-[#EAEAEA] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
