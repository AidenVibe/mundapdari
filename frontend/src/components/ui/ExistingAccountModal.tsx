import React from 'react';
import { Modal, Button } from '@/components/ui';

interface ExistingAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLogin: () => void;
  phone: string;
}

const ExistingAccountModal: React.FC<ExistingAccountModalProps> = ({
  isOpen,
  onClose,
  onGoToLogin,
  phone
}) => {
  const maskedPhone = phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="이미 사용 중인 계정">
      <div className="text-center">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          이미 사용 중인 계정입니다
        </h3>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm mb-2">
            <span className="font-medium">{maskedPhone}</span>로 이미 가입된 계정이 있어요.
          </p>
          <p className="text-blue-700 text-xs">
            새로 가입하는 대신 기존 계정으로 로그인해주세요.
          </p>
        </div>

        {/* 향후 카카오 로그인 안내 */}
        <div className="bg-yellow-50 rounded-lg p-3 mb-6">
          <p className="text-yellow-800 text-xs">
            💡 <strong>업데이트 예정:</strong> 곧 카카오 로그인으로 더 간편하게 이용하실 수 있어요!
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            onClick={onGoToLogin}
          >
            기존 계정으로 로그인하기
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            다른 전화번호로 가입하기
          </Button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500">
            문제가 있으시면 고객센터로 문의해주세요.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ExistingAccountModal;