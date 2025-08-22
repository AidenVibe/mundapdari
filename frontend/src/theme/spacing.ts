// 모바일 UX 최적화 간격 시스템
// 터치 친화적 크기와 간격 정의

// 기본 간격 (8px 기반 시스템)
export const spacing = {
  // 기본 간격
  none: '0',
  xs: '4px',      // 0.5 * 8px
  sm: '8px',      // 1 * 8px  
  md: '16px',     // 2 * 8px
  lg: '24px',     // 3 * 8px
  xl: '32px',     // 4 * 8px
  '2xl': '48px',  // 6 * 8px
  '3xl': '64px',  // 8 * 8px
  '4xl': '80px',  // 10 * 8px
  '5xl': '120px', // 15 * 8px

  // 모바일 특화 간격
  mobile: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '40px',
  },

  // 컴포넌트별 간격
  component: {
    padding: {
      xs: '8px',      // 작은 요소
      sm: '12px',     // 버튼, 칩
      md: '16px',     // 카드, 입력 필드
      lg: '20px',     // 큰 카드
      xl: '24px',     // 섹션
    },
    margin: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    gap: {
      xs: '4px',      // 아이콘과 텍스트
      sm: '8px',      // 작은 요소들
      md: '12px',     // 일반적인 요소들
      lg: '16px',     // 카드들 사이
      xl: '24px',     // 섹션들 사이
    },
  },

  // Safe Area (모바일 노치 대응)
  safe: {
    top: 'env(safe-area-inset-top)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
    right: 'env(safe-area-inset-right)',
  },
} as const;

// 터치 타겟 크기 (접근성 기준)
export const touchTargets = {
  // 최소 터치 타겟 크기 (44px - Apple 가이드라인)
  min: '44px',
  
  // 권장 터치 타겟 크기
  small: '44px',      // 작은 버튼, 아이콘
  medium: '48px',     // 일반 버튼
  large: '56px',      // 주요 버튼, FAB
  xl: '64px',         // 매우 중요한 버튼

  // 입력 필드 높이
  input: {
    small: '40px',
    medium: '48px',     // 기본
    large: '56px',      // 큰 입력 필드
  },
} as const;

// 컨테이너 크기
export const containers = {
  // 최대 너비
  maxWidth: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  },

  // 모바일 최적화 컨테이너
  mobile: {
    padding: '16px',    // 좌우 패딩
    maxWidth: '100%',   // 전체 너비 사용
  },

  // 콘텐츠 컨테이너
  content: {
    padding: '20px',
    maxWidth: '768px',  // 읽기 편한 너비
  },
} as const;

// 레이아웃 간격
export const layout = {
  // 헤더/푸터
  header: {
    height: '60px',     // 모바일 헤더
    padding: '12px 16px',
  },
  
  footer: {
    height: 'auto',
    padding: '24px 16px',
  },

  // 네비게이션
  navigation: {
    height: '64px',     // 하단 탭 네비게이션
    padding: '8px 0',
  },

  // 섹션 간격
  section: {
    padding: '32px 0',  // 모바일 섹션 간격
    gap: '24px',        // 섹션 내 요소 간격
  },

  // 그리드
  grid: {
    gap: {
      xs: '8px',
      sm: '12px',
      md: '16px',
      lg: '24px',
    },
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
    },
  },
} as const;

export type SpacingSize = keyof typeof spacing;
export type TouchTargetSize = keyof typeof touchTargets;
export type ContainerSize = keyof typeof containers.maxWidth;