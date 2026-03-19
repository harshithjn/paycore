import React, { createContext, useContext, useState, useEffect } from 'react';

export interface MerchantProfile {
  id: number;
  name: string;
  logo: string;
  email: string;
  phone?: string;
  businessName?: string;
  apiKey?: string;
}

interface MerchantContextType {
  merchant: MerchantProfile | null;
  login: (profile: MerchantProfile) => void;
  logout: () => void;
  updateMerchant: (updates: Partial<MerchantProfile>) => void;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [merchant, setMerchant] = useState<MerchantProfile | null>(() => {
    const saved = localStorage.getItem('paycore_merchant');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (merchant) {
      localStorage.setItem('paycore_merchant', JSON.stringify(merchant));
    } else {
      localStorage.removeItem('paycore_merchant');
    }
  }, [merchant]);

  const login = (profile: MerchantProfile) => setMerchant(profile);
  const logout = () => setMerchant(null);
  const updateMerchant = (updates: Partial<MerchantProfile>) => {
    setMerchant(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <MerchantContext.Provider value={{ merchant, login, logout, updateMerchant }}>
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchant = () => {
  const context = useContext(MerchantContext);
  if (context === undefined) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
};
