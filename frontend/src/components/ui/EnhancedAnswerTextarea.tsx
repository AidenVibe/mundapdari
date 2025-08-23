import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useAutoSave } from '@/hooks/useAutoSave';
import Textarea from './Textarea';

interface EnhancedAnswerTextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => Promise<void>;
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  autoSaveKey: string;
  submitButtonText?: string;
  isSubmitting?: boolean;
  showSubmitButton?: boolean;
}

const EnhancedAnswerTextarea: React.FC<EnhancedAnswerTextareaProps> = ({
  label = '답변 작성',
  placeholder = '솔직하고 진솔한 마음을 담아 답변해주세요...',
  value,
  onChange,
  onSubmit,
  maxLength = 500,
  disabled = false,
  required = true,
  className,
  autoSaveKey,
  submitButtonText = '답변 저장하기',
  isSubmitting = false,
  showSubmitButton = true,
}) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  // 제출 처리
  const handleSubmit = useCallback(async () => {
    if (!value.trim() || !onSubmit || isSubmitting) return;

    try {
      await onSubmit(value.trim());
      setSaveStatus(null);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to submit answer:', error);
    }
  }, [value, onSubmit, isSubmitting]);

  // 엔터 키 핸들링 (Ctrl+Enter로 제출)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onSubmit && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
  }, [onSubmit, isSubmitting, handleSubmit]);

  // 자동 저장 기능
  const { save, clear, isSaving } = useAutoSave({
    key: autoSaveKey,
    value,
    delay: 5000,
    enabled: !disabled,
    onSave: () => {
      setSaveStatus('saved');
      // 3초 후 상태 메시지 숨김
      setTimeout(() => setSaveStatus(null), 3000);
    },
    onRestore: (restoredValue) => {
      if (restoredValue && restoredValue !== value) {
        onChange(restoredValue);
        setIsRestored(true);
        toast.success('이전에 작성하던 내용을 복원했습니다', {
          duration: 4000,
        });
        // 3초 후 복원 상태 메시지 숨김
        setTimeout(() => setIsRestored(false), 3000);
      }
    },
  });

  // 실시간 저장 상태 표시
  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    }
  }, [isSaving]);

  // 글자 수 상태에 따른 스타일링
  const getCharCountStatus = () => {
    const remaining = maxLength - value.length;
    if (remaining < 0) return 'over';
    if (remaining < maxLength * 0.1) return 'critical';
    if (remaining < maxLength * 0.25) return 'warning';
    return 'normal';
  };

  const charCountStatus = getCharCountStatus();

  return (
    <div className={clsx('space-y-4', className)}>
      {/* 상태 메시지들 */}
      <div className="min-h-[24px]">
        {isRestored && (
          <div className="flex items-center text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-2">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            이전 작성 내용을 복원했습니다
          </div>
        )}

        {saveStatus && (
          <div className={clsx(
            'flex items-center text-sm rounded-lg px-3 py-2 mb-2 transition-all',
            saveStatus === 'saved' && 'text-green-600 bg-green-50',
            saveStatus === 'saving' && 'text-blue-600 bg-blue-50',
            saveStatus === 'error' && 'text-red-600 bg-red-50'
          )}>
            {saveStatus === 'saving' && (
              <svg className="animate-spin w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {saveStatus === 'saved' && (
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {saveStatus === 'error' && (
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {saveStatus === 'saving' && '자동 저장 중...'}
            {saveStatus === 'saved' && '자동 저장 완료'}
            {saveStatus === 'error' && '저장 실패'}
          </div>
        )}
      </div>

      {/* 개선된 Textarea */}
      <div className="relative">
        <Textarea
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled || isSubmitting}
          required={required}
          autoResize={true}
          onKeyDown={handleKeyDown}
          className={clsx(
            'transition-all duration-200',
            // 글자 수 상태에 따른 추가 스타일링
            charCountStatus === 'over' && 'ring-2 ring-red-200',
            charCountStatus === 'critical' && 'ring-1 ring-orange-200'
          )}
        />
        
        {/* 키보드 단축키 힌트 */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded mr-1">
              Ctrl
            </kbd>
            <span className="mr-1">+</span>
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded mr-1">
              Enter
            </kbd>
            <span>로 빠른 저장</span>
          </span>
          
          {/* 글자 수 상태 인디케이터 */}
          {charCountStatus !== 'normal' && (
            <span className={clsx(
              'text-xs font-medium',
              charCountStatus === 'over' && 'text-red-600',
              charCountStatus === 'critical' && 'text-red-500',
              charCountStatus === 'warning' && 'text-orange-500'
            )}>
              {charCountStatus === 'over' && '⚠️ 글자 수를 초과했습니다'}
              {charCountStatus === 'critical' && '⚠️ 글자 수 한계에 근접했습니다'}
              {charCountStatus === 'warning' && '⚡ 글자 수를 확인해주세요'}
            </span>
          )}
        </div>
      </div>

      {/* 제출 버튼 */}
      {showSubmitButton && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim() || isSubmitting || value.length > maxLength}
          className={clsx(
            'w-full py-3 px-6 text-base font-medium rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // 활성 상태
            !isSubmitting && value.trim() && value.length <= maxLength
              ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 transform hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              저장 중...
            </div>
          ) : (
            submitButtonText
          )}
        </button>
      )}
    </div>
  );
};

export default EnhancedAnswerTextarea;