import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Globe, ArrowRight, CreditCard, BarChart3, Lock } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: CreditCard,
      title: 'Accept Payments',
      description: 'Accept UPI, Cards, and Netbanking payments with a single integration.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with real-time fraud detection and prevention.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track transactions, settlements, and refunds with detailed dashboards.',
    },
    {
      icon: Globe,
      title: 'Payment Links',
      description: 'Generate shareable payment links and send them to your customers instantly.',
    },
    {
      icon: Lock,
      title: 'API-First',
      description: 'Developer-friendly REST APIs with comprehensive documentation.',
    },
    {
      icon: Zap,
      title: 'Instant Settlements',
      description: 'Get your money settled quickly with automated settlement processing.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] font-sans">
      {/* Navigation */}
      <nav className="border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-white/80 dark:bg-[#111]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#111] dark:bg-[#EAEAEA] flex items-center justify-center">
              <Zap className="h-4 w-4 text-white dark:text-[#111]" />
            </div>
            <span className="text-lg font-bold text-[#111] dark:text-[#EAEAEA]">PayCore</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-[#374151] dark:text-[#D1D5DB] hover:text-[#111] dark:hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 text-sm font-medium text-white bg-[#111] dark:bg-[#EAEAEA] dark:text-[#111] rounded-lg hover:bg-[#333] dark:hover:bg-white transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3F4F6] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] text-xs font-medium text-[#6B7280] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Payment Gateway Sandbox
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#111] dark:text-[#EAEAEA] leading-tight tracking-tight max-w-3xl mx-auto">
          The payment infrastructure for{' '}
          <span className="text-[#4F46E5]">modern businesses</span>
        </h1>
        <p className="mt-6 text-lg text-[#6B7280] max-w-xl mx-auto leading-relaxed">
          A complete payment gateway simulation for testing and development.
          Accept payments, manage refunds, and track settlements — all in one place.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#111] dark:bg-[#EAEAEA] dark:text-[#111] rounded-lg hover:bg-[#333] dark:hover:bg-white transition-all shadow-sm"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#374151] dark:text-[#D1D5DB] bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#222] transition-all"
          >
            Log in to dashboard
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="p-6 bg-white dark:bg-[#111] rounded-xl border border-[#E5E7EB] dark:border-[#2A2A2A] hover:border-[#D1D5DB] dark:hover:border-[#3A3A3A] transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] dark:bg-[#1A1A1A] flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[#374151] dark:text-[#D1D5DB]" />
                </div>
                <h3 className="text-base font-semibold text-[#111] dark:text-[#EAEAEA] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#111]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#111] dark:bg-[#EAEAEA] flex items-center justify-center">
              <Zap className="h-3 w-3 text-white dark:text-[#111]" />
            </div>
            <span className="text-sm font-medium text-[#6B7280]">PayCore</span>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Payment Gateway Sandbox · For development and testing
          </p>
        </div>
      </footer>
    </div>
  );
};
