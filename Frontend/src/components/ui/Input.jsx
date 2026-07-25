import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  className = '',
  required = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  helperText,
  ...props
}, ref) => {
  const inputClasses = `input ${error ? 'input-error' : ''} ${success ? 'input-success' : ''} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-gray-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${inputClasses} ${icon && iconPosition === 'left' ? 'pl-10' : ''}`}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-gray-400">
            {icon}
          </span>
        )}
      </div>
      {helperText && (
        <p className={`mt-1 text-sm ${error ? 'text-danger' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;