// 모바일 UX 최적화 타이포그래피 시스템
// 60대+ 사용자를 고려한 가독성 중심 설계

export const typography = {
  // 폰트 패밀리
  fontFamily: {
    primary: [
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
    ].join(', '),
    
    secondary: [
      'NanumSquare',
      'Pretendard',
      'sans-serif'
    ].join(', '),

    // 특별한 용도
    display: [
      'NanumSquareOTF',
      'Pretendard',
      'sans-serif'
    ].join(', '),
  },

  // 폰트 크기 - 모바일 최적화 (60대+ 고려)
  fontSize: {
    // Display (큰 제목)
    display: {
      xs: { size: '32px', lineHeight: '40px', weight: '700' },  // 2rem
      sm: { size: '36px', lineHeight: '44px', weight: '700' },  // 2.25rem
      md: { size: '40px', lineHeight: '48px', weight: '700' },  // 2.5rem
      lg: { size: '48px', lineHeight: '56px', weight: '700' },  // 3rem
    },

    // Heading (제목)
    heading: {
      h1: { size: '28px', lineHeight: '36px', weight: '700' },  // 1.75rem
      h2: { size: '24px', lineHeight: '32px', weight: '600' },  // 1.5rem
      h3: { size: '20px', lineHeight: '28px', weight: '600' },  // 1.25rem
      h4: { size: '18px', lineHeight: '26px', weight: '600' },  // 1.125rem
      h5: { size: '16px', lineHeight: '24px', weight: '600' },  // 1rem
      h6: { size: '14px', lineHeight: '22px', weight: '600' },  // 0.875rem
    },

    // Body (본문)
    body: {
      xl: { size: '20px', lineHeight: '30px', weight: '400' },   // 1.25rem
      lg: { size: '18px', lineHeight: '28px', weight: '400' },   // 1.125rem
      md: { size: '16px', lineHeight: '24px', weight: '400' },   // 1rem - 기본
      sm: { size: '14px', lineHeight: '22px', weight: '400' },   // 0.875rem
      xs: { size: '12px', lineHeight: '18px', weight: '400' },   // 0.75rem
    },

    // Label (라벨)
    label: {
      lg: { size: '16px', lineHeight: '24px', weight: '500' },
      md: { size: '14px', lineHeight: '20px', weight: '500' },   // 기본
      sm: { size: '12px', lineHeight: '18px', weight: '500' },
    },

    // Caption (캡션)
    caption: {
      lg: { size: '14px', lineHeight: '20px', weight: '400' },
      md: { size: '12px', lineHeight: '16px', weight: '400' },   // 기본
      sm: { size: '10px', lineHeight: '14px', weight: '400' },
    },

    // Button (버튼)
    button: {
      lg: { size: '18px', lineHeight: '26px', weight: '600' },
      md: { size: '16px', lineHeight: '24px', weight: '600' },   // 기본
      sm: { size: '14px', lineHeight: '20px', weight: '600' },
    },
  },

  // 폰트 가중치
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // 줄 높이
  lineHeight: {
    none: '1',
    tight: '1.2',      // 제목용
    normal: '1.5',     // 기본
    relaxed: '1.6',    // 본문용
    loose: '1.8',      // 긴 글용
  },

  // 글자 간격
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
    wider: '0.02em',
    widest: '0.03em',
  },

  // 텍스트 정렬
  textAlign: {
    left: 'left',
    center: 'center',
    right: 'right',
    justify: 'justify',
  },

  // 모바일 특화 설정
  mobile: {
    // 최소 폰트 크기 (접근성)
    minFontSize: '14px',
    
    // 읽기 편한 줄 길이
    optimalLineLength: '45-75', // characters
    
    // 단락 간격
    paragraphSpacing: '16px',
    
    // 제목과 본문 간격
    headingSpacing: '12px',
  },

  // 접근성 설정
  accessibility: {
    // 고대비 모드
    highContrast: {
      enabled: false,
      ratio: '7:1', // WCAG AAA
    },
    
    // 큰 텍스트 모드
    largeText: {
      scale: 1.2,   // 20% 확대
    },
    
    // 읽기 모드
    readingMode: {
      lineHeight: '1.8',
      letterSpacing: '0.01em',
      fontWeight: '400',
    },
  },
} as const;

// 미리 정의된 텍스트 스타일
export const textStyles = {
  // 페이지 제목
  pageTitle: {
    fontSize: typography.fontSize.heading.h1.size,
    lineHeight: typography.fontSize.heading.h1.lineHeight,
    fontWeight: typography.fontSize.heading.h1.weight,
    letterSpacing: typography.letterSpacing.tight,
    color: 'var(--text-primary)',
  },

  // 섹션 제목
  sectionTitle: {
    fontSize: typography.fontSize.heading.h2.size,
    lineHeight: typography.fontSize.heading.h2.lineHeight,
    fontWeight: typography.fontSize.heading.h2.weight,
    letterSpacing: typography.letterSpacing.normal,
    color: 'var(--text-primary)',
  },

  // 카드 제목
  cardTitle: {
    fontSize: typography.fontSize.heading.h3.size,
    lineHeight: typography.fontSize.heading.h3.lineHeight,
    fontWeight: typography.fontSize.heading.h3.weight,
    color: 'var(--text-primary)',
  },

  // 본문 텍스트
  bodyText: {
    fontSize: typography.fontSize.body.md.size,
    lineHeight: typography.fontSize.body.md.lineHeight,
    fontWeight: typography.fontSize.body.md.weight,
    color: 'var(--text-primary)',
  },

  // 보조 텍스트
  supportText: {
    fontSize: typography.fontSize.body.sm.size,
    lineHeight: typography.fontSize.body.sm.lineHeight,
    fontWeight: typography.fontSize.body.sm.weight,
    color: 'var(--text-secondary)',
  },

  // 캡션
  captionText: {
    fontSize: typography.fontSize.caption.md.size,
    lineHeight: typography.fontSize.caption.md.lineHeight,
    fontWeight: typography.fontSize.caption.md.weight,
    color: 'var(--text-tertiary)',
  },

  // 버튼 텍스트
  buttonText: {
    fontSize: typography.fontSize.button.md.size,
    lineHeight: typography.fontSize.button.md.lineHeight,
    fontWeight: typography.fontSize.button.md.weight,
    letterSpacing: typography.letterSpacing.wide,
  },

  // 라벨 텍스트
  labelText: {
    fontSize: typography.fontSize.label.md.size,
    lineHeight: typography.fontSize.label.md.lineHeight,
    fontWeight: typography.fontSize.label.md.weight,
    color: 'var(--text-primary)',
  },

  // 에러 텍스트
  errorText: {
    fontSize: typography.fontSize.body.sm.size,
    lineHeight: typography.fontSize.body.sm.lineHeight,
    fontWeight: typography.fontSize.body.sm.weight,
    color: 'var(--error-500)',
  },

  // 성공 텍스트
  successText: {
    fontSize: typography.fontSize.body.sm.size,
    lineHeight: typography.fontSize.body.sm.lineHeight,
    fontWeight: typography.fontSize.body.sm.weight,
    color: 'var(--success-500)',
  },
} as const;

export type FontSize = keyof typeof typography.fontSize.body;
export type FontWeight = keyof typeof typography.fontWeight;
export type LineHeight = keyof typeof typography.lineHeight;
export type TextStyle = keyof typeof textStyles;