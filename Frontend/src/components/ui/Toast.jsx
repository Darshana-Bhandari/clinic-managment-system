
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const config = {
  success: { Icon: CheckCircle2, cls: 'toast-success' },
  error: { Icon: XCircle, cls: 'toast-error' },
  warning: { Icon: AlertTriangle, cls: 'toast-warning' },
  info: { Icon: Info, cls: 'toast-info' },
};

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose?.(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const { Icon, cls } = config[type] || config.info;

  return (
    <div className={`toast ${cls}`} role="status" aria-live="polite">
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="shrink-0 text-white/80 transition-colors hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;