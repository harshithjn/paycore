import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { paymentApi } from '../api/paymentApi';
import { useMerchant } from './MerchantContext';
import type { Transaction } from '../types';

interface Notification {
  id: string;
  message: string;
  amount: number;
  time: Date;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { merchant } = useMerchant();
  const merchantId = merchant?.id;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch to establish baseline
    const initializeBaseline = async () => {
      if (!merchantId) return;
      try {
        const txns = await paymentApi.getMerchantTransactions(merchantId);
        if (txns && txns.length > 0) {
           // We don't notify on past transactions on first load
           setLastCheckedTime(new Date());
        }
      } catch (e) {
        console.error("Failed to initialize notification baseline", e);
      }
    };
    
    initializeBaseline();

    // Poll every 10 seconds for new SUCCESS transactions
    const interval = setInterval(async () => {
      if (!merchantId) return;
      try {
        const txns = await paymentApi.getMerchantTransactions(merchantId);
        
        const newSuccessTxns = txns.filter(t => 
          t.status === 'SUCCESS' && 
          new Date(t.created_at || t.updated_at) > lastCheckedTime
        );

        if (newSuccessTxns.length > 0) {
          const newNotifs: Notification[] = newSuccessTxns.map((t: Transaction) => ({
            id: t.id,
            message: `Successful payment received via ${t.payment_method || 'Link'}`,
            amount: t.amount,
            time: new Date(),
            isRead: false
          }));

          setNotifications(prev => {
            // Keep at most 2 notifications as requested
            const combined = [...newNotifs, ...prev];
            return combined.slice(0, 2);
          });
          
          setUnreadCount(prev => Math.min(prev + newNotifs.length, 2));
          setLastCheckedTime(new Date());
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [merchantId, lastCheckedTime]);

  const markAsRead = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
