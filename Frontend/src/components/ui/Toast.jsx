import React, { useEffect } from 'react';

const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className="text-xl font-bold">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white/80 hover:text-white">
        ×
      </button>
    </div>
  );
};

export default Toast;