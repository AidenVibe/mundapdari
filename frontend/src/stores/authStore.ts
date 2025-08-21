import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthStore, User, UserRegistration, LoginCredentials } from '@/types';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.login(credentials);
          const { token, user } = response;

          // 토큰과 사용자 정보 저장
          api.setToken(token);
          localStorage.setItem('mundapdari_user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(`${user.name}님, 환영합니다!`);
        } catch (error: any) {
          const errorMessage = error.message || '로그인에 실패했습니다.';
          set({ 
            isLoading: false, 
            error: errorMessage,
            user: null,
            token: null,
            isAuthenticated: false,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      register: async (data: UserRegistration) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.register(data);
          const { token, user } = response;

          // 토큰과 사용자 정보 저장
          api.setToken(token);
          localStorage.setItem('mundapdari_user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(`${user.name}님, 가입을 환영합니다!`);
        } catch (error: any) {
          const errorMessage = error.message || '회원가입에 실패했습니다.';
          set({ 
            isLoading: false, 
            error: errorMessage,
            user: null,
            token: null,
            isAuthenticated: false,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: () => {
        api.removeToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        toast.success('로그아웃되었습니다.');
      },

      clearError: () => {
        set({ error: null });
      },

      loadUser: async () => {
        try {
          const token = api.getToken();
          const storedUser = localStorage.getItem('mundapdari_user');

          if (!token || !storedUser) {
            set({ isAuthenticated: false, user: null, token: null });
            return;
          }

          set({ isLoading: true });

          // 서버에서 최신 사용자 정보 가져오기
          const user = await api.getProfile();

          // 저장된 사용자 정보 업데이트
          localStorage.setItem('mundapdari_user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // 토큰이 유효하지 않은 경우
          api.removeToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: 'mundapdari-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);