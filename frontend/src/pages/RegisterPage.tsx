import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Input, LoadingSpinner, ExistingAccountModal } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import type { RegistrationForm, FormErrors } from '@/types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');
  
  const { register, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState<RegistrationForm>({
    name: '',
    phone: '',
    role: 'child',
    inviteCode: inviteCode || '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showExistingAccountModal, setShowExistingAccountModal] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 2글자 이상 입력해주세요.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else {
      // 한국 전화번호 형식 검증
      const phoneRegex = /^(\+82|0)(10|11|16|17|18|19)\d{7,8}$/;
      const cleanPhone = formData.phone.replace(/[\s-]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = '올바른 전화번호 형식이 아닙니다.';
      }
    }

    // 초대 코드는 선택사항으로 변경
    // if (!inviteCode && !formData.inviteCode.trim()) {
    //   newErrors.inviteCode = '초대 코드를 입력해주세요.';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const cleanPhone = formData.phone.replace(/[\s-]/g, '');
      await register({
        name: formData.name.trim(),
        phone: cleanPhone,
        role: formData.role,
        inviteCode: formData.inviteCode || inviteCode || '',
      });
      
      navigate('/home');
    } catch (error: any) {
      console.log('Registration error:', error); // 디버깅용
      
      // 409 에러 (중복 전화번호)인 경우 사용자 친화적 모달 표시
      const isDuplicateError = (
        error.status === 409 ||
        (error.message && (
          error.message.includes('이미 가입된 전화번호입니다') || 
          error.message.includes('already exists') ||
          error.message.includes('already registered') ||
          error.message.includes('Resource conflict')
        ))
      );
      
      if (isDuplicateError) {
        console.log('Showing duplicate account modal'); // 디버깅용
        setShowExistingAccountModal(true);
      }
      // 다른 에러들은 기본 토스트로 처리 (authStore에서 이미 처리됨)
    }
  };

  const handleRoleSelect = (role: 'parent' | 'child') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleGoToLogin = () => {
    setShowExistingAccountModal(false);
    navigate('/login');
  };

  const handleCloseModal = () => {
    setShowExistingAccountModal(false);
    // 전화번호 필드를 비워서 다른 번호로 시도할 수 있게 함
    setFormData(prev => ({ ...prev, phone: '' }));
    setErrors({});
  };

  // 디버깅을 위한 useEffect 추가
  React.useEffect(() => {
    console.log('Modal state changed:', showExistingAccountModal);
  }, [showExistingAccountModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#E9A885'}}>
        <div className="w-full max-w-md">
          <div className="text-center text-white mb-8">
            <div className="w-20 h-20 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">가입 중...</h1>
            <LoadingSpinner
              size="medium"
              message="잠시만 기다려주세요..."
              className="mt-4"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#E9A885'}}>
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center text-white mb-8">
          <div className="w-20 h-20 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">문답다리 가입하기</h1>
          <p className="text-white text-opacity-90">
            몇 가지 정보만 입력해주세요
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 입력 */}
            <Input
              label="이름"
              placeholder="이름을 입력해주세요"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              error={errors.name}
              required
              disabled={isLoading}
            />

            {/* 전화번호 입력 */}
            <Input
              label="전화번호"
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              error={errors.phone}
              required
              disabled={isLoading}
            />

            {/* 역할 선택 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                어떤 관계로 사용하시나요? <span className="text-error-500">*</span>
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('parent')}
                  disabled={isLoading}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-center
                    ${formData.role === 'parent'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="text-2xl mb-1">👨‍👩‍👦</div>
                  <div className="font-medium">부모</div>
                  <div className="text-sm text-gray-500">엄마, 아빠</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleRoleSelect('child')}
                  disabled={isLoading}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-center
                    ${formData.role === 'child'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="text-2xl mb-1">🧑</div>
                  <div className="font-medium">자녀</div>
                  <div className="text-sm text-gray-500">아들, 딸</div>
                </button>
              </div>
            </div>

            {/* 초대 코드 (선택사항) */}
            {!inviteCode && (
              <div>
                <Input
                  label="초대 코드 (선택사항)"
                  placeholder="초대받았다면 코드를 입력해주세요"
                  value={formData.inviteCode || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, inviteCode: value }))}
                  error={errors.inviteCode}
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-2">
                  초대 코드가 없어도 가입 가능하며, 나중에 가족을 초대할 수 있어요.
                </p>
              </div>
            )}

            {/* 가입하기 버튼 */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              가입하기
            </Button>
          </form>
        </Card>

        {/* 뒤로가기 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white text-sm underline hover:text-opacity-80"
            disabled={isLoading}
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>

      {/* 기존 계정 모달 */}
      <ExistingAccountModal
        isOpen={showExistingAccountModal}
        onClose={handleCloseModal}
        onGoToLogin={handleGoToLogin}
        phone={formData.phone}
      />
    </div>
  );
};

export default RegisterPage;