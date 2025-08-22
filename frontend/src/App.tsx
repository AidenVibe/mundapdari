import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/ui';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { setupKakaoWebViewMeta, getKakaoWebViewInfo } from '@/utils/kakao';

// Pages
import WelcomePage from '@/pages/WelcomePage';
import InvitePage from '@/pages/InvitePage';
import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import ComponentsDemo from '@/pages/ComponentsDemo';

const App: React.FC = () => {
  const { loadUser, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 카카오톡 웹뷰 최적화 설정
    setupKakaoWebViewMeta();
    
    // 개발 환경에서 카카오톡 웹뷰 정보 로깅
    if (import.meta.env.DEV) {
      const kakaoInfo = getKakaoWebViewInfo();
      console.log('📱 카카오톡 웹뷰 환경 정보:', kakaoInfo);
    }
    
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <LoadingSpinner size="large" message="문답다리를 시작하고 있어요..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 공개 라우트 */}
          <Route 
            index 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <WelcomePage />
            } 
          />
          <Route 
            path="/invite/:invite" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <InvitePage />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />
            } 
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />
            } 
          />

          {/* 보호된 라우트 */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />

          {/* 디자인 시스템 데모 (개발용) */}
          <Route path="/components" element={<ComponentsDemo />} />

          {/* 404 페이지 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;