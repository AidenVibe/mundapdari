/**
 * 기본 질문 데이터
 * 서버에서 오늘의 질문이 제공되지 않을 때 사용
 */

export interface DefaultQuestion {
  id: string;
  content: string;
  category: 'daily' | 'family' | 'memory' | 'future' | 'emotion';
}

export const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  // 일상 질문
  {
    id: 'default-daily-1',
    content: '오늘 하루 중 가장 기억에 남는 순간은 언제였나요?',
    category: 'daily'
  },
  {
    id: 'default-daily-2', 
    content: '지금 이 순간 가장 하고 싶은 일은 무엇인가요?',
    category: 'daily'
  },
  {
    id: 'default-daily-3',
    content: '오늘 새롭게 배운 것이나 깨달은 것이 있다면 무엇인가요?',
    category: 'daily'
  },
  {
    id: 'default-daily-4',
    content: '요즘 가장 관심을 갖고 있는 것은 무엇인가요?',
    category: 'daily'
  },

  // 가족 질문
  {
    id: 'default-family-1',
    content: '우리 가족만의 특별한 전통이나 습관이 있다면 무엇인가요?',
    category: 'family'
  },
  {
    id: 'default-family-2',
    content: '가족 중에서 닮고 싶은 점이 있다면 무엇인가요?',
    category: 'family'
  },
  {
    id: 'default-family-3',
    content: '가족과 함께 꼭 해보고 싶은 일이 있나요?',
    category: 'family'
  },

  // 추억 질문
  {
    id: 'default-memory-1',
    content: '어린 시절 가장 행복했던 기억은 무엇인가요?',
    category: 'memory'
  },
  {
    id: 'default-memory-2',
    content: '지난 1년 중 가장 뿌듯했던 순간은 언제였나요?',
    category: 'memory'
  },
  {
    id: 'default-memory-3',
    content: '처음 만났을 때 서로에 대한 첫인상은 어땠나요?',
    category: 'memory'
  },

  // 미래 질문
  {
    id: 'default-future-1',
    content: '1년 후 어떤 모습의 내가 되어있을까요?',
    category: 'future'
  },
  {
    id: 'default-future-2',
    content: '꼭 이루고 싶은 꿈이나 목표가 있다면 무엇인가요?',
    category: 'future'
  },
  {
    id: 'default-future-3',
    content: '나이가 들었을 때 어떤 할아버지/할머니가 되고 싶나요?',
    category: 'future'
  },

  // 감정 질문
  {
    id: 'default-emotion-1',
    content: '요즘 기분이 어떤가요? 솔직한 마음을 들려주세요.',
    category: 'emotion'
  },
  {
    id: 'default-emotion-2',
    content: '힘들 때 가장 큰 힘이 되는 것은 무엇인가요?',
    category: 'emotion'
  },
  {
    id: 'default-emotion-3',
    content: '감사하고 싶은 사람이나 일이 있다면 무엇인가요?',
    category: 'emotion'
  }
];

/**
 * 랜덤한 기본 질문을 반환합니다
 */
export const getRandomDefaultQuestion = (): DefaultQuestion => {
  const randomIndex = Math.floor(Math.random() * DEFAULT_QUESTIONS.length);
  return DEFAULT_QUESTIONS[randomIndex];
};

/**
 * 특정 카테고리의 기본 질문을 반환합니다
 */
export const getDefaultQuestionByCategory = (category: DefaultQuestion['category']): DefaultQuestion => {
  const categoryQuestions = DEFAULT_QUESTIONS.filter(q => q.category === category);
  const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
  return categoryQuestions[randomIndex];
};

/**
 * 기본 질문 객체를 TodaysQuestion 형태로 변환합니다
 */
export const formatDefaultQuestion = (defaultQuestion: DefaultQuestion) => {
  return {
    questionId: defaultQuestion.id,
    content: defaultQuestion.content,
    isDefault: true, // 기본 질문임을 표시
    myAnswer: null,
    partnerAnswer: null
  };
};