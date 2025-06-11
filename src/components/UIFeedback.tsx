// src/components/UIFeedback.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface UIFeedbackProps {
  type: 'success' | 'error';
  message: string;
  duration?: number; // Duration in ms
  onClose?: () => void;
}

export function UIFeedback({ type, message, duration = 5000, onClose }: UIFeedbackProps) {
  const [visible, setVisible] = useState(true);

  // Auto-hide after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Early return if not visible
  if (!visible) return null;

  return (
    <div
      className={`flex items-center justify-between p-4 mb-4 rounded-lg ${
        type === 'success' 
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
      }`}
    >
      <div className="flex items-center">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 mr-2" />
        ) : (
          <AlertCircle className="w-5 h-5 mr-2" />
        )}
        <span>{message}</span>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default UIFeedback;
