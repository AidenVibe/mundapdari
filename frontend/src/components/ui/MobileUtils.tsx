import { useEffect, useState, useCallback } from 'react';

// 가상 키보드 감지 및 대응
export const useVirtualKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      // iOS Safari의 경우 visualViewport API 사용
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const standardHeight = window.screen.height;
        const heightDifference = standardHeight - currentHeight;
        
        setIsKeyboardOpen(heightDifference > 150); // 150px 이상 차이나면 키보드 열림으로 간주
        setKeyboardHeight(heightDifference);
      } else {
        // Fallback: window height 변화 감지
        const currentHeight = window.innerHeight;
        const initialHeight = document.documentElement.clientHeight;
        const heightDifference = initialHeight - currentHeight;
        
        setIsKeyboardOpen(heightDifference > 150);
        setKeyboardHeight(heightDifference);
      }
    };

    // visualViewport가 지원되는 경우
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    } else {
      // Fallback
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return { isKeyboardOpen, keyboardHeight };
};

// 카카오톡 인앱브라우저 감지
export const useKakaoWebView = () => {
  const [isKakaoWebView, setIsKakaoWebView] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isKakao = userAgent.includes('kakaotalk') || 
                   userAgent.includes('kakao') ||
                   /kakaotalk/i.test(userAgent);
    
    setIsKakaoWebView(isKakao);
    
    // 카카오톡 환경에서 CSS 클래스 추가
    if (isKakao) {
      document.body.classList.add('kakao-webview');
    }
  }, []);

  return isKakaoWebView;
};

// 터치 제스처 지원
export const useTouchGestures = (
  element: React.RefObject<HTMLElement>,
  options: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    threshold?: number;
  }
) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const threshold = options.threshold || 50;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setStartY(touch.clientY);
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!e.changedTouches[0]) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // 수평 스와이프가 더 강한 경우
    if (absX > absY && absX > threshold) {
      if (deltaX > 0) {
        options.onSwipeRight?.();
      } else {
        options.onSwipeLeft?.();
      }
    }
    // 수직 스와이프가 더 강한 경우
    else if (absY > absX && absY > threshold) {
      if (deltaY > 0) {
        options.onSwipeDown?.();
      } else {
        options.onSwipeUp?.();
      }
    }
  }, [startX, startY, threshold, options]);

  useEffect(() => {
    const el = element.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element, handleTouchStart, handleTouchEnd]);
};

// 안전 영역 대응 컨테이너
interface SafeAreaContainerProps {
  children: React.ReactNode;
  className?: string;
  enableKeyboardAdjust?: boolean;
}

export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  className = '',
  enableKeyboardAdjust = false
}) => {
  const { isKeyboardOpen, keyboardHeight } = useVirtualKeyboard();
  const isKakaoWebView = useKakaoWebView();

  const containerStyle = enableKeyboardAdjust && isKeyboardOpen ? {
    height: `calc(100vh - ${keyboardHeight}px)`,
    // 동적 viewport 지원
    height: `calc(100dvh - ${keyboardHeight}px)`
  } : undefined;

  return (
    <div 
      className={`
        ${className}
        pl-safe-left pr-safe-right
        ${isKakaoWebView ? 'kakao-webview-safe' : 'pb-safe-bottom pt-safe-top'}
        ${enableKeyboardAdjust ? 'keyboard-aware' : ''}
      `}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

// 모바일 최적화 버튼
interface MobileButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  hapticFeedback?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  hapticFeedback = true
}) => {
  const handleClick = useCallback(() => {
    // 햅틱 피드백 (지원되는 디바이스에서만)
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // 10ms 진동
    }
    
    onClick();
  }, [onClick, hapticFeedback]);

  const baseClasses = `
    touch-manipulation
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    font-medium rounded-button
  `;

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
    secondary: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 active:bg-neutral-400',
    ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-touch',
    md: 'px-6 py-3 text-base min-h-touch-lg', 
    lg: 'px-8 py-4 text-lg min-h-[60px]'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// 모바일 최적화 입력 필드
interface MobileInputProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  preventZoom?: boolean;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  autoFocus = false,
  preventZoom = true
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      className={`
        w-full px-4 py-3 
        ${preventZoom ? 'text-base' : 'text-sm'} // iOS 확대 방지
        border border-gray-300 rounded-mobile
        focus:border-primary-500 focus:ring-1 focus:ring-primary-500
        transition-colors duration-200
        touch-manipulation
        min-h-input
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        fontSize: preventZoom ? '16px' : undefined // iOS Safari 확대 방지
      }}
    />
  );
};

// 디바이스 정보 감지
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    hasNotch: false,
    screenWidth: 0,
    screenHeight: 0
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.screen.width;
    const height = window.screen.height;

    setDeviceInfo({
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024,
      isDesktop: width > 1024,
      isIOS: /iphone|ipad|ipod/.test(userAgent),
      isAndroid: /android/.test(userAgent),
      isSafari: /safari/.test(userAgent) && !/chrome/.test(userAgent),
      isChrome: /chrome/.test(userAgent),
      hasNotch: width === 375 && height === 812, // iPhone X 계열 감지 (단순화)
      screenWidth: width,
      screenHeight: height
    });
  }, []);

  return deviceInfo;
};