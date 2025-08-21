import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ApiResponse,
  User,
  UserRegistration,
  AuthResponse,
  TodaysQuestion,
  Answer,
  AnswerSubmission,
  LoginCredentials,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - JWT 토큰 추가
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('mundapdari_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - 에러 처리
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 인증 실패 시 토큰 제거 및 로그인 페이지로 리다이렉트
          localStorage.removeItem('mundapdari_token');
          localStorage.removeItem('mundapdari_user');
          window.location.href = '/';
        }

        // 네트워크 에러 또는 서버 에러 처리
        if (!error.response) {
          error.message = '네트워크 연결을 확인해주세요.';
        } else {
          error.message = error.response.data?.message || '서버 오류가 발생했습니다.';
        }

        return Promise.reject(error);
      }
    );
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<ApiResponse<T>>(config);
      
      if (response.data.success) {
        return response.data.data as T;
      } else {
        throw new Error(response.data.message || '요청 처리에 실패했습니다.');
      }
    } catch (error: any) {
      throw new Error(error.message || '네트워크 오류가 발생했습니다.');
    }
  }

  // Auth API
  async register(data: UserRegistration): Promise<AuthResponse> {
    return this.request<AuthResponse>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    });
  }

  async verifyInvite(inviteCode: string): Promise<{ isValid: boolean }> {
    return this.request<{ isValid: boolean }>({
      method: 'GET',
      url: `/auth/verify-invite/${inviteCode}`,
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>({
      method: 'GET',
      url: '/auth/profile',
    });
  }

  // Questions API
  async getTodaysQuestion(): Promise<TodaysQuestion> {
    return this.request<TodaysQuestion>({
      method: 'GET',
      url: '/questions/today',
    });
  }

  // Answers API
  async submitAnswer(data: AnswerSubmission): Promise<Answer> {
    return this.request<Answer>({
      method: 'POST',
      url: '/answers',
      data,
    });
  }

  async getMyAnswer(todaysQuestionId: number): Promise<Answer> {
    return this.request<Answer>({
      method: 'GET',
      url: `/answers/my/${todaysQuestionId}`,
    });
  }

  async getPartnerAnswer(todaysQuestionId: number): Promise<Answer> {
    return this.request<Answer>({
      method: 'GET',
      url: `/answers/partner/${todaysQuestionId}`,
    });
  }

  async updateAnswer(answerId: number, content: string): Promise<Answer> {
    return this.request<Answer>({
      method: 'PUT',
      url: `/answers/${answerId}`,
      data: { content },
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>({
      method: 'GET',
      url: '/health',
    });
  }

  // 토큰 관리
  setToken(token: string) {
    localStorage.setItem('mundapdari_token', token);
  }

  removeToken() {
    localStorage.removeItem('mundapdari_token');
    localStorage.removeItem('mundapdari_user');
  }

  getToken(): string | null {
    return localStorage.getItem('mundapdari_token');
  }
}

// API 클라이언트 인스턴스
export const apiClient = new ApiClient();

// 편의 함수들
export const api = {
  // Auth
  register: (data: UserRegistration) => apiClient.register(data),
  login: (credentials: LoginCredentials) => apiClient.login(credentials),
  verifyInvite: (inviteCode: string) => apiClient.verifyInvite(inviteCode),
  getProfile: () => apiClient.getProfile(),

  // Questions
  getTodaysQuestion: () => apiClient.getTodaysQuestion(),

  // Answers
  submitAnswer: (data: AnswerSubmission) => apiClient.submitAnswer(data),
  getMyAnswer: (todaysQuestionId: number) => apiClient.getMyAnswer(todaysQuestionId),
  getPartnerAnswer: (todaysQuestionId: number) => apiClient.getPartnerAnswer(todaysQuestionId),
  updateAnswer: (answerId: number, content: string) => apiClient.updateAnswer(answerId, content),

  // Utils
  healthCheck: () => apiClient.healthCheck(),
  setToken: (token: string) => apiClient.setToken(token),
  removeToken: () => apiClient.removeToken(),
  getToken: () => apiClient.getToken(),
};

export default api;