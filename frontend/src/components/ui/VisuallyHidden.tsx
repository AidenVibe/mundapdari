import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  asChild?: boolean;
}

/**
 * 시각적으로는 숨겨지지만 스크린 리더에서는 읽힐 수 있는 텍스트
 * 접근성을 위한 부가 설명이나 레이블 제공
 */
const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ 
  children, 
  asChild = false 
}) => {
  const className = "sr-only";
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: `${children.props.className || ''} ${className}`.trim()
    });
  }

  return (
    <span className={className}>
      {children}
    </span>
  );
};

export default VisuallyHidden;