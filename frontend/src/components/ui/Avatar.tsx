import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circular' | 'rounded' | 'square';
  fallbackIcon?: React.ReactNode;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  variant = 'circular',
  fallbackIcon,
  status,
  className,
  onClick,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const variantClasses = {
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none',
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    busy: 'bg-error-500',
    away: 'bg-warning-500',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  const baseClasses = 'inline-flex items-center justify-center bg-gradient-warm text-gray-600 font-medium overflow-hidden transition-all duration-200';
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-soft active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-300' : '';

  // 이름에서 이니셜 생성
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="relative inline-flex">
      <div
        className={clsx(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          interactiveClasses,
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || '아바타'}
            className={clsx('w-full h-full object-cover', variantClasses[variant])}
            onError={handleError}
          />
        ) : name ? (
          <span className="select-none">
            {getInitials(name)}
          </span>
        ) : fallbackIcon ? (
          <span className="text-current">
            {fallbackIcon}
          </span>
        ) : (
          <svg className="w-1/2 h-1/2 text-current" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>

      {/* 상태 표시 */}
      {status && (
        <span
          className={clsx(
            'absolute -bottom-0.5 -right-0.5 border-2 border-white rounded-full',
            statusColors[status],
            statusSizes[size]
          )}
          aria-label={`상태: ${status}`}
        />
      )}
    </div>
  );
};

// 아바타 그룹 컴포넌트
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 3,
  spacing = 'normal',
  className,
}) => {
  const spacingClasses = {
    tight: '-space-x-1',
    normal: '-space-x-2',
    loose: '-space-x-1',
  };

  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  return (
    <div className={clsx('flex items-center', spacingClasses[spacing], className)}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="relative ring-2 ring-white"
          style={{ zIndex: visibleChildren.length - index }}
        >
          {child}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className="relative ring-2 ring-white"
          style={{ zIndex: 0 }}
        >
          <Avatar
            name={`+${remainingCount}`}
            variant="circular"
            className="bg-gray-200 text-gray-600"
          />
        </div>
      )}
    </div>
  );
};

export default Avatar;