import React from 'react';
import { clsx } from 'clsx';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'family';
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
  disabled?: boolean;
  clickable?: boolean;
  onDelete?: () => void;
  onClick?: () => void;
  icon?: React.ReactNode;
  deleteIcon?: React.ReactNode;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  selected = false,
  disabled = false,
  clickable = false,
  onDelete,
  onClick,
  icon,
  deleteIcon,
  className,
}) => {
  const baseClasses = 'inline-flex items-center gap-1 font-medium rounded-full transition-all duration-200 touch-manipulation';

  const variantClasses = {
    default: selected 
      ? 'bg-gray-200 text-gray-800 border border-gray-300' 
      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-150',
    primary: selected
      ? 'bg-primary-300 text-primary-800 border border-primary-400'
      : 'bg-primary-100 text-primary-700 border border-primary-200 hover:bg-primary-150',
    secondary: selected
      ? 'bg-secondary-300 text-secondary-800 border border-secondary-400'
      : 'bg-secondary-100 text-secondary-700 border border-secondary-200 hover:bg-secondary-150',
    success: selected
      ? 'bg-success-300 text-success-800 border border-success-400'
      : 'bg-success-100 text-success-700 border border-success-200 hover:bg-success-150',
    warning: selected
      ? 'bg-warning-300 text-warning-800 border border-warning-400'
      : 'bg-warning-100 text-warning-700 border border-warning-200 hover:bg-warning-150',
    error: selected
      ? 'bg-error-300 text-error-800 border border-error-400'
      : 'bg-error-100 text-error-700 border border-error-200 hover:bg-error-150',
    family: selected
      ? 'bg-pink-300 text-pink-800 border border-pink-400'
      : 'bg-pink-100 text-pink-700 border border-pink-200 hover:bg-pink-150',
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-xs min-h-[28px]',
    medium: 'px-3 py-1.5 text-sm min-h-[32px]',
    large: 'px-4 py-2 text-base min-h-[36px]',
  };

  const interactiveClasses = clickable || onClick
    ? 'cursor-pointer hover:shadow-soft active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1'
    : '';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : '';

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onDelete) {
      onDelete();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        interactiveClasses,
        disabledClasses,
        className
      )}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
    >
      {icon && (
        <span className="flex items-center justify-center text-current">
          {icon}
        </span>
      )}
      
      <span className="flex-1 truncate">
        {children}
      </span>

      {onDelete && (
        <button
          onClick={handleDelete}
          className="flex items-center justify-center ml-1 p-0.5 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-150"
          aria-label="삭제"
          tabIndex={-1}
        >
          {deleteIcon || (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default Chip;