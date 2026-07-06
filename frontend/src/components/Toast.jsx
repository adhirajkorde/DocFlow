import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  const styles = {
    success: 'border-green-500/20 bg-green-50/80 text-green-800 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-300',
    error: 'border-red-500/20 bg-red-50/80 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300',
    info: 'border-blue-500/20 bg-blue-50/80 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300'
  };

  const icons = {
    success: <CheckCircle className="text-green-600 dark:text-green-400" size={18} />,
    error: <AlertCircle className="text-red-600 dark:text-red-400" size={18} />,
    info: <Info className="text-blue-600 dark:text-blue-400" size={18} />
  };

  return (
    <div className={`pointer-events-auto flex items-center justify-between p-4 mb-3 w-[340px] max-w-[calc(100vw-2rem)] border backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] animate-fade-in-up ${styles[type]}`}>
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className="text-sm font-medium truncate whitespace-normal">
          {message}
        </p>
      </div>
      <button onClick={onClose} className="ml-4 flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
