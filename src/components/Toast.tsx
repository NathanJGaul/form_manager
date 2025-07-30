/**
 * Toast notification component for user feedback
 */
import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Error messages persist until manually dismissed
    if (message.type === 'error') {
      return;
    }
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(message.id), 300); // Allow fade out animation
    }, message.duration || 4000);

    return () => clearTimeout(timer);
  }, [message.id, message.duration, message.type, onClose]);

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <Icons.CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <Icons.AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Icons.AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Icons.Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 max-w-lg w-full border rounded-lg shadow-lg z-50
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor()}
        ${message.type === 'error' ? 'max-h-[80vh] flex flex-col' : ''}
      `}
    >
      <div className={`flex items-start space-x-3 p-4 ${message.type === 'error' && message.message ? 'pb-2' : ''}`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{message.title}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(message.id), 300);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          title="Dismiss"
        >
          <Icons.X className="w-4 h-4" />
        </button>
      </div>
      {message.message && (
        <div className={`px-4 pb-4 ${message.type === 'error' ? 'overflow-y-auto' : ''}`}>
          <p className={`text-sm text-gray-600 whitespace-pre-wrap ${
            message.type === 'error' ? 'font-mono text-xs' : ''
          }`}>
            {message.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default Toast;