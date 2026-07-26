
import { X } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  className = '',
}) => {
  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose?.();
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`modal ${sizeClasses[size] || sizeClasses.md} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            <div className="min-w-0">
              {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>}
              {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;