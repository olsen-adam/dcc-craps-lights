import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 4000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-600 text-white border-red-700';
      case 'success':
        return 'bg-green-600 text-white border-green-700';
      case 'info':
        return 'bg-blue-600 text-white border-blue-700';
      default:
        return 'bg-gray-600 text-white border-gray-700';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-slide-up">
      <div className={`px-4 py-3 rounded-lg shadow-lg border ${getToastStyles()} max-w-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {type === 'error' && (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast; 