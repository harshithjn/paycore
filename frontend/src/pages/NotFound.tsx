import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <h1 className="text-[12rem] font-bold text-[#111]/5 dark:text-white/5 select-none leading-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#4F46E5] w-2 h-2 rounded-full animate-ping mr-2"></div>
            <h2 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">Page Not Found</h2>
          </div>
        </div>
        
        <p className="text-[#6B7280] mb-10 leading-relaxed">
          The link you followed might be broken, or the page may have been removed. 
          Check the URL or return to safety.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home size={18} />
            Back to Home
          </Button>
        </div>

        <div className="mt-16 pt-8 border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
          <p className="text-xs text-[#6B7280] uppercase tracking-widest font-medium">PayCore System</p>
        </div>
      </div>
    </div>
  );
};
