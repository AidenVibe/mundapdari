import { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface UseAutoSaveOptions {
  key: string;
  value: string;
  delay?: number;
  enabled?: boolean;
  onSave?: (value: string) => void;
  onRestore?: (value: string) => void;
}

export const useAutoSave = ({
  key,
  value,
  delay = 5000,
  enabled = true,
  onSave,
  onRestore,
}: UseAutoSaveOptions) => {
  const debouncedValue = useDebounce(value, delay);
  const isInitialMount = useRef(true);
  const lastSavedValue = useRef<string>('');

  // 페이지 로드시 저장된 값 복원
  useEffect(() => {
    if (!enabled) return;

    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved && saved !== value && onRestore) {
        onRestore(saved);
      }
    } catch (error) {
      console.warn('Failed to restore autosaved value:', error);
    }
  }, [key, enabled, onRestore]);

  // 자동 저장
  useEffect(() => {
    if (!enabled || isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // 값이 실제로 변경되었고 비어있지 않을 때만 저장
    if (debouncedValue && debouncedValue !== lastSavedValue.current) {
      try {
        localStorage.setItem(`autosave_${key}`, debouncedValue);
        lastSavedValue.current = debouncedValue;
        onSave?.(debouncedValue);
      } catch (error) {
        console.warn('Failed to autosave value:', error);
      }
    }
  }, [debouncedValue, key, enabled, onSave]);

  // 수동 저장
  const save = useCallback(() => {
    if (!enabled || !value) return;

    try {
      localStorage.setItem(`autosave_${key}`, value);
      lastSavedValue.current = value;
      onSave?.(value);
    } catch (error) {
      console.warn('Failed to save value:', error);
    }
  }, [key, value, enabled, onSave]);

  // 저장된 값 삭제
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(`autosave_${key}`);
      lastSavedValue.current = '';
    } catch (error) {
      console.warn('Failed to clear autosaved value:', error);
    }
  }, [key]);

  // 저장된 값 가져오기
  const getSaved = useCallback(() => {
    try {
      return localStorage.getItem(`autosave_${key}`);
    } catch (error) {
      console.warn('Failed to get autosaved value:', error);
      return null;
    }
  }, [key]);

  return {
    save,
    clear,
    getSaved,
    isSaving: debouncedValue !== value, // 디바운스 중이면 저장 중
  };
};