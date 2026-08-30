import { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Check } from 'lucide-react';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAsRead();
    }
  };

  const formatTime = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-2 hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors duration-150 relative"
      >
        <Bell size={20} className="text-[#6B7280]" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111] rounded-xl shadow-lg border border-[#E5E7EB] dark:border-[#2A2A2A] z-50 overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A] flex items-center justify-between bg-[#FAFAFA] dark:bg-[#0B0B0C]">
            <h3 className="text-sm font-semibold text-[#111] dark:text-[#EAEAEA]">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); clearNotifications(); setIsOpen(false); }}
                className="text-xs text-[#4F46E5] hover:text-[#4338CA] transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6B7280]">
                No recent notifications
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] transition-colors">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check size={14} className="text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">
                          {notif.message}
                        </p>
                        <p className="text-sm text-[#059669] font-medium mt-0.5">
                          ₹{notif.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1">
                          {formatTime(notif.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
