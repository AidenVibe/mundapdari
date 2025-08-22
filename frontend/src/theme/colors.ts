// 모바일 UX 최적화 색상 시스템
// Light Pastel 팔레트 - 따뜻하고 부드러운 톤

export const colors = {
  // Warm Orange Pastel - Primary (따뜻한 오렌지 - 로고 기반)
  primary: {
    50: '#fef9f3',   // Almost white warm orange
    100: '#fef2e6',  // Lightest warm orange
    200: '#fde2c7',  // Very light warm orange
    300: '#fbcfa3',  // Light warm orange
    400: '#f7b877',  // Soft warm orange
    500: '#E8A158',  // Medium warm orange (로고 메인 색상)
    600: '#d18a47',  // Darker warm orange
    700: '#b7743a',  // Deep warm orange
    800: '#9d5f2e',  // Very deep warm orange
    900: '#834a22',  // Darkest warm orange
  },

  // Warm Coral Pastel - Secondary (따뜻한 코랄 - 로고 기반)
  secondary: {
    50: '#fef9f8',   // Almost white coral
    100: '#fef2f1',  // Lightest coral
    200: '#fde0dd',  // Very light coral
    300: '#fbcbc7',  // Light coral
    400: '#f7b0ab',  // Soft coral
    500: '#E17B7B',  // Medium coral (로고 메인 색상)
    600: '#d16565',  // Darker coral
    700: '#b75555',  // Deep coral
    800: '#9d4545',  // Very deep coral
    900: '#833636',  // Darkest coral
  },

  // Light Amber Pastel - Accent (강조 색상)
  accent: {
    50: '#fffef7',   // Almost white amber
    100: '#fff8e1',  // Lightest amber
    200: '#ffecb3',  // Very light amber
    300: '#ffe082',  // Light amber (main) - 주요 사용
    400: '#ffd54f',  // Soft amber
    500: '#ffc107',  // Medium amber
    600: '#ffb300',  // Darker amber
    700: '#ff9800',  // Deep amber
    800: '#f57c00',  // Very deep amber
    900: '#e65100',  // Darkest amber
  },

  // Light Pink Pastel - Family Love
  pink: {
    50: '#fff7fb',   // Almost white pink
    100: '#ffebf5',  // Lightest pink
    200: '#ffd6e8',  // Very light pink
    300: '#ffb8d9',  // Light pink (main) - 가족 사랑 표현
    400: '#ff91c3',  // Soft pink
    500: '#ff6ba9',  // Medium pink
    600: '#f5408a',  // Darker pink
    700: '#e91e63',  // Deep pink
    800: '#c2185b',  // Very deep pink
    900: '#880e4f',  // Darkest pink
  },

  // Light Lavender Pastel - Wisdom/Calm
  lavender: {
    50: '#faf7ff',   // Almost white lavender
    100: '#f3ebff',  // Lightest lavender
    200: '#e4d4ff',  // Very light lavender
    300: '#d4b8ff',  // Light lavender (main) - 지혜/평온 표현
    400: '#c199ff',  // Soft lavender
    500: '#a875ff',  // Medium lavender
    600: '#9254de',  // Darker lavender
    700: '#7c3aed',  // Deep lavender
    800: '#6b21d4',  // Very deep lavender
    900: '#4c1d95',  // Darkest lavender
  },

  // Semantic Colors (의미 있는 색상)
  success: {
    50: '#f7fef9',   // Almost white green
    100: '#edf9f0',  // Lightest green
    200: '#d3f4db',  // Very light green
    300: '#b3e8c2',  // Light green (main) - 성공 표현
    400: '#8fd9a1',  // Soft green
    500: '#66c176',  // Medium green
    600: '#4fa55f',  // Darker green
    700: '#3d8a4a',  // Deep green
    800: '#2d6635',  // Very deep green
    900: '#1f4a24',  // Darkest green
  },

  warning: {
    50: '#fffcf7',   // Almost white orange
    100: '#fff4e6',  // Lightest orange
    200: '#ffe4c4',  // Very light orange
    300: '#ffd09f',  // Light orange (main) - 경고 표현
    400: '#ffba75',  // Soft orange
    500: '#ff9f47',  // Medium orange
    600: '#f57c00',  // Darker orange
    700: '#e65100',  // Deep orange
    800: '#bf360c',  // Very deep orange
    900: '#8d2600',  // Darkest orange
  },

  error: {
    50: '#fff7f7',   // Almost white rose
    100: '#ffebeb',  // Lightest rose
    200: '#ffd6d6',  // Very light rose
    300: '#ffb8b8',  // Light rose (main) - 오류 표현
    400: '#ff9999',  // Soft rose
    500: '#ff7575',  // Medium rose
    600: '#e53e3e',  // Darker rose
    700: '#c53030',  // Deep rose
    800: '#9b2c2c',  // Very deep rose
    900: '#742a2a',  // Darkest rose
  },

  // Neutral Colors (중성 색상) - 따뜻한 톤
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

  // Background Colors (배경 색상)
  background: {
    primary: '#f0fffe',    // Light mint background
    secondary: '#ffffff',   // Pure white
    warm: '#fff9f7',       // Warm peachy background
    cool: '#faf7ff',       // Cool lavender background
    soft: '#fff8f2',       // Soft cream background
  },

  // Text Colors (텍스트 색상)
  text: {
    primary: '#2d2b1a',     // Darkest warm gray - 주 텍스트
    secondary: '#615740',   // Dark warm gray - 보조 텍스트
    tertiary: '#9a8f82',    // Medium warm gray - 설명 텍스트
    disabled: '#b8b0a6',    // Light warm gray - 비활성 텍스트
    inverse: '#ffffff',     // 역전 텍스트 (어두운 배경용)
  },
} as const;

// 가족 관계별 특화 색상
export const familyColors = {
  parent: '#ffbfa6',      // Light coral - 부모
  child: '#ffe082',       // Light amber - 자녀
  spouse: '#ffb8d9',      // Light pink - 배우자
  sibling: '#d4b8ff',     // Light lavender - 형제자매
  grandparent: '#b3e8c2', // Light green - 조부모
} as const;

// 감정 표현 색상
export const emotionColors = {
  happy: '#ffe082',       // Light amber - 기쁨
  love: '#ffb8d9',        // Light pink - 사랑
  excited: '#ffbfa6',     // Light coral - 흥미
  calm: '#d4b8ff',        // Light lavender - 평온
  grateful: '#b3e8c2',    // Light green - 감사
  neutral: '#ebe8e4',     // Light warm gray - 중립
} as const;

// 그라데이션 정의 (로고 기반 따뜻한 색상)
export const gradients = {
  primary: 'linear-gradient(135deg, #E8A158 0%, #E17B7B 100%)',      // 오렌지 → 코랄 (로고 기반)
  secondary: 'linear-gradient(135deg, #f7b877 0%, #f7b0ab 100%)',     // 부드러운 오렌지 → 코랄
  warm: 'linear-gradient(135deg, #fef9f3 0%, #fef9f8 100%)',         // 따뜻한 배경
  cool: 'linear-gradient(135deg, #fff8f2 0%, #faf7ff 100%)',         // 시원한 배경  
  success: 'linear-gradient(135deg, #b3e8c2 0%, #8fd9a1 100%)',      // 성공 (그린 유지)
  error: 'linear-gradient(135deg, #ffb8b8 0%, #ff9999 100%)',        // 오류 (레드 유지)
} as const;

export type ColorName = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
export type FamilyColor = keyof typeof familyColors;
export type EmotionColor = keyof typeof emotionColors;
export type GradientName = keyof typeof gradients;