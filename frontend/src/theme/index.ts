// 통합 테마 시스템
// 모바일 UX 최적화 문답다리 디자인 시스템

export { colors, familyColors, emotionColors, gradients } from './colors';
export { spacing, touchTargets, containers, layout } from './spacing';
export { typography, textStyles } from './typography';

import { colors, familyColors, emotionColors, gradients } from './colors';
import { spacing, touchTargets, containers, layout } from './spacing';
import { typography, textStyles } from './typography';

// 통합 테마 객체
export const theme = {
  colors,
  familyColors,
  emotionColors,
  gradients,
  spacing,
  touchTargets,
  containers,
  layout,
  typography,
  textStyles,

  // 모바일 UX 특화 설정
  mobile: {
    // 뷰포트 설정
    viewport: {
      initialScale: 1,
      maximumScale: 5,
      minimumScale: 1,
      userScalable: true,
      width: 'device-width',
    },

    // 터치 최적화
    touch: {
      minTargetSize: touchTargets.min,
      tapHighlightColor: 'transparent',
      touchAction: 'manipulation',
      userSelect: 'none',
    },

    // 스크롤 최적화
    scroll: {
      behavior: 'smooth',
      overscrollBehavior: 'none',
      webkitOverflowScrolling: 'touch',
    },

    // 성능 최적화
    performance: {
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      perspective: 1000,
    },

    // 애니메이션 설정
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },

  // 접근성 설정
  accessibility: {
    // 색상 대비
    contrast: {
      aa: 4.5,      // WCAG AA 기준
      aaa: 7,       // WCAG AAA 기준
    },

    // 포커스 설정
    focus: {
      outline: `2px solid ${colors.primary[500]}`,
      outlineOffset: '2px',
      borderRadius: '4px',
    },

    // 터치 타겟
    touchTarget: {
      minSize: touchTargets.min,
      spacing: spacing.sm,
    },

    // 텍스트 설정
    text: {
      minSize: typography.mobile.minFontSize,
      lineHeight: typography.lineHeight.normal,
      maxLineLength: 75, // characters
    },

    // 모션 설정
    motion: {
      reducedMotion: false,
      duration: 'normal',
    },
  },

  // 다크 모드 설정 (준비)
  darkMode: {
    enabled: false,
    colors: {
      // 추후 다크 모드 색상 정의
    },
  },

  // 브레이크포인트
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // 그림자 시스템
  shadows: {
    soft: '0 2px 8px rgba(0, 0, 0, 0.04)',
    'soft-lg': '0 4px 12px rgba(0, 0, 0, 0.06)',
    'soft-xl': '0 8px 20px rgba(0, 0, 0, 0.08)',
    warm: '0 4px 12px rgba(255, 138, 101, 0.15)',
    cool: '0 4px 12px rgba(168, 237, 231, 0.15)',
    mobile: '0 2px 12px rgba(0, 0, 0, 0.08)',
  },

  // Border Radius 시스템
  borderRadius: {
    soft: '8px',
    medium: '12px',
    large: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    mobile: '12px',  // 모바일 기본
    card: '16px',    // 카드 기본
    button: '24px',  // 버튼 기본 (pill 형태)
    full: '9999px',  // 완전 둥근 형태
  },

  // Z-Index 시스템
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// CSS 변수 생성 헬퍼
export const createCSSVariables = () => {
  const cssVars: Record<string, string> = {};

  // 색상 변수
  Object.entries(colors).forEach(([colorName, colorShades]) => {
    if (typeof colorShades === 'object') {
      Object.entries(colorShades).forEach(([shade, value]) => {
        cssVars[`--${colorName}-${shade}`] = value;
      });
    } else {
      cssVars[`--${colorName}`] = colorShades;
    }
  });

  // 간격 변수
  Object.entries(spacing).forEach(([key, value]) => {
    if (typeof value === 'string') {
      cssVars[`--spacing-${key}`] = value;
    }
  });

  // 폰트 변수
  cssVars['--font-family-primary'] = typography.fontFamily.primary;
  cssVars['--font-family-secondary'] = typography.fontFamily.secondary;

  return cssVars;
};

// 미디어 쿼리 헬퍼
export const media = {
  xs: `@media (min-width: ${theme.breakpoints.xs})`,
  sm: `@media (min-width: ${theme.breakpoints.sm})`,
  md: `@media (min-width: ${theme.breakpoints.md})`,
  lg: `@media (min-width: ${theme.breakpoints.lg})`,
  xl: `@media (min-width: ${theme.breakpoints.xl})`,
  '2xl': `@media (min-width: ${theme.breakpoints['2xl']})`,
  
  // 특별한 미디어 쿼리
  mobile: '@media (max-width: 767px)',
  tablet: '@media (min-width: 768px) and (max-width: 1023px)',
  desktop: '@media (min-width: 1024px)',
  
  // 터치 기기
  touch: '@media (hover: none) and (pointer: coarse)',
  mouse: '@media (hover: hover) and (pointer: fine)',
  
  // 다크 모드
  dark: '@media (prefers-color-scheme: dark)',
  light: '@media (prefers-color-scheme: light)',
  
  // 모션 감소
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  
  // 고대비
  highContrast: '@media (prefers-contrast: high)',
} as const;

export default theme;