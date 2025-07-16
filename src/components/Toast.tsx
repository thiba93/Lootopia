import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500/20 border-green-500/30';
      case 'error': return 'bg-red-500/20 border-red-500/30';
      case 'info': return 'bg-blue-500/20 border-blue-500/30';
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        ${getBgColor()} backdrop-blur-md rounded-xl p-4 border shadow-lg
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm">{title}</h4>
            <p className="text-white/80 text-sm mt-1">{message}</p>
          </div>
          <button
            onClick={() => onClose(id)}
            className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;