// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// User Types
export interface User {
  id: number;
  name: string;
  role: 'parent' | 'child';
  inviteCode?: string;
  pairId?: number;
  phone?: string; // OAuth 시 선택적
  authProvider?: 'local' | 'kakao'; // 인증 제공자
  providerId?: string; // OAuth 제공자의 사용자 ID
  profileImage?: string; // 카카오에서 제공되는 프로필 이미지
  createdAt: string;
  updatedAt: string;
}

export interface UserRegistration {
  name: string;
  phone: string;
  role: 'parent' | 'child';
  inviteCode?: string;
}

// Pair Types
export interface Pair {
  id: number;
  parentId: number;
  childId: number;
  status: 'active' | 'inactive';
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  parent?: User;
  child?: User;
}

// Question Types
export interface Question {
  id: number;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Backend response structure for today's question
export interface TodaysQuestionResponse {
  question: {
    id: number;
    content: string;
    category: string;
  };
  pair: {
    id: number;
    partner_name?: string;
  };
  my_answer: Answer | null;
  partner_answer: Answer | null;
  both_answered: boolean;
}

// Transformed structure for frontend use
export interface TodaysQuestion {
  questionId: number;
  content: string;
  category: string;
  pairId: number;
  partnerName?: string;
  myAnswer: Answer | null;
  partnerAnswer: Answer | null;
  bothAnswered: boolean;
}

// Answer Types
export interface Answer {
  id: number;
  content: string;
  userId: number;
  todaysQuestionId: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface AnswerSubmission {
  content: string;
  todaysQuestionId: number;
}

// Auth Types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  phone: string;
  inviteCode?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Form Types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface RegistrationForm {
  name: string;
  phone: string;
  role: 'parent' | 'child';
  inviteCode?: string;
}

export interface AnswerForm {
  content: string;
}

// Navigation Types
export type RouteParams = {
  invite?: string;
  questionId?: string;
};

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password';
  className?: string;
}

export interface TextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// Store Types (Zustand)
export interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: UserRegistration) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  loadUser: () => Promise<void>;
}

export interface QuestionStore {
  todaysQuestion: TodaysQuestion | null;
  myAnswer: Answer | null;
  partnerAnswer: Answer | null;
  isLoading: boolean;
  error: string | null;
  fetchTodaysQuestion: () => Promise<void>;
  submitAnswer: (content: string) => Promise<void>;
  fetchAnswers: () => Promise<void>;
  clearError: () => void;
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// API Error Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Toast Types
export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
}

// Environment Types
export interface EnvironmentConfig {
  apiUrl: string;
  environment: 'development' | 'production' | 'test';
  version: string;
}
