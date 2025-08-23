import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Date-fns 한국어 로케일 설정
import 'dayjs/locale/ko';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('ko');

// 환경 변수 검증
const requiredEnvVars = {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  VITE_ENV: import.meta.env.VITE_ENV || 'development',
};

// 개발 환경에서 환경 변수 로깅
if (import.meta.env.DEV) {
  console.log('🚀 문답다리 프론트엔드 시작');
  console.log('📍 환경 변수:', requiredEnvVars);
}

// React Strict Mode는 개발 환경에서만 사용
const AppWrapper = import.meta.env.DEV ? React.StrictMode : React.Fragment;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <AppWrapper>
    <App />
  </AppWrapper>
);