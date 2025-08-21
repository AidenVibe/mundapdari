import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui';
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

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center text-white mb-8">
          <div className="w-20 h-20 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">문답다리 로그인</h1>
          <p className="text-white text-opacity-90">
            전화번호로 로그인하세요
          </p>
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
        <div className="mt-6 text-center space-y-2">
          <p className="text-white text-opacity-80 text-sm">
            아직 회원이 아니신가요?
          </p>
          <button
            onClick={() => navigate('/register')}
            className="text-white underline text-sm font-medium hover:text-opacity-80"
            disabled={isLoading}
          >
            회원가입하기
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white text-sm underline hover:text-opacity-80"
            disabled={isLoading}
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;