import React from 'react';
import { clsx } from 'clsx';
import { Link, useLocation } from 'react-router-dom';

interface FooterProps {
  variant?: 'default' | 'minimal' | 'extended';
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  variant = 'default',
  className,
}) => {
  const currentYear = new Date().getFullYear();

  const baseClasses = 'w-full bg-background-warm border-t border-primary-100';

  const variantContent = {
    minimal: (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            © {currentYear} 문답다리. 모든 권리 보유.
          </p>
        </div>
      </div>
    ),

    default: (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* 브랜드 섹션 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">문</span>
              </div>
              <span className="font-bold text-lg text-primary-600">문답다리</span>
            </div>
            <p className="text-gray-600 text-sm mb-4 max-w-sm">
              가족 간의 소통을 돕는 일일 질문 서비스입니다. 
              매일 하나의 질문으로 가족과 더 가까워지세요.
            </p>
            
            {/* 소셜 링크 */}
            <div className="flex space-x-3">
              <a
                href="#"
                className="p-2 text-gray-500 hover:text-primary-600 bg-white rounded-lg hover:bg-primary-50 transition-colors"
                aria-label="카카오톡"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3C6.48 3 2 6.48 2 11c0 2.76 1.34 5.2 3.44 6.73L4.5 21l3.77-1.5C9.42 19.83 10.68 20 12 20c5.52 0 10-3.48 10-8s-4.48-8-10-8z"/>
                </svg>
              </a>
              <a
                href="#"
                className="p-2 text-gray-500 hover:text-primary-600 bg-white rounded-lg hover:bg-primary-50 transition-colors"
                aria-label="페이스북"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="p-2 text-gray-500 hover:text-primary-600 bg-white rounded-lg hover:bg-primary-50 transition-colors"
                aria-label="인스타그램"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.197-2.25-1.197-3.654 0-1.404.449-2.706 1.197-3.654.749-.948 1.9-1.559 3.197-1.559 1.297 0 2.448.611 3.197 1.559.748.948 1.197 2.25 1.197 3.654 0 1.404-.449 2.706-1.197 3.654-.749.948-1.9 1.559-3.197 1.559z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/home" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <Link to="/family" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  가족 관리
                </Link>
              </li>
              <li>
                <Link to="/cards" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  추억 카드
                </Link>
              </li>
              <li>
                <Link to="/questions" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  질문 모음
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 링크 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">지원</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  도움말
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  문의하기
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  서비스 약관
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="border-t border-primary-100 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © {currentYear} 문답다리. 모든 권리 보유.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                개인정보처리방침
              </Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                서비스 약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    ),

    extended: (
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 상단 CTA 섹션 */}
        <div className="text-center mb-12 p-8 bg-gradient-primary rounded-2xl text-white">
          <h3 className="text-2xl font-bold mb-4">
            아직 문답다리를 시작하지 않으셨나요?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            가족과의 소중한 대화를 시작해보세요
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-medium rounded-full hover:bg-gray-50 transition-colors"
          >
            지금 시작하기
          </Link>
        </div>

        {/* 기본 푸터 내용 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 섹션 - 위와 동일 */}
        </div>

        {/* 하단 저작권 - 위와 동일 */}
      </div>
    ),
  };

  return (
    <footer className={clsx(baseClasses, className)}>
      {variantContent[variant]}
    </footer>
  );
};

// 모바일 하단 네비게이션 (별도 컴포넌트)
interface BottomNavigationProps {
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  className,
}) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/home', icon: '🏠', label: '홈' },
    { path: '/family', icon: '👨‍👩‍👧‍👦', label: '가족' },
    { path: '/cards', icon: '📇', label: '추억' },
    { path: '/profile', icon: '👤', label: '프로필' },
  ];

  return (
    <nav className={clsx(
      'fixed bottom-0 left-0 right-0 bg-white border-t border-primary-100 z-40 md:hidden',
      'pb-safe-bottom',
      className
    )}>
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon, label }) => (
          <Link
            key={path}
            to={path}
            className={clsx(
              'flex flex-col items-center justify-center p-2 min-w-touch transition-colors',
              isActive(path)
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-primary-600'
            )}
          >
            <span className="text-xl mb-1">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Footer;