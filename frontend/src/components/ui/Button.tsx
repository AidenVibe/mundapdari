import React from 'react';
import { clsx } from 'clsx';
import type { ButtonProps } from '@/types';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-button transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transform active:scale-95';

  const variantClasses = {
    primary: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-300 shadow-soft hover:shadow-soft-lg', // #60300D 에스프레소 브라운 primary
    secondary: 'bg-neutral-500 text-white hover:bg-neutral-600 focus:ring-neutral-300 shadow-soft', // #8B8680 브라운 그레이
    accent: 'bg-accent-300 text-accent-800 hover:bg-accent-400 focus:ring-accent-300 shadow-soft hover:shadow-soft-lg',
    success: 'bg-success-400 text-success-800 hover:bg-success-500 focus:ring-success-300 shadow-soft',
    warning: 'bg-warning-300 text-warning-800 hover:bg-warning-400 focus:ring-warning-300 shadow-soft',
    error: 'bg-error-300 text-error-800 hover:bg-error-400 focus:ring-error-300 shadow-soft',
    ghost: 'bg-transparent text-success-600 hover:bg-success-50 focus:ring-success-300',
    outline: 'bg-transparent text-success-600 border-2 border-success-400 hover:bg-success-50 hover:border-success-500 focus:ring-success-300',
    header: 'bg-background-textBox text-text-dark hover:bg-opacity-95 focus:ring-success-300 shadow-soft', // 반투명 박스 스타일
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm min-h-touch min-w-touch gap-1',
    medium: 'px-6 py-3 text-base min-h-button min-w-touch gap-2',
    large: 'px-8 py-4 text-lg min-h-touch-lg min-w-touch-lg gap-2',
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="loading-spinner">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          </div>
          <span>처리 중...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;