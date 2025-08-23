import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card } from '@/components/ui';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');

  const handleGetStarted = () => {
    if (inviteCode) {
      navigate(`/invite/${inviteCode}`);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#E9A885'}}>
      <div className="w-full max-w-md">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-12">
          <div className="bg-text-box rounded-large p-6 mb-6">
            <div className="mb-4">
              <div className="w-24 h-24 mx-auto bg-success-500 rounded-full flex items-center justify-center shadow-soft">
                <span className="text-4xl">💬</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3 text-text-dark">문답다리</h1>
            <p className="text-lg text-text-medium leading-relaxed">
              가족과 함께하는<br />
              매일의 소중한 대화
            </p>
          </div>
        </div>

        {/* 설명 카드 */}
        <Card className="mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              어떻게 사용하나요?
            </h2>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-sm font-semibold">1</span>
                </div>
                <p className="text-left">매일 새로운 질문이 제공됩니다</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-sm font-semibold">2</span>
                </div>
                <p className="text-left">각자 답변을 작성해주세요</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-sm font-semibold">3</span>
                </div>
                <p className="text-left">서로의 답변을 보며 대화해보세요</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 시작하기 버튼들 */}
        <div className="space-y-3">
          <Button
            variant="success"
            size="large"
            fullWidth
            onClick={handleGetStarted}
            className="shadow-lg"
          >
            {inviteCode ? '초대 수락하여 가입하기' : '새로 시작하기'}
          </Button>

          {/* 초대 코드가 없는 경우 추가 옵션 */}
          {!inviteCode && (
            <Button
              variant="secondary"
              size="large"
              fullWidth
              onClick={() => navigate('/login')}
            >
              이미 사용 중이에요 (로그인)
            </Button>
          )}
        </div>

        {/* 설명 추가 */}
        {!inviteCode && (
          <div className="mt-6 text-center">
            <div className="bg-text-box rounded-medium p-4">
              <p className="text-text-dark text-sm font-medium">
                처음 사용하시나요? '새로 시작하기'를 선택해주세요!
              </p>
              <p className="text-text-medium text-xs mt-1">
                이미 가입하셨다면 '이미 사용 중이에요'를 선택해주세요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;