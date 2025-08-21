/**
 * 카카오톡 웹뷰 관련 유틸리티 함수들
 */

// 카카오톡 웹뷰 감지
export const isKakaoWebView = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('kakaotalk');
};

// 카카오톡 인앱 브라우저 감지
export const isKakaoInAppBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('kakaotalk') && userAgent.includes('webview');
};

// iOS 환경에서 카카오톡 웹뷰 감지
export const isKakaoiOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('kakaotalk') && 
         (userAgent.includes('iphone') || userAgent.includes('ipad'));
};

// Android 환경에서 카카오톡 웹뷰 감지
export const isKakaoAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('kakaotalk') && userAgent.includes('android');
};

// 카카오톡 웹뷰에서 뒤로가기 방지 (필요한 경우)
export const preventKakaoBack = () => {
  if (!isKakaoWebView()) return;
  
  // 히스토리 조작으로 뒤로가기 방지
  history.pushState(null, '', location.href);
  
  const handlePopstate = (event: PopStateEvent) => {
    event.preventDefault();
    history.pushState(null, '', location.href);
  };
  
  window.addEventListener('popstate', handlePopstate);
  
  // cleanup function 반환
  return () => {
    window.removeEventListener('popstate', handlePopstate);
  };
};

// 카카오톡 웹뷰 최적화를 위한 메타 태그 설정
export const setupKakaoWebViewMeta = () => {
  if (typeof document === 'undefined') return;
  
  // 이미 설정된 메타 태그가 있는지 확인
  if (document.querySelector('meta[name="kakao-webview-optimized"]')) {
    return;
  }
  
  const metaTags = [
    // 카카오톡 웹뷰 최적화 표시
    { name: 'kakao-webview-optimized', content: 'true' },
    // 확대/축소 비활성화
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    // 전화번호 자동 링크 방지
    { name: 'format-detection', content: 'telephone=no' },
    // iOS Safari 상태바 스타일
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    // 웹앱 모드
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
  ];
  
  metaTags.forEach(({ name, content }) => {
    // 기존 메타 태그 제거
    const existing = document.querySelector(`meta[name="${name}"]`);
    if (existing) {
      existing.remove();
    }
    
    // 새로운 메타 태그 추가
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.head.appendChild(meta);
  });
};

// 카카오톡 웹뷰에서 복사 방지 해제
export const enableTextSelection = () => {
  if (typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.innerHTML = `
    * {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
    
    .no-select {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
  `;
  document.head.appendChild(style);
};

// 카카오톡 웹뷰에서 키보드 높이 계산
export const getKeyboardHeight = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const initialViewportHeight = window.innerHeight;
  const currentViewportHeight = window.visualViewport?.height || window.innerHeight;
  
  return Math.max(0, initialViewportHeight - currentViewportHeight);
};

// 카카오톡 웹뷰 환경 정보 수집
export const getKakaoWebViewInfo = () => {
  if (typeof window === 'undefined') {
    return {
      isKakaoWebView: false,
      isKakaoInAppBrowser: false,
      isKakaoiOS: false,
      isKakaoAndroid: false,
      userAgent: '',
      viewportWidth: 0,
      viewportHeight: 0,
      devicePixelRatio: 1,
    };
  }
  
  return {
    isKakaoWebView: isKakaoWebView(),
    isKakaoInAppBrowser: isKakaoInAppBrowser(),
    isKakaoiOS: isKakaoiOS(),
    isKakaoAndroid: isKakaoAndroid(),
    userAgent: window.navigator.userAgent,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  };
};

// 카카오톡 웹뷰에서 외부 브라우저로 열기 (필요한 경우)
export const openInExternalBrowser = (url?: string) => {
  if (!isKakaoWebView()) return false;
  
  const targetUrl = url || window.location.href;
  
  // Android KakaoTalk WebView
  if (isKakaoAndroid()) {
    window.location.href = `intent://${targetUrl.replace(/https?:\/\//, '')}#Intent;scheme=http;package=com.android.browser;end`;
    return true;
  }
  
  // iOS KakaoTalk WebView  
  if (isKakaoiOS()) {
    window.location.href = targetUrl;
    return true;
  }
  
  return false;
};

// 개발환경에서 카카오톡 웹뷰 시뮬레이션
export const simulateKakaoWebView = () => {
  if (typeof window === 'undefined' || !import.meta.env.DEV) return;
  
  // User Agent를 카카오톡으로 변경하는 것은 불가능하므로
  // 개발 시에는 console.log로 상태만 확인
  console.log('🔍 카카오톡 웹뷰 시뮬레이션 모드');
  console.log('📱 카카오톡 웹뷰 정보:', getKakaoWebViewInfo());
};