// 클래스명 조합 유틸리티
export { clsx } from 'clsx';

// 날짜 포맷팅 유틸리티
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD') => {
  const dayjs = require('dayjs');
  return dayjs(date).format(format);
};

// 로컬 스토리지 유틸리티
export const localStorage = {
  get: <T = any>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue || null;
      return JSON.parse(item);
    } catch {
      return defaultValue || null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('localStorage.set error:', error);
    }
  },

  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage.remove error:', error);
    }
  },

  clear: (): void => {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('localStorage.clear error:', error);
    }
  },
};

// 디바운스 유틸리티
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// 입력값 검증 유틸리티
export const validation = {
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isEmpty: (value: string | null | undefined): boolean => {
    return !value || value.trim().length === 0;
  },

  minLength: (value: string, min: number): boolean => {
    return value.trim().length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.trim().length <= max;
  },

  isKorean: (value: string): boolean => {
    const koreanRegex = /^[가-힣\s]+$/;
    return koreanRegex.test(value);
  },

  hasWhitespace: (value: string): boolean => {
    return /\s/.test(value);
  },
};

// 텍스트 truncate 유틸리티
export const truncateText = (text: string, length: number = 100): string => {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
};

// 카카오톡 웹뷰 감지 유틸리티
export const detectKakaoWebView = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('kakaotalk');
};

// 모바일 감지 유틸리티
export const detectMobile = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
};

// 안전한 JSON 파싱 유틸리티
export const safeJsonParse = <T = any>(jsonString: string, defaultValue?: T): T | null => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue || null;
  }
};

// 에러 메시지 정규화 유틸리티
export const normalizeErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.data?.message) return error.data.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return '알 수 없는 오류가 발생했습니다.';
};