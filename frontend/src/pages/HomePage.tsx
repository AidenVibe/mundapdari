import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, LoadingSpinner, EnhancedAnswerTextarea, Modal } from '@/components/ui';
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
  const [showCelebration, setShowCelebration] = useState(false);

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

  // 양쪽 답변 완료 시 축하 효과
  useEffect(() => {
    if (todaysQuestion && myAnswer && partnerAnswer && !showCelebration) {
      setShowCelebration(true);
      toast.success('🎉 오늘의 대화가 완성되었어요! 서로의 마음을 확인해보세요.', {
        duration: 5000,
        style: {
          background: '#10B981',
          color: 'white',
          fontSize: '16px',
          padding: '16px 20px',
          borderRadius: '12px',
          fontWeight: '500',
        },
      });
      
      // 5초 후 축하 상태 리셋
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [myAnswer, partnerAnswer, todaysQuestion, showCelebration]);

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
      // 에러는 store에서 처리됨 (친화적인 메시지로 표시)
      console.error('Submit answer error:', error);
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

  // Q&A 플로우 상태 확인
  const getFlowStatus = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return 'no-question';
    
    if (currentQuestion.isDefault) {
      return defaultAnswer ? 'my-complete' : 'waiting-my-answer';
    }
    
    const hasMyAnswer = !!myAnswer;
    const hasPartnerAnswer = !!partnerAnswer;
    
    if (hasMyAnswer && hasPartnerAnswer) return 'both-complete';
    if (hasMyAnswer && !hasPartnerAnswer) return 'waiting-partner';
    if (!hasMyAnswer) return 'waiting-my-answer';
    
    return 'waiting-my-answer';
  };

  // 상태별 아이콘과 메시지 반환
  const getFlowStepInfo = (step: 'question' | 'my-answer' | 'partner-answer') => {
    const flowStatus = getFlowStatus();
    
    switch (step) {
      case 'question':
        return {
          icon: '❓',
          status: 'complete',
          text: '오늘의 질문',
          description: '새로운 질문이 준비되었어요'
        };
      
      case 'my-answer':
        const myComplete = getCurrentQuestion()?.isDefault ? !!defaultAnswer : !!myAnswer;
        return {
          icon: myComplete ? '✅' : '⏳',
          status: myComplete ? 'complete' : 'pending',
          text: '내 답변',
          description: myComplete ? '답변을 완료했어요' : '답변을 작성해주세요'
        };
      
      case 'partner-answer':
        if (getCurrentQuestion()?.isDefault) {
          return {
            icon: '💭',
            status: 'disabled',
            text: `${getPartnerName()}의 답변`,
            description: '기본 질문에서는 확인할 수 없어요'
          };
        }
        
        const partnerComplete = !!partnerAnswer;
        const myAnswered = !!myAnswer;
        
        if (!myAnswered) {
          return {
            icon: '⏸️',
            status: 'disabled',
            text: `${getPartnerName()}의 답변`,
            description: '내 답변을 먼저 작성해주세요'
          };
        }
        
        return {
          icon: partnerComplete ? '✅' : '⏳',
          status: partnerComplete ? 'complete' : 'pending',
          text: `${getPartnerName()}의 답변`,
          description: partnerComplete ? '답변이 도착했어요!' : '답변을 기다리고 있어요'
        };
      
      default:
        return { icon: '❓', status: 'pending', text: '', description: '' };
    }
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
        <div className="text-center">
          <LoadingSpinner
            size="large"
            message="오늘의 질문을 불러오고 있어요..."
          />
          <p className="text-sm text-gray-500 mt-4">
            네트워크가 느릴 수 있어요. 조금만 기다려주세요.
          </p>
        </div>
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
      <div className="text-white pt-safe" style={{backgroundColor: '#E9A885'}}>
        <div className="px-4 py-6">
          <div className="bg-text-box rounded-large p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-text-medium text-base">
                  {getGreeting()},
                </p>
                <h1 className="text-3xl font-bold text-text-dark">{user?.name}님!</h1>
              </div>
              <div className="flex items-center space-x-3">
                {/* 혼자 사용 중일 때 초대 버튼 */}
                {isAlone() && (
                  <Button
                    variant="success"
                    size="medium"
                    onClick={() => setShowInviteModal(true)}
                  >
                    가족 초대
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={() => setShowLogoutModal(true)}
                >
                  설정
                </Button>
              </div>
            </div>
          </div>

          {getCurrentQuestion() && (
            <div className="bg-text-box rounded-lg p-4">
              <p className="text-text-medium text-base mb-2">
                {getCurrentQuestion()?.isDefault ? '오늘의 기본 질문' : '오늘의 질문'}
              </p>
              <p className="text-text-dark text-xl font-medium leading-relaxed">
                {getCurrentQuestion()?.content}
              </p>
              {getCurrentQuestion()?.isDefault && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={generateNewDefaultQuestion}
                  className="mt-3 text-white text-opacity-85 hover:text-opacity-100 underline bg-transparent hover:bg-transparent focus:ring-white focus:ring-opacity-50"
                >
                  다른 질문으로 바꾸기
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* 혼자 사용 중일 때 안내 카드 */}
        {isAlone() && (
          <Card className="mb-6 bg-background-secondary border-success-200">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">👥</div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  가족과 함께 문답다리를 해보세요!
                </h3>
                <p className="text-blue-700 text-base mb-3 leading-relaxed">
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

        {/* 로딩 상태일 때 인라인 로딩 표시 */}
        {isLoading && getCurrentQuestion() && (
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="small" />
              <p className="text-blue-700 text-sm">
                데이터를 업데이트하고 있어요...
              </p>
            </div>
          </Card>
        )}
        
        {getCurrentQuestion() ? (
          <div className="space-y-6">
            {/* Q&A 플로우 진행 상태 */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="text-2xl mr-2">🔄</span>
                  오늘의 대화 진행상황
                </h2>
                <p className="text-sm text-gray-600">
                  단계별로 차근차근 진행해보세요
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1단계: 질문 확인 */}
                {(() => {
                  const stepInfo = getFlowStepInfo('question');
                  return (
                    <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-400">
                      <div className="flex items-start space-x-3">
                        <div className="text-3xl">{stepInfo.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-800 text-base">
                              1단계: {stepInfo.text}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              완료
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {stepInfo.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2단계: 내 답변 */}
                {(() => {
                  const stepInfo = getFlowStepInfo('my-answer');
                  return (
                    <div className={`bg-white rounded-lg p-4 shadow-sm border-l-4 transition-all duration-300 ${
                      stepInfo.status === 'complete' 
                        ? 'border-green-400' 
                        : 'border-orange-400 ring-2 ring-orange-100'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className="text-3xl">{stepInfo.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-800 text-base">
                              2단계: {stepInfo.text}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              stepInfo.status === 'complete'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {stepInfo.status === 'complete' ? '완료' : '진행중'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {stepInfo.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3단계: 상대방 답변 확인 */}
                {(() => {
                  const stepInfo = getFlowStepInfo('partner-answer');
                  return (
                    <div className={`bg-white rounded-lg p-4 shadow-sm border-l-4 transition-all duration-300 ${
                      stepInfo.status === 'complete' 
                        ? 'border-green-400' 
                        : stepInfo.status === 'pending'
                        ? 'border-blue-400'
                        : 'border-gray-300'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className="text-3xl">{stepInfo.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-800 text-base">
                              3단계: {stepInfo.text}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              stepInfo.status === 'complete'
                                ? 'bg-green-100 text-green-700'
                                : stepInfo.status === 'pending'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {stepInfo.status === 'complete' ? '완료' : 
                               stepInfo.status === 'pending' ? '대기중' : '대기'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {stepInfo.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Card>

            {/* 양쪽 답변 완료 축하 카드 */}
            {getFlowStatus() === 'both-complete' && (
              <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-300 shadow-lg">
                <div className="text-center py-6">
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h2 className="text-2xl font-bold text-green-800 mb-3">
                    축하해요! 오늘의 대화가 완성되었어요
                  </h2>
                  <p className="text-green-700 text-base mb-4 leading-relaxed">
                    {getPartnerName()}와 함께 마음을 나누는 소중한 시간이 되었어요.<br />
                    서로의 답변을 읽어보며 더 깊이 이해해보세요.
                  </p>
                  <div className="flex justify-center items-center space-x-2 text-sm text-green-600">
                    <span className="animate-pulse">💝</span>
                    <span>따뜻한 대화가 가족의 마음을 더욱 가깝게 해요</span>
                    <span className="animate-pulse">💝</span>
                  </div>
                </div>
              </Card>
            )}

            {/* 기본 질문 안내 카드 */}
            {getCurrentQuestion()?.isDefault && (
              <Card className="bg-warning-50 border-warning-200">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      기본 질문으로 대화를 시작해보세요!
                    </h3>
                    <p className="text-orange-700 text-base mb-3 leading-relaxed">
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
            <Card className="transition-all duration-300 hover:shadow-lg">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="text-2xl mr-3">✍️</span>
                    내 답변 작성하기
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getCurrentQuestion()?.isDefault ? (
                      defaultAnswer ? (
                        <span className="px-4 py-2 text-sm font-bold bg-green-100 text-green-800 rounded-full flex items-center">
                          <span className="text-base mr-1">✅</span>
                          저장 완료
                        </span>
                      ) : (
                        <span className="px-4 py-2 text-sm font-bold bg-orange-100 text-orange-800 rounded-full flex items-center animate-pulse">
                          <span className="text-base mr-1">✏️</span>
                          작성중
                        </span>
                      )
                    ) : myAnswer ? (
                      <span className="px-4 py-2 text-sm font-bold bg-green-100 text-green-800 rounded-full flex items-center">
                        <span className="text-base mr-1">✅</span>
                        답변 완료
                      </span>
                    ) : (
                      <span className="px-4 py-2 text-sm font-bold bg-orange-100 text-orange-800 rounded-full flex items-center animate-pulse">
                        <span className="text-base mr-1">✏️</span>
                        작성중
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                  <p className="text-base text-blue-800 font-medium">
                    💡 답변 작성 가이드
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {getCurrentQuestion()?.isDefault 
                      ? "기본 질문에 대한 솔직한 생각을 편안하게 적어보세요."
                      : myAnswer 
                        ? `${dayjs(myAnswer.createdAt).format('MM월 DD일 HH:mm')}에 작성된 답변을 수정할 수 있어요.`
                        : "마음을 열고 진솔한 답변을 작성해보세요. 가족과 나누는 소중한 대화예요."
                    }
                  </p>
                </div>
              </div>

              <EnhancedAnswerTextarea
                label="나의 답변"
                value={answerContent}
                onChange={setAnswerContent}
                onSubmit={handleSubmitAnswer}
                placeholder="솔직하고 진솔한 마음을 담아 답변해주세요..."
                maxLength={500}
                disabled={isSubmitting || isLoading}
                isSubmitting={isSubmitting || isLoading}
                autoSaveKey={`answer_${getCurrentQuestion()?.questionId || 'default'}_${user?.id}`}
                submitButtonText={
                  getCurrentQuestion()?.isDefault 
                    ? (defaultAnswer ? '답변 수정하기' : '답변 저장하기')
                    : (myAnswer ? '답변 수정하기' : '답변 저장하기')
                }
              />
            </Card>

            {/* 상대방 답변 카드 */}
            <Card className="transition-all duration-300 hover:shadow-lg">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="text-2xl mr-3">💭</span>
                    {getPartnerName()}의 답변 확인하기
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getCurrentQuestion()?.isDefault ? (
                      <span className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-600 rounded-full flex items-center">
                        <span className="text-base mr-1">💡</span>
                        기본 질문
                      </span>
                    ) : partnerAnswer ? (
                      <span className="px-4 py-2 text-sm font-bold bg-green-100 text-green-800 rounded-full flex items-center">
                        <span className="text-base mr-1">✅</span>
                        답변 도착
                      </span>
                    ) : myAnswer || defaultAnswer ? (
                      <span className="px-4 py-2 text-sm font-bold bg-blue-100 text-blue-800 rounded-full flex items-center animate-pulse">
                        <span className="text-base mr-1">⏳</span>
                        답변 대기중
                      </span>
                    ) : (
                      <span className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-600 rounded-full flex items-center">
                        <span className="text-base mr-1">⏸️</span>
                        대기
                      </span>
                    )}
                  </div>
                </div>
                
                {partnerAnswer ? (
                  <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                    <p className="text-base text-green-800 font-medium">
                      💝 {getPartnerName()}의 마음이 도착했어요
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      {dayjs(partnerAnswer.createdAt).format('MM월 DD일 HH:mm')}에 작성된 따뜻한 답변이에요.
                    </p>
                  </div>
                ) : myAnswer || defaultAnswer ? (
                  <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                    <p className="text-base text-blue-800 font-medium">
                      ⏰ {getPartnerName()}의 답변을 기다리고 있어요
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      답변이 올라오면 바로 알려드릴게요. 조금만 기다려주세요!
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
                    <p className="text-base text-orange-800 font-medium">
                      📝 먼저 내 답변을 작성해주세요
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      내가 먼저 답변을 작성해야 {getPartnerName()}의 답변을 확인할 수 있어요.
                    </p>
                  </div>
                )}
              </div>

              {getCurrentQuestion()?.isDefault ? (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center border-2 border-gray-200">
                  <div className="text-6xl mb-4">🤔</div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">
                    기본 질문에는 {getPartnerName()}의 답변이 표시되지 않아요
                  </h4>
                  <p className="text-gray-600 text-base mb-4">
                    지금은 연습용 기본 질문이에요.<br />
                    서버 질문이 업데이트되면 함께 대화할 수 있어요!
                  </p>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-500">
                      💡 그래도 지금 답변을 작성해서 생각을 정리해보세요
                    </p>
                  </div>
                </div>
              ) : partnerAnswer ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-3">💝</div>
                      <h4 className="text-lg font-semibold text-green-800">
                        {getPartnerName()}의 마음을 읽어보세요
                      </h4>
                    </div>
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-green-100">
                      <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap select-text">
                        {partnerAnswer.content}
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-blue-700 text-sm">
                      💬 답변을 읽은 후, 더 깊은 대화를 나누어보세요!
                    </p>
                  </div>
                </div>
              ) : (myAnswer || defaultAnswer) ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center border-2 border-blue-200">
                  <div className="text-6xl mb-4 animate-pulse">⏳</div>
                  <h4 className="text-lg font-semibold text-blue-700 mb-3">
                    {getPartnerName()}의 답변을 기다리고 있어요
                  </h4>
                  <p className="text-blue-600 text-base mb-4">
                    내 답변은 완료되었어요!<br />
                    {getPartnerName()}가 답변하면 바로 알려드릴게요.
                  </p>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-blue-500">
                      🔔 알림이 켜져 있으면 답변 도착 시 바로 알려드려요
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-8 text-center border-2 border-orange-200">
                  <div className="text-6xl mb-4">💭</div>
                  <h4 className="text-lg font-semibold text-orange-700 mb-3">
                    먼저 내 답변을 작성해주세요
                  </h4>
                  <p className="text-orange-600 text-base mb-4">
                    내가 먼저 마음을 나누어야<br />
                    {getPartnerName()}의 답변을 확인할 수 있어요.
                  </p>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-orange-500">
                      ⬆️ 위의 답변 작성란에서 시작해보세요!
                    </p>
                  </div>
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
            <LoadingSpinner size="medium" message="조금만 기다려주세요..." />
            <Button 
              onClick={fetchTodaysQuestion}
              variant="secondary"
              size="small"
              className="mt-4"
            >
              다시 시도
            </Button>
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
