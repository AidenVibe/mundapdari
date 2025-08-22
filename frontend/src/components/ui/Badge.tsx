import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  dot?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  dot = false,
  count,
  maxCount = 99,
  showZero = false,
  position = 'top-right',
  className,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full text-center leading-none';

  const variantClasses = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-secondary-500 text-white',
    success: 'bg-success-500 text-white',
    warning: 'bg-warning-500 text-warning-900',
    error: 'bg-error-500 text-white',
    neutral: 'bg-gray-500 text-white',
  };

  const sizeClasses = {
    small: dot ? 'w-2 h-2' : 'min-w-[16px] h-4 px-1 text-xs',
    medium: dot ? 'w-2.5 h-2.5' : 'min-w-[20px] h-5 px-1.5 text-xs',
    large: dot ? 'w-3 h-3' : 'min-w-[24px] h-6 px-2 text-sm',
  };

  const positionClasses = {
    'top-right': 'absolute -top-1 -right-1',
    'top-left': 'absolute -top-1 -left-1',
    'bottom-right': 'absolute -bottom-1 -right-1',
    'bottom-left': 'absolute -bottom-1 -left-1',
  };

  // 표시할 내용 결정
  const getDisplayContent = () => {
    if (dot) return null;
    
    if (count !== undefined) {
      if (count === 0 && !showZero) return null;
      if (count > maxCount) return `${maxCount}+`;
      return count.toString();
    }
    
    return children;
  };

  const displayContent = getDisplayContent();

  // 배지를 표시하지 않는 경우
  if (!dot && !displayContent) return null;

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        positionClasses[position],
        className
      )}
    >
      {displayContent}
    </span>
  );
};

// 래퍼 컴포넌트 - 자식 요소에 배지를 적용
interface BadgeWrapperProps extends BadgeProps {
  children: React.ReactNode;
  badge?: React.ReactNode;
}

export const BadgeWrapper: React.FC<BadgeWrapperProps> = ({
  children,
  badge,
  ...badgeProps
}) => {
  return (
    <div className="relative inline-flex">
      {children}
      {(badge || badgeProps.count !== undefined || badgeProps.dot) && (
        <Badge {...badgeProps}>
          {badge}
        </Badge>
      )}
    </div>
  );
};

export default Badge;