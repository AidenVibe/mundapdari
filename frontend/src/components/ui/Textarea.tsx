import React from 'react';
import { clsx } from 'clsx';
import type { TextareaProps } from '@/types';

const Textarea: React.FC<TextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  maxLength,
  rows = 4,
  className,
  ...props
}) => {
  const textareaId = React.useId();
  const currentLength = value.length;

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label
            htmlFor={textareaId}
            className="block text-base font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
          
          {maxLength && (
            <span className={clsx(
              'text-sm',
              currentLength > maxLength * 0.9
                ? 'text-warning-600'
                : 'text-gray-500'
            )}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        rows={rows}
        className={clsx(
          'w-full px-4 py-3 text-base border rounded-lg transition-colors resize-none',
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

export default Textarea;