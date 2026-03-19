import { Outlet, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  RotateCcw, 
  Wallet, 
  FileText, 
  Key, 
  Settings,
  LogOut,
  Code
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { NotificationBell } from './NotificationBell';

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const { merchantId } = useParams();
  const location = useLocation();
  const { merchant, logout } = useMerchant();

  if (!merchant) {
    return <Navigate to="/login" replace />;
  }

  if (merchantId && Number(merchantId) !== merchant.id) {
    return <Navigate to={`/merchant/${merchant.id}/dashboard`} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: 'transactions', label: 'Transactions', icon: Receipt },
    { path: 'payments', label: 'Payments', icon: CreditCard },
    { path: 'refunds', label: 'Refunds', icon: RotateCcw },
    { path: 'settlements', label: 'Settlements', icon: Wallet },
    { path: 'reports', label: 'Reports', icon: FileText },
    { path: 'api-keys', label: 'API Keys', icon: Key },
    { path: 'developer', label: 'Developer Portal', icon: Code },
    { path: 'settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    return location.pathname.includes(`/${path}`);
  };

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C]">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#111] border-r border-[#E5E7EB] dark:border-[#2A2A2A] flex flex-col">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
          <h1 className="text-xl font-medium text-[#111] dark:text-[#EAEAEA] truncate">{merchant.name}</h1>
          <p className="text-xs text-[#6B7280] mt-1">Merchant #{merchant.id}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(`/merchant/${merchantId}/${item.path}`)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  active
                    ? 'bg-[#F3F4F6] dark:bg-[#1A1A1A] text-[#111] dark:text-[#EAEAEA]'
                    : 'text-[#6B7280] hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A]'
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-[#111] border-b border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between px-6">
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full px-4 py-2 bg-[#F9FAFB] dark:bg-[#0B0B0C] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-lg text-sm text-[#111] dark:text-[#EAEAEA] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-6">
            <NotificationBell />
            
            <div className="w-8 h-8 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-sm font-semibold uppercase shadow-sm">
              {merchant.logo || merchant.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
    </NotificationProvider>
  );
};
