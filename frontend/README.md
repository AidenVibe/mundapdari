# 문답다리 프론트엔드

가족 간의 소중한 소통을 위한 질문과 답변 애플리케이션의 프론트엔드입니다.

## 🚀 시작하기

### 필요한 환경

- Node.js 16.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📱 주요 기능

### 인증 및 페어링
- 초대 링크를 통한 가입
- 부모/자녀 역할 선택
- JWT 기반 인증

### Q&A 시스템
- 매일 새로운 질문 제공
- 답변 작성 및 수정 (500자 제한)
- 상대방 답변 조회
- 실시간 상태 동기화

### UI/UX 특징
- 모바일 우선 반응형 디자인
- 60대+ 사용자를 위한 큰 폰트와 버튼
- 카카오톡 웹뷰 최적화
- WCAG 접근성 지침 준수

## 🛠 기술 스택

### 코어 기술
- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 개발 환경
- **React Router v6** - 클라이언트 라우팅

### 스타일링
- **Tailwind CSS** - 유틸리티 우선 CSS
- **PostCSS** - CSS 전처리
- **Pretendard 폰트** - 한국어 최적화 폰트

### 상태 관리
- **Zustand** - 경량 상태 관리
- **React Hot Toast** - 알림 시스템

### API & 통신
- **Axios** - HTTP 클라이언트
- **Day.js** - 날짜 처리

### 개발 도구
- **ESLint** - 코드 품질 검사
- **Prettier** - 코드 포맷팅
- **Vitest** - 테스트 프레임워크

## 📁 프로젝트 구조

```
src/
├── components/        # 재사용 가능한 컴포넌트
│   ├── ui/           # 기본 UI 컴포넌트
│   └── layout/       # 레이아웃 컴포넌트
├── pages/            # 페이지 컴포넌트
├── stores/           # Zustand 스토어
├── hooks/            # 커스텀 훅
├── utils/            # 유틸리티 함수
├── types/            # TypeScript 타입 정의
└── styles/           # 글로벌 스타일
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Blue (#0ea5e9)
- **Secondary**: Purple (#d946ef)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### 폰트 크기 (60대+ 고려)
- **Title**: 2rem (32px)
- **Subtitle**: 1.5rem (24px)
- **Body Large**: 1.125rem (18px)
- **Body**: 1rem (16px)

### 터치 타겟
- **최소 크기**: 44px × 44px
- **권장 크기**: 48px × 48px

## 📱 카카오톡 웹뷰 최적화

### 적용된 최적화
- 메타 태그 최적화
- 터치 이벤트 최적화
- 키보드 높이 대응
- 뒤로가기 처리
- 텍스트 선택 제어

### 테스트 방법
```bash
# 개발 서버에서 카카오톡 웹뷰 시뮬레이션
npm run dev
# 개발자 도구 콘솔에서 웹뷰 정보 확인 가능
```

## ♿ 접근성

### 적용된 접근성 기능
- ARIA 레이블 및 역할
- 키보드 네비게이션
- 스크린 리더 지원
- 고대비 모드 지원
- 포커스 관리

### 접근성 테스트
```bash
# 접근성 검사 실행
npm run test:accessibility
```

## 🔧 환경 설정

### 환경 변수
```bash
# .env 파일 생성
VITE_API_URL=http://localhost:3000/api
VITE_ENV=development
```

### API 연동
백엔드 서버가 `http://localhost:3000`에서 실행되어야 합니다.

## 📊 성능 최적화

### 적용된 최적화
- 코드 분할 (Code Splitting)
- 이미지 지연 로딩
- Gzip 압축
- 캐싱 전략
- 번들 크기 최적화

### 성능 목표
- **초기 로딩**: < 3초 (3G 네트워크)
- **인터렉션**: < 100ms
- **번들 크기**: < 500KB (초기)

## 🧪 테스트

```bash
# 단위 테스트 실행
npm run test

# 테스트 커버리지
npm run test:coverage

# 린트 검사
npm run lint

# 코드 포맷팅
npm run format
```

## 🚀 배포

### 빌드
```bash
npm run build
```

### 미리보기
```bash
npm run preview
```

## 📝 라이선스

이 프로젝트는 개인 프로젝트로 제작되었습니다.

## 🤝 기여하기

이 프로젝트는 개인 프로젝트이지만, 버그 리포트나 제안사항은 언제든 환영합니다.

---

**문답다리** - 가족과 함께하는 매일의 소중한 대화 💬