import { create } from 'zustand';
import type { QuestionStore, TodaysQuestion, Answer } from '@/types';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  todaysQuestion: null,
  myAnswer: null,
  partnerAnswer: null,
  isLoading: false,
  error: null,

  fetchTodaysQuestion: async () => {
    try {
      set({ isLoading: true, error: null });

      const todaysQuestion = await api.getTodaysQuestion();

      set({
        todaysQuestion,
        isLoading: false,
        error: null,
      });

      // 오늘의 질문을 가져온 후 답변도 함께 가져오기
      get().fetchAnswers();
    } catch (error: any) {
      const errorMessage = error.message || '오늘의 질문을 가져오는데 실패했습니다.';
      set({ 
        isLoading: false, 
        error: errorMessage,
        todaysQuestion: null,
      });
      
      if (!error.message?.includes('질문이 없습니다')) {
        toast.error(errorMessage);
      }
    }
  },

  submitAnswer: async (content: string) => {
    try {
      const { todaysQuestion } = get();
      if (!todaysQuestion) {
        throw new Error('오늘의 질문이 없습니다.');
      }

      set({ isLoading: true, error: null });

      const answer = await api.submitAnswer({
        content,
        todaysQuestionId: todaysQuestion.id,
      });

      set({
        myAnswer: answer,
        isLoading: false,
        error: null,
      });

      toast.success('답변이 저장되었습니다!');
    } catch (error: any) {
      const errorMessage = error.message || '답변 저장에 실패했습니다.';
      set({ 
        isLoading: false, 
        error: errorMessage,
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  fetchAnswers: async () => {
    try {
      const { todaysQuestion } = get();
      if (!todaysQuestion) {
        return;
      }

      const promises = [
        api.getMyAnswer(todaysQuestion.id).catch(() => null),
        api.getPartnerAnswer(todaysQuestion.id).catch(() => null),
      ];

      const [myAnswer, partnerAnswer] = await Promise.all(promises);

      set({
        myAnswer,
        partnerAnswer,
        error: null,
      });
    } catch (error: any) {
      // 답변을 가져오는 것은 실패해도 에러를 표시하지 않음
      console.warn('답변을 가져오는데 실패했습니다:', error.message);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));