import React from 'react';
import { clsx } from 'clsx';

interface FABProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

const FAB: React.FC<FABProps> = ({
  onClick,
  icon,
  children,
  variant = 'primary',
  size = 'medium',
  position = 'bottom-right',
  className,
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const baseClasses = 'fixed rounded-full shadow-soft-xl hover:shadow-soft-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed z-50 touch-manipulation';

  const variantClasses = {
    primary: 'bg-gradient-primary text-white hover:shadow-warm focus:ring-primary-200',
    secondary: 'bg-secondary-300 text-secondary-800 hover:bg-secondary-400 focus:ring-secondary-200',
    accent: 'bg-accent-300 text-accent-800 hover:bg-accent-400 focus:ring-accent-200',
  };

  const sizeClasses = {
    medium: 'w-14 h-14 text-lg', // 56px
    large: 'w-16 h-16 text-xl',  // 64px
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || '작업 실행'}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        positionClasses[position],
        'flex items-center justify-center',
        className
      )}
    >
      {icon && (
        <span className="flex items-center justify-center">
          {icon}
        </span>
      )}
      {children && !icon && children}
    </button>
  );
};

export default FAB;