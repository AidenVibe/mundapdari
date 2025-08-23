import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, LoadingSpinner } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import type { LoginCredentials, FormErrors } from '@/types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    phone: '',
    inviteCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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
      await login({ 
        phone: cleanPhone,
        inviteCode: formData.inviteCode || undefined 
      });
      navigate('/home');
    } catch (error) {
      // 에러는 store에서 처리됨
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#E9A885'}}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-text-box rounded-large p-6">
              <div className="w-20 h-20 mx-auto bg-success-500 rounded-full flex items-center justify-center shadow-soft mb-4">
                <span className="text-3xl">🔑</span>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-text-dark">로그인 중...</h1>
              <LoadingSpinner
                size="medium"
                message="잠시만 기다려주세요..."
                className="mt-4"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#E9A885'}}>
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="bg-text-box rounded-large p-6">
            <div className="w-20 h-20 mx-auto bg-success-500 rounded-full flex items-center justify-center shadow-soft mb-4">
              <span className="text-3xl">🔑</span>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-text-dark">문답다리 로그인</h1>
            <p className="text-text-medium">
              전화번호로 로그인하세요
            </p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="전화번호"
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              error={errors.phone}
              required
              disabled={isLoading}
            />

            <Input
              label="초대 코드 (선택사항)"
              placeholder="초대 코드가 있다면 입력해주세요"
              value={formData.inviteCode || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, inviteCode: value }))}
              error={errors.inviteCode}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              로그인
            </Button>
          </form>
        </Card>

        {/* 다른 옵션들 */}
        <div className="mt-6 text-center">
          <div className="bg-text-box rounded-medium p-4">
            <p className="text-text-dark text-sm mb-3">
              아직 회원이 아니신가요?
            </p>
            <button
              onClick={() => navigate('/register')}
              className="text-success-600 underline text-sm font-medium hover:text-success-700 mb-2 block w-full"
              disabled={isLoading}
            >
              회원가입하기
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-text-medium text-xs underline hover:text-text-dark"
              disabled={isLoading}
            >
              처음으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;