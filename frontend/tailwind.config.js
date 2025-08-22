/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
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
        // Light Green Pastel - Success
        success: {
          50: '#f7fef9',  // Almost white green
          100: '#edf9f0', // Lightest green
          200: '#d3f4db', // Very light green
          300: '#b3e8c2', // Light green (main)
          400: '#8fd9a1', // Soft green
          500: '#66c176', // Medium green
          600: '#4fa55f', // Darker green
          700: '#3d8a4a', // Deep green
          800: '#2d6635', // Very deep green
          900: '#1f4a24', // Darkest green
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
        // Neutral Grays (warm toned)
        gray: {
          50: '#faf9f8',   // Warm white
          100: '#f5f4f2',  // Very light warm gray
          200: '#ebe8e4',  // Light warm gray
          300: '#d6d1cb',  // Medium-light warm gray
          400: '#b8b0a6',  // Medium warm gray
          500: '#9a8f82',  // Medium warm gray
          600: '#7d725f',  // Medium-dark warm gray
          700: '#615740',  // Dark warm gray
          800: '#454129',  // Very dark warm gray
          900: '#2d2b1a',  // Darkest warm gray
        },
        // Background Colors
        background: {
          primary: '#f0fffe',    // Light mint background
          secondary: '#ffffff',   // Pure white
          warm: '#fff9f7',       // Warm peachy background
          cool: '#faf7ff',       // Cool lavender background
          soft: '#fff8f2',       // Soft cream background
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
      },
      // 모바일 터치 타겟 최적화
      minHeight: {
        'touch': '44px',      // 최소 터치 타겟
        'touch-lg': '56px',   // 큰 터치 타겟
        'button': '48px',     // 기본 버튼 높이
        'input': '52px',      // 입력 필드 높이
      },
      minWidth: {
        'touch': '44px',      // 최소 터치 타겟
        'touch-lg': '56px',   // 큰 터치 타겟
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
      // 모바일 최적화 그라데이션 (로고 기반 따뜻한 색상)
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #E8A158 0%, #E17B7B 100%)',      // 오렌지 → 코랄 (로고 기반)
        'gradient-secondary': 'linear-gradient(135deg, #f7b877 0%, #f7b0ab 100%)',     // 부드러운 오렌지 → 코랄
        'gradient-warm': 'linear-gradient(135deg, #fef9f3 0%, #fef9f8 100%)',         // 따뜻한 배경
        'gradient-cool': 'linear-gradient(135deg, #fff8f2 0%, #faf7ff 100%)',         // 시원한 배경
        'gradient-success': 'linear-gradient(135deg, #b3e8c2 0%, #8fd9a1 100%)',      // 성공 (그린 유지)
        'gradient-error': 'linear-gradient(135deg, #ffb8b8 0%, #ff9999 100%)',        // 오류 (레드 유지)
      },
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
      }
    },
  },
  plugins: [],
}