import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, LoadingSpinner } from '@/components/ui';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

const InvitePage: React.FC = () => {
  const navigate = useNavigate();
  const { invite } = useParams<{ invite: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifyInvite = async () => {
      if (!invite) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.verifyInvite(invite);
        setIsValid(response.isValid);
      } catch (error: any) {
        toast.error('초대 코드를 확인할 수 없습니다.');
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyInvite();
  }, [invite, navigate]);

  const handleAcceptInvite = () => {
    navigate(`/register?invite=${invite}`);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <LoadingSpinner size="large" message="초대 코드를 확인하고 있어요..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center text-white mb-8">
          <div className="w-20 h-20 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
            <span className="text-3xl">💌</span>
          </div>
          <h1 className="text-2xl font-bold">초대를 받으셨어요!</h1>
        </div>

        {isValid ? (
          <Card>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                문답다리에 초대되었습니다
              </h2>
              
              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <p className="text-primary-800 text-sm">
                  가족과 함께 매일의 소중한 대화를 나누어보세요.
                  서로에 대해 더 깊이 알아가는 시간이 될 거예요.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="large"
                  fullWidth
                  onClick={handleAcceptInvite}
                >
                  초대 수락하고 가입하기
                </Button>
                
                <Button
                  variant="secondary"
                  size="medium"
                  fullWidth
                  onClick={handleGoBack}
                >
                  나중에 하기
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-error-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">❌</span>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                유효하지 않은 초대 코드
              </h2>
              
              <p className="text-gray-600 mb-6">
                초대 코드가 만료되었거나 잘못된 코드입니다.
                초대를 보낸 분께 새로운 링크를 요청해주세요.
              </p>

              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handleGoBack}
              >
                처음으로 돌아가기
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InvitePage;