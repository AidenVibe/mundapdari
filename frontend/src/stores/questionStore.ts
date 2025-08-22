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

      if (!todaysQuestion) {
        // No active pairs or no question available
        set({
          todaysQuestion: null,
          myAnswer: null,
          partnerAnswer: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      set({
        todaysQuestion,
        myAnswer: todaysQuestion.myAnswer,
        partnerAnswer: todaysQuestion.partnerAnswer,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.message || '오늘의 질문을 가져오는데 실패했습니다.';
      set({
        isLoading: false,
        error: errorMessage,
        todaysQuestion: null,
        myAnswer: null,
        partnerAnswer: null,
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
        todaysQuestionId: todaysQuestion.questionId,
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
    // This method is no longer needed since answers are included in getTodaysQuestion response
    // Keeping for backward compatibility but doing nothing
    return;
  },

  clearError: () => {
    set({ error: null });
  },
}));
