import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowUpDown, 
  RotateCcw, 
  Banknote, 
  BarChart3, 
  Key, 
  Settings, 
  User, 
  LogOut,
  Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: 'transactions', icon: ArrowUpDown },
  { name: 'Payments', href: 'payments', icon: CreditCard },
  { name: 'Refunds', href: 'refunds', icon: RotateCcw },
  { name: 'Settlements', href: 'settlements', icon: Banknote },
  { name: 'Reports', href: 'reports', icon: BarChart3 },
  { name: 'API Keys', href: 'api-keys', icon: Key },
  { name: 'Settings', href: 'settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { merchantId } = useParams();

  return (
    <div className="flex h-screen w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            UPI Gateway
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const href = `/merchant/${merchantId}/${item.href}`;
          return (
            <NavLink
              key={item.name}
              to={href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
          <User className="mr-3 h-5 w-5" />
          <div>
            <p className="font-medium">Merchant #{merchantId}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
        </div>
        <button className="mt-2 flex w-full items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};