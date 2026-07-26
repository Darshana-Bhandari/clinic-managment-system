
import { X } from 'lucide-react';

/**
 * Badge — tonal status/label pill.
 *
 * @param {string} variant - primary | secondary | success | warning | danger | info | dark | light | outline | gradient
 * @param {string} size    - xs | sm | md | lg
 * @param {boolean} rounded - pill (default true) vs. soft rectangle
 * @param {node} icon, iconPosition ('left'|'right')
 * @param {boolean} pulse, dot (leading status dot)
 * @param {boolean} removable, onRemove
 * @param {string} as - element tag
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  rounded = true,
  icon = null,
  iconPosition = 'left',
  removable = false,
  onRemove = null,
  pulse = false,
  dot = false,
  as: Component = 'span',
  onClick = null,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    info: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    dark: 'bg-slate-900 text-white dark:bg-slate-700',
    light: 'bg-white text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    outline: 'bg-transparent text-primary-700 ring-1 ring-primary-300 dark:text-primary-300 dark:ring-primary-700',
    gradient: 'bg-gradient-to-r from-primary-500 to-primary-700 text-white',
  };

  const dotColor = {
    primary: 'bg-primary-500',
    secondary: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-teal-500',
    dark: 'bg-white',
    light: 'bg-slate-400',
    outline: 'bg-primary-500',
    gradient: 'bg-white',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-1.5',
  };

  const iconSize = { xs: 'h-3 w-3', sm: 'h-3.5 w-3.5', md: 'h-3.5 w-3.5', lg: 'h-4 w-4' }[size] || 'h-3.5 w-3.5';

  const classes = [
    'inline-flex items-center font-semibold leading-none transition-all duration-200',
    rounded ? 'rounded-full' : 'rounded-md',
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    onClick ? 'cursor-pointer hover:opacity-90 hover:-translate-y-px' : '',
    className,
  ].join(' ');

  return (
    <Component
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {dot && (
        <span className={`relative flex ${size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'}`}>
          {pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dotColor[variant]}`} />}
          <span className={`relative inline-flex rounded-full ${size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'} ${dotColor[variant]}`} />
        </span>
      )}

      {icon && iconPosition === 'left' && <span className={`${iconSize} flex shrink-0 items-center`}>{icon}</span>}

      <span className="truncate">{children}</span>

      {icon && iconPosition === 'right' && <span className={`${iconSize} flex shrink-0 items-center`}>{icon}</span>}

      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-1 ml-0.5 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Remove"
        >
          <X className={iconSize} />
        </button>
      )}
    </Component>
  );
};

export default Badge;