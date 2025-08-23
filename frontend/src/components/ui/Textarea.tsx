import React, { useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import type { TextareaProps } from '@/types';

const Textarea: React.FC<TextareaProps & { autoResize?: boolean }> = ({
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
  autoResize = false,
  ...props
}) => {
  const textareaId = React.useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentLength = value.length;

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, autoResize]);

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
              'text-sm font-medium transition-colors',
              currentLength > maxLength
                ? 'text-error-600'
                : currentLength > maxLength * 0.9
                ? 'text-warning-600'
                : currentLength > maxLength * 0.75
                ? 'text-yellow-600'
                : 'text-gray-500'
            )}>
              {maxLength - currentLength > 0 ? `${maxLength - currentLength}자 남음` : `${currentLength - maxLength}자 초과`}
              <span className="text-gray-400 ml-1">({currentLength}/{maxLength})</span>
            </span>
          )}
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        id={textareaId}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          // 최대 글자수 제한 (하드 리미트)
          if (maxLength && newValue.length > maxLength + 50) {
            return; // 50자 여유를 두고 하드 블록
          }
          onChange(newValue);
        }}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={autoResize ? 1 : rows}
        style={autoResize ? { minHeight: `${rows * 1.5}rem`, maxHeight: '12rem' } : undefined}
        className={clsx(
          'w-full px-4 py-3 text-base border rounded-lg transition-all duration-200',
          autoResize ? 'resize-none overflow-hidden' : 'resize-none',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500',
          'touch-manipulation',
          'placeholder:text-gray-400',
          // Border colors based on character count and error state
          error
            ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
            : maxLength && currentLength > maxLength
            ? 'border-error-400 focus:border-error-500 focus:ring-error-500'
            : maxLength && currentLength > maxLength * 0.9
            ? 'border-warning-400 focus:border-warning-500 focus:ring-warning-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
          // Background color hint for over limit
          maxLength && currentLength > maxLength
            ? 'bg-error-25'
            : maxLength && currentLength > maxLength * 0.9
            ? 'bg-warning-25'
            : 'bg-white'
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