/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // 모바일 우선 브레이크포인트 재정의
    screens: {
      'xs': '320px',    // iPhone SE, 구형 Android
      'sm': '375px',    // iPhone 6/7/8, iPhone X
      'md': '414px',    // iPhone Plus, 큰 Android
      'lg': '768px',    // Tablet
      'xl': '1024px',   // Desktop
      '2xl': '1280px',  // Large Desktop
      // 세부 모바일 타겟팅
      'mobile-s': '320px',
      'mobile-m': '375px', 
      'mobile-l': '414px',
      'tablet': '768px',
    },
    extend: {
      colors: {
        // Warm Orange Pastel - Primary (로고 기반)
        primary: {
          50: '#fef9f3',  // Almost white warm orange
          100: '#fef2e6', // Lightest warm orange
          200: '#fde2c7', // Very light warm orange
          300: '#fbcfa3', // Light warm orange
          400: '#f7b877', // Soft warm orange
          500: '#E8A158', // Medium warm orange (로고 메인 색상)
          600: '#d18a47', // Darker warm orange
          700: '#b7743a', // Deep warm orange
          800: '#9d5f2e', // Very deep warm orange
          900: '#834a22', // Darkest warm orange
        },
        // Warm Coral Pastel - Secondary (로고 기반)
        secondary: {
          50: '#fef9f8',  // Almost white coral
          100: '#fef2f1', // Lightest coral
          200: '#fde0dd', // Very light coral
          300: '#fbcbc7', // Light coral
          400: '#f7b0ab', // Soft coral
          500: '#E17B7B', // Medium coral (로고 메인 색상)
          600: '#d16565', // Darker coral
          700: '#b75555', // Deep coral
          800: '#9d4545', // Very deep coral
          900: '#833636', // Darkest coral
        },
        // Light Amber Pastel - Accent
        accent: {
          50: '#fffef7',  // Almost white amber
          100: '#fff8e1', // Lightest amber
          200: '#ffecb3', // Very light amber
          300: '#ffe082', // Light amber (main)
          400: '#ffd54f', // Soft amber
          500: '#ffc107', // Medium amber
          600: '#ffb300', // Darker amber
          700: '#ff9800', // Deep amber
          800: '#f57c00', // Very deep amber
          900: '#e65100', // Darkest amber
        },
        // Light Pink Pastel - For love/family
        pink: {
          50: '#fff7fb',  // Almost white pink
          100: '#ffebf5', // Lightest pink
          200: '#ffd6e8', // Very light pink
          300: '#ffb8d9', // Light pink (main)
          400: '#ff91c3', // Soft pink
          500: '#ff6ba9', // Medium pink
          600: '#f5408a', // Darker pink
          700: '#e91e63', // Deep pink
          800: '#c2185b', // Very deep pink
          900: '#880e4f', // Darkest pink
        },
        // Light Lavender Pastel - For calm/wisdom
        lavender: {
          50: '#faf7ff',  // Almost white lavender
          100: '#f3ebff', // Lightest lavender
          200: '#e4d4ff', // Very light lavender
          300: '#d4b8ff', // Light lavender (main)
          400: '#c199ff', // Soft lavender
          500: '#a875ff', // Medium lavender
          600: '#9254de', // Darker lavender
          700: '#7c3aed', // Deep lavender
          800: '#6b21d4', // Very deep lavender
          900: '#4c1d95', // Darkest lavender
        },
        // Espresso Brown - Primary & Success (전문적인 밤색 테마)
        success: {
          50: '#faf9f8',  // Cream Whisper - 매우 연한 크림
          100: '#f5f2ef', // Warm Ivory - 따뜻한 아이보리
          200: '#e8ddd5', // Soft Beige - 부드러운 베이지
          300: '#d4c2b0', // Sandy Tan - 모래 탠
          400: '#b8956f', // Caramel Gold - 캐러멜 골드
          500: '#60300D', // Espresso Brown - 에스프레소 브라운 (메인 브랜드)
          600: '#4d2409', // Dark Chocolate - 다크 초콜릿
          700: '#3d1c07', // Coffee Bean - 커피빈
          800: '#2f1505', // Burnt Umber - 번트 엄버
          900: '#1f0e03', // Midnight Brown - 미드나이트 브라운
        },
        // Light Orange Pastel - Warning
        warning: {
          50: '#fffcf7',  // Almost white orange
          100: '#fff4e6', // Lightest orange
          200: '#ffe4c4', // Very light orange
          300: '#ffd09f', // Light orange (main)
          400: '#ffba75', // Soft orange
          500: '#ff9f47', // Medium orange
          600: '#f57c00', // Darker orange
          700: '#e65100', // Deep orange
          800: '#bf360c', // Very deep orange
          900: '#8d2600', // Darkest orange
        },
        // Light Rose Pastel - Error
        error: {
          50: '#fff7f7',  // Almost white rose
          100: '#ffebeb', // Lightest rose
          200: '#ffd6d6', // Very light rose
          300: '#ffb8b8', // Light rose (main)
          400: '#ff9999', // Soft rose
          500: '#ff7575', // Medium rose
          600: '#e53e3e', // Darker rose
          700: '#c53030', // Deep rose
          800: '#9b2c2c', // Very deep rose
          900: '#742a2a', // Darkest rose
        },
        // Neutral Colors (새로운 secondary 버튼용)
        neutral: {
          50: '#fafafa',   // Pure white
          100: '#f5f5f5',  // Very light gray
          200: '#e5e5e5',  // Light gray
          300: '#d4d4d4',  // Medium-light gray
          400: '#a3a3a3',  // Medium gray
          500: '#8B8680',  // 새로운 secondary 버튼 색상 (브라운 그레이)
          600: '#737373',  // Medium-dark gray
          700: '#525252',  // Dark gray
          800: '#404040',  // Very dark gray
          900: '#262626',  // Darkest gray
        },
        // Text Colors (가독성 개선)
        text: {
          light: '#FFFFFF',     // 어두운 배경용 밝은 텍스트
          dark: '#4A4238',      // 밝은 배경용 어두운 텍스트 (충분한 대비)
          medium: '#6B5B4F',    // 중간 톤 텍스트
        },
        // Background Colors (플랫 컬러 - 그라데이션 제거)
        background: {
          primary: '#E9A885',    // 어두운 베이지 (2-3단계 어둡게)
          secondary: '#F5F0EA',   // 텍스트 대비용 밝은 크림
          warm: '#F0E5D8',       // 따뜻한 베이지
          cool: '#F2EDE8',       // 쿨한 베이지
          soft: '#F8F3EE',       // 부드러운 크림
          textBox: 'rgba(255, 255, 255, 0.9)', // 텍스트 가독성용 반투명 박스
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'sans-serif'
        ],
      },
      fontSize: {
        // 모바일 최적화 폰트 크기 (60대+ 사용자 고려)
        'title': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700' }],    // 36px
        'subtitle': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }], // 28px
        'heading': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],      // 24px
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }], // 18px
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],         // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.375rem', fontWeight: '400' }], // 14px
        'caption': ['0.75rem', { lineHeight: '1.125rem', fontWeight: '400' }],  // 12px
      },
      spacing: {
        // 모바일 터치 최적화 간격
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '88': '22rem',    // 352px
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        // 가상 키보드 대응
        'keyboard': 'env(keyboard-inset-height, 0px)',
        // 카카오톡 인앱브라우저 특수 간격
        'kakao-nav': '60px', // 카카오톡 하단 네비게이션
        'kakao-header': '44px', // 카카오톡 상단 헤더
      },
      // 모바일 터치 타겟 최적화
      minHeight: {
        'touch': '44px',      // 최소 터치 타겟
        'touch-lg': '56px',   // 큰 터치 타겟
        'button': '48px',     // 기본 버튼 높이
        'input': '52px',      // 입력 필드 높이
        'screen': '100vh',    // 전체 화면 높이
        'screen-dynamic': '100dvh', // 동적 화면 높이
        'screen-small': '100svh',   // 작은 화면 높이
        'kakao-content': 'calc(100vh - 104px)', // 카카오톡 헤더/네비 제외
      },
      minWidth: {
        'touch': '44px',      // 최소 터치 타겟
        'touch-lg': '56px',   // 큰 터치 타겟
        'mobile': '320px',    // 최소 모바일 너비
      },
      maxHeight: {
        'keyboard-aware': 'calc(100vh - env(keyboard-inset-height, 0px))',
        'keyboard-aware-dynamic': 'calc(100dvh - env(keyboard-inset-height, 0px))',
      },
      // 모바일 최적화 애니메이션
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' }
        }
      },
      // 플랫 컬러 (그라데이션 완전 제거)
      // 그라데이션 대신 단일 배경색 사용
      // 모바일 친화적 그림자
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'soft-xl': '0 8px 20px rgba(0, 0, 0, 0.08)',
        'warm': '0 4px 12px rgba(255, 138, 101, 0.15)',
        'cool': '0 4px 12px rgba(168, 237, 231, 0.15)',
        'mobile': '0 2px 12px rgba(0, 0, 0, 0.08)',
      },
      // 모바일 최적화 border radius
      borderRadius: {
        'soft': '8px',
        'medium': '12px',
        'large': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'mobile': '12px',  // 모바일 기본
        'card': '16px',    // 카드 기본
        'button': '24px',  // 버튼 기본 (pill 형태)
      },
      // 모바일 터치 최적화 유틸리티
      extend: {
        transitionProperty: {
          'height': 'height',
          'spacing': 'margin, padding',
        },
      },
      // 커스텀 유틸리티
      screens: {
        // 세부 디바이스 타겟팅
        'iphone-se': {'raw': '(max-width: 375px) and (max-height: 667px)'},
        'iphone-x': {'raw': '(max-width: 375px) and (max-height: 812px)'},
        'iphone-plus': {'raw': '(max-width: 414px) and (max-height: 736px)'},
        'android-small': {'raw': '(max-width: 360px)'},
        'android-large': {'raw': '(min-width: 400px) and (max-width: 480px)'},
        // 가로/세로 모드
        'portrait': {'raw': '(orientation: portrait)'},
        'landscape': {'raw': '(orientation: landscape)'},
        // 터치 디바이스 감지
        'touch': {'raw': '(hover: none) and (pointer: coarse)'},
        'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
        // 다크모드 지원 준비
        'dark': {'raw': '(prefers-color-scheme: dark)'},
        'light': {'raw': '(prefers-color-scheme: light)'},
        // 접근성 설정
        'reduce-motion': {'raw': '(prefers-reduced-motion: reduce)'},
        'high-contrast': {'raw': '(prefers-contrast: high)'},
      }
    },
  },
  plugins: [],
}