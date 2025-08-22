import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge, { BadgeWrapper } from '../ui/Badge';

interface NavbarProps {
  variant?: 'default' | 'transparent' | 'elevated';
  fixed?: boolean;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  variant = 'default',
  fixed = true,
  className,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const baseClasses = 'w-full transition-all duration-300 z-40';
  
  const variantClasses = {
    default: 'bg-background-primary border-b border-primary-100',
    transparent: 'bg-transparent',
    elevated: 'bg-white shadow-soft-lg',
  };

  const fixedClasses = fixed ? 'fixed top-0 left-0 right-0' : 'relative';

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Safe area padding for mobile */}
      {fixed && <div className="h-16 md:h-18" />}
      
      <nav className={clsx(
        baseClasses,
        variantClasses[variant],
        fixedClasses,
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            
            {/* 로고 영역 */}
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">문</span>
                </div>
                <span className="font-bold text-lg hidden sm:block">문답다리</span>
              </Link>
            </div>

            {/* 데스크톱 네비게이션 */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/home"
                className={clsx(
                  'px-3 py-2 rounded-medium text-sm font-medium transition-colors',
                  isActive('/home')
                    ? 'text-primary-700 bg-primary-100'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                )}
              >
                홈
              </Link>
              
              <Link
                to="/family"
                className={clsx(
                  'px-3 py-2 rounded-medium text-sm font-medium transition-colors',
                  isActive('/family')
                    ? 'text-primary-700 bg-primary-100'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                )}
              >
                가족
              </Link>
              
              <Link
                to="/cards"
                className={clsx(
                  'px-3 py-2 rounded-medium text-sm font-medium transition-colors',
                  isActive('/cards')
                    ? 'text-primary-700 bg-primary-100'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                )}
              >
                추억카드
              </Link>
            </div>

            {/* 우측 액션 영역 */}
            <div className="flex items-center space-x-3">
              
              {/* 알림 아이콘 (데스크톱) */}
              <div className="hidden md:block">
                <BadgeWrapper count={3} size="small">
                  <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5zm0 0V3" />
                    </svg>
                  </button>
                </BadgeWrapper>
              </div>

              {/* 프로필 아바타 */}
              <Avatar
                name="사용자"
                size="sm"
                status="online"
                onClick={() => {/* 프로필 메뉴 열기 */}}
              />

              {/* 모바일 메뉴 버튼 */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                aria-label="메뉴 열기"
              >
                <svg
                  className={clsx('w-5 h-5 transition-transform', isMenuOpen && 'rotate-180')}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 모바일 메뉴 */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-primary-100 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/home"
                  className={clsx(
                    'block px-3 py-2 rounded-medium text-base font-medium transition-colors',
                    isActive('/home')
                      ? 'text-primary-700 bg-primary-100'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  홈
                </Link>
                
                <Link
                  to="/family"
                  className={clsx(
                    'block px-3 py-2 rounded-medium text-base font-medium transition-colors',
                    isActive('/family')
                      ? 'text-primary-700 bg-primary-100'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  가족
                </Link>
                
                <Link
                  to="/cards"
                  className={clsx(
                    'block px-3 py-2 rounded-medium text-base font-medium transition-colors',
                    isActive('/cards')
                      ? 'text-primary-700 bg-primary-100'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  추억카드
                </Link>
                
                {/* 모바일 알림 */}
                <div className="px-3 py-2">
                  <BadgeWrapper count={3} size="small">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5zm0 0V3" />
                      </svg>
                      <span>알림</span>
                    </button>
                  </BadgeWrapper>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;