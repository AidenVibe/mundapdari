import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, LoadingSpinner, Textarea, Modal } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useQuestionStore } from '@/stores/questionStore';
import { getRandomDefaultQuestion, formatDefaultQuestion } from '@/utils/defaultQuestions';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    todaysQuestion,
    myAnswer,
    partnerAnswer,
    isLoading,
    error,
    fetchTodaysQuestion,
    submitAnswer,
    fetchAnswers,
  } = useQuestionStore();

  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [defaultQuestion, setDefaultQuestion] = useState<any>(null);
  const [defaultAnswer, setDefaultAnswer] = useState('');

  useEffect(() => {
    fetchTodaysQuestion();
  }, []);

  // 질문이 없을 때 기본 질문 생성
  useEffect(() => {
    if (!isLoading && !todaysQuestion && !error) {
      const randomQuestion = getRandomDefaultQuestion();
      const formattedQuestion = formatDefaultQuestion(randomQuestion);
      setDefaultQuestion(formattedQuestion);
    }
  }, [isLoading, todaysQuestion, error]);

  useEffect(() => {
    if (todaysQuestion && myAnswer) {
      setAnswerContent(myAnswer.content);
    } else if (defaultQuestion && !todaysQuestion) {
      setAnswerContent(defaultAnswer);
    }
  }, [myAnswer, defaultQuestion, todaysQuestion, defaultAnswer]);

  const handleSubmitAnswer = async () => {
    const currentQuestion = getCurrentQuestion();
    if (!answerContent.trim() || !currentQuestion) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 기본 질문인 경우 로컬에서만 저장
      if (currentQuestion.isDefault) {
        // 기본 질문에 대한 답변은 로컬 상태로만 관리
        setDefaultAnswer(answerContent.trim());
        toast.success('답변이 저장되었습니다!');
      } else {
        // 서버 질문인 경우 기존 로직 사용
        await submitAnswer(answerContent.trim());
      }
    } catch (error) {
      // 에러는 store에서 처리됨
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  const getPartnerName = () => {
    if (!user) return '상대방';
    return user.role === 'parent' ? '자녀' : '부모님';
  };

  const isAlone = () => {
    return !user?.pairId; // pairId가 없으면 혼자 사용 중
  };

  const getInviteLink = () => {
    if (!user?.inviteCode) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/invite/${user.inviteCode}`;
  };

  // 현재 표시할 질문 반환 (서버 질문 우선, 없으면 기본 질문)
  const getCurrentQuestion = () => {
    return todaysQuestion || defaultQuestion;
  };

  // 새로운 기본 질문 생성
  const generateNewDefaultQuestion = () => {
    const randomQuestion = getRandomDefaultQuestion();
    const formattedQuestion = formatDefaultQuestion(randomQuestion);
    setDefaultQuestion(formattedQuestion);
    setAnswerContent(''); // 답변 내용 초기화
    setDefaultAnswer(''); // 기본 답변 초기화
  };

  const handleCopyInviteLink = async () => {
    const inviteLink = getInviteLink();
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('초대 링크가 복사되었어요!');
    } catch (error) {
      // 클립보드 API가 지원되지 않는 경우 대체 방법
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('초대 링크가 복사되었어요!');
    }
  };

  if (isLoading && !todaysQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner
          size="large"
          message="오늘의 질문을 불러오고 있어요..."
        />
      </div>
    );
  }

  if (error && !todaysQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            문제가 발생했어요
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchTodaysQuestion} variant="primary">
            다시 시도하기
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <div className="bg-gradient-primary text-white pt-safe">
        <div className="px-4 py-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-white text-opacity-90 text-sm">
                {getGreeting()},
              </p>
              <h1 className="text-2xl font-bold">{user?.name}님!</h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* 혼자 사용 중일 때 초대 버튼 */}
              {isAlone() && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="text-white text-opacity-90 hover:text-opacity-100 text-sm font-medium bg-white bg-opacity-20 px-3 py-2 rounded-lg backdrop-blur-sm transition-all hover:bg-opacity-30"
                >
                  가족 초대
                </button>
              )}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-white text-opacity-90 hover:text-opacity-100 text-sm font-medium bg-white bg-opacity-20 px-3 py-2 rounded-lg backdrop-blur-sm transition-all hover:bg-opacity-30"
              >
                설정
              </button>
            </div>
          </div>

          {getCurrentQuestion() && (
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-white text-opacity-90 text-sm mb-2">
                {getCurrentQuestion()?.isDefault ? '오늘의 기본 질문' : '오늘의 질문'}
              </p>
              <p className="text-white text-lg font-medium leading-relaxed">
                {getCurrentQuestion()?.content}
              </p>
              {getCurrentQuestion()?.isDefault && (
                <button
                  onClick={generateNewDefaultQuestion}
                  className="mt-3 text-white text-opacity-80 hover:text-opacity-100 text-sm underline"
                >
                  다른 질문으로 바꾸기
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* 혼자 사용 중일 때 안내 카드 */}
        {isAlone() && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">👥</div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  가족과 함께 문답다리를 해보세요!
                </h3>
                <p className="text-blue-700 text-sm mb-3">
                  혼자서도 질문에 답변할 수 있지만, 가족과 함께하면 더욱 의미
                  있는 시간이 될 거예요.
                </p>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setShowInviteModal(true)}
                >
                  {getPartnerName()} 초대하기
                </Button>
              </div>
            </div>
          </Card>
        )}

        {getCurrentQuestion() ? (
          <div className="space-y-6">
            {/* 기본 질문 안내 카드 */}
            {getCurrentQuestion()?.isDefault && (
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      기본 질문으로 대화를 시작해보세요!
                    </h3>
                    <p className="text-orange-700 text-sm mb-3">
                      서버에서 오늘의 질문이 아직 준비되지 않아 기본 질문을 제공해드려요. 
                      언제든 답변하고 대화를 나눌 수 있어요.
                    </p>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={generateNewDefaultQuestion}
                    >
                      다른 질문으로 바꾸기
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* 내 답변 카드 */}
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  내 답변
                </h3>
                {getCurrentQuestion()?.isDefault ? (
                  defaultAnswer && (
                    <p className="text-sm text-gray-500">
                      기본 질문에 대한 답변
                    </p>
                  )
                ) : (
                  myAnswer && (
                    <p className="text-sm text-gray-500">
                      {dayjs(myAnswer.createdAt).format('MM월 DD일 HH:mm')}에 작성
                    </p>
                  )
                )}
              </div>

              <Textarea
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="솔직하고 진솔한 마음을 담아 답변해주세요..."
                maxLength={500}
                rows={5}
                disabled={isSubmitting}
                className="mb-4"
              />

              <Button
                onClick={handleSubmitAnswer}
                variant="primary"
                size="large"
                fullWidth
                loading={isSubmitting}
                disabled={!answerContent.trim() || isSubmitting}
              >
                {getCurrentQuestion()?.isDefault 
                  ? (defaultAnswer ? '답변 수정하기' : '답변 저장하기')
                  : (myAnswer ? '답변 수정하기' : '답변 저장하기')
                }
              </Button>
            </Card>

            {/* 상대방 답변 카드 */}
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {getPartnerName()}의 답변
                </h3>
                {partnerAnswer && (
                  <p className="text-sm text-gray-500">
                    {dayjs(partnerAnswer.createdAt).format('MM월 DD일 HH:mm')}에
                    작성
                  </p>
                )}
              </div>

              {getCurrentQuestion()?.isDefault ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🤔</div>
                  <p className="text-gray-600 mb-2">
                    기본 질문에는 {getPartnerName()}의 답변이 표시되지 않아요
                  </p>
                  <p className="text-sm text-gray-500">
                    서버 질문이 업데이트되면 함께 대화할 수 있어요!
                  </p>
                </div>
              ) : partnerAnswer ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap select-text">
                    {partnerAnswer.content}
                  </p>
                </div>
              ) : (myAnswer || defaultAnswer) ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">⏳</div>
                  <p className="text-gray-600 mb-2">
                    {getPartnerName()}가 아직 답변하지 않았어요
                  </p>
                  <p className="text-sm text-gray-500">
                    답변이 올라오면 알려드릴게요!
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💭</div>
                  <p className="text-gray-600 mb-2">
                    먼저 내 답변을 작성해주세요
                  </p>
                  <p className="text-sm text-gray-500">
                    답변을 작성하면 {getPartnerName()}의 답변도 볼 수 있어요
                  </p>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card className="text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              질문을 불러오고 있어요
            </h2>
            <p className="text-gray-600 mb-6">잠시만 기다려주세요</p>
            <LoadingSpinner size="medium" />
          </Card>
        )}
      </div>

      {/* 초대 모달 */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="가족 초대하기"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">👨‍👩‍👦‍👦</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {getPartnerName()}을(를) 초대해보세요!
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            아래 링크를 복사해서 {getPartnerName()}에게 보내주세요. 함께 매일의
            소중한 대화를 나눌 수 있어요.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-500 mb-2">초대 링크</p>
            <p className="text-sm text-gray-700 font-mono break-all">
              {getInviteLink()}
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowInviteModal(false)}
            >
              닫기
            </Button>
            <Button variant="primary" fullWidth onClick={handleCopyInviteLink}>
              링크 복사하기
            </Button>
          </div>
        </div>
      </Modal>

      {/* 설정 모달 */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="설정"
      >
        <div className="space-y-4">
          {/* 사용자 정보 섹션 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">내 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">이름</span>
                <span className="text-gray-800 font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">관계</span>
                <span className="text-gray-800 font-medium">
                  {user?.role === 'parent' ? '부모' : '자녀'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">연결 상태</span>
                <span className={`font-medium ${isAlone() ? 'text-orange-600' : 'text-green-600'}`}>
                  {isAlone() ? '가족 대기 중' : '가족과 연결됨'}
                </span>
              </div>
            </div>
          </div>

          {/* 초대 코드 섹션 */}
          {user?.inviteCode && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">내 초대 코드</h3>
              <div className="bg-white rounded px-3 py-2 text-sm font-mono text-gray-700 border">
                {user.inviteCode}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                가족과 연결하려면 이 코드를 공유해주세요
              </p>
            </div>
          )}

          {/* 버튼 섹션 */}
          <div className="space-y-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowLogoutModal(false)}
            >
              닫기
            </Button>
            <Button 
              variant="error" 
              fullWidth 
              onClick={handleLogout}
              className="text-sm"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
