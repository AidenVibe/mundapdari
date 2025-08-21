import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'medium',
  hover = false,
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-200',
        paddingClasses[padding],
        hover && 'hover:shadow-md transition-shadow duration-200',
        onClick && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export default Card;