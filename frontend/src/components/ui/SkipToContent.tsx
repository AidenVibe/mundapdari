import React from 'react';

/**
 * 스크린 리더 사용자를 위한 콘텐츠 건너뛰기 링크
 * 접근성 개선을 위한 필수 컴포넌트
 */
const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50 focus:z-50"
      tabIndex={1}
    >
      본문으로 이동
    </a>
  );
};

export default SkipToContent;