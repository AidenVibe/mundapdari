import { useEffect } from 'react';

interface UseKeyboardOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onBackspace?: () => void;
  disabled?: boolean;
}

/**
 * 키보드 이벤트를 처리하는 커스텀 훅
 * 접근성을 위한 키보드 네비게이션 지원
 */
export const useKeyboard = (options: UseKeyboardOptions = {}) => {
  const { onEnter, onEscape, onBackspace, disabled = false } = options;

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          if (onEnter && !event.shiftKey) {
            event.preventDefault();
            onEnter();
          }
          break;
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'Backspace':
          if (onBackspace) {
            onBackspace();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEnter, onEscape, onBackspace, disabled]);
};