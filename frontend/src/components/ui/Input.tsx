import React from 'react';
import { clsx } from 'clsx';
import type { InputProps } from '@/types';

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  type = 'text',
  className,
  ...props
}) => {
  const inputId = React.useId();

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-base font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={clsx(
          'w-full px-4 py-3 text-base border rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          'disabled:bg-gray-50 disabled:cursor-not-allowed',
          'touch-manipulation',
          error
            ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-2 text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;