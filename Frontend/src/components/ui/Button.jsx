

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const variantClasses = {
    primary: 'btn-primary',
    accent: 'btn-accent',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    success: 'btn-success',
    danger: 'btn-danger',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantClasses[variant] || ''} ${sizeClasses[size] || ''} ${fullWidth ? 'btn-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner spinner-sm" />
          <span>Please wait…</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;