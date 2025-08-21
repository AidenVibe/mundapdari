# 🌉 문답다리 (Mundapdari)

> **하루 1문답으로 이어지는 가족의 마음**  
> 부모와 자녀 간 일상 대화를 통해 유대감을 형성하는 가족 소통 서비스

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 📌 프로젝트 소개

문답다리는 한국 가족 간 소통 부족 문제를 해결하기 위한 **"하루 1문답"** 서비스입니다.

### 🎯 핵심 기능

- 📱 **카카오톡 기반 접근성**: 별도 앱 설치 없이 카카오톡으로 간편 이용
- ⏰ **매일 정시 질문 발송**: 부담 없는 하나의 질문으로 대화 시작
- 💕 **1:1 페어링**: 부모-자녀 간 안전한 개인 대화 공간
- 📊 **주간 요약 카드**: 일주일간의 대화를 예쁜 카드로 추억 보관
- 🏆 **스트릭 시스템**: 연속 참여를 통한 습관 형성

### 📊 문제 정의

- 따로 사는 자녀들이 부모와 주 2.2회만 통화하는 현실
- 60대 부모 세대 스마트폰 보유율 96%의 높은 디지털 접근성
- 세대 간 자연스러운 대화 소재 부족

## 🚀 시작하기

### 📋 시스템 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상
- **PostgreSQL**: 14 이상 (프로덕션)
- **Redis**: 6 이상 (세션 관리)

### 🛠️ 로컬 개발 환경 설정

#### 1. 저장소 클론

```bash
git clone https://github.com/AidenVibe/mundapdari.git
cd mundapdari
```

#### 2. 환경 변수 설정

```bash
cp .env.example .env
# ⚠️ 중요: .env 파일을 열어 보안 가이드에 따라 실제 값들을 설정하세요
# 🔑 키 생성: openssl rand -hex 32 (JWT/암호화 키용)
```

#### 3. 의존성 설치

```bash
# 루트에서 모든 패키지 설치
npm install

# 또는 개별 설치
cd backend && npm install
cd ../frontend && npm install
```

#### 4. 데이터베이스 설정

```bash
# 데이터베이스 마이그레이션
npm run db:migrate

# 초기 데이터 시드
npm run db:seed
```

#### 5. 개발 서버 시작

```bash
# 프론트엔드 + 백엔드 동시 실행
npm run dev

# 또는 개별 실행
npm run dev:backend  # http://localhost:3000
npm run dev:frontend # http://localhost:5173
```

### 🧪 테스트 실행

```bash
# 전체 테스트
npm test

# 커버리지 포함 테스트
npm run test:coverage

# E2E 테스트
npm run test:e2e
```

## 🏗️ 프로젝트 구조

```
mundapdari/
├── 📁 backend/                 # Node.js Express API 서버
│   ├── src/
│   │   ├── controllers/        # API 컨트롤러
│   │   ├── models/            # 데이터 모델
│   │   ├── services/          # 비즈니스 로직
│   │   ├── routes/            # API 라우트
│   │   ├── middleware/        # Express 미들웨어
│   │   └── utils/             # 유틸리티 함수
│   └── package.json
├── 📁 frontend/               # React 웹 애플리케이션
│   ├── src/
│   │   ├── components/        # React 컴포넌트
│   │   ├── pages/            # 페이지 컴포넌트
│   │   ├── hooks/            # 커스텀 훅
│   │   ├── utils/            # 유틸리티 함수
│   │   └── styles/           # 스타일 파일
│   └── package.json
├── 📁 database/              # 데이터베이스 관련
│   ├── migrations/           # DB 마이그레이션
│   └── seeds/               # 초기 데이터
├── 📁 docs/                  # 프로젝트 문서
├── 📁 tests/                 # E2E 테스트
├── 📁 scripts/               # 유틸리티 스크립트
├── 📄 SUPERCLAUDE_GUIDE.md   # SuperClaude 개발 가이드
├── 📄 TECHNICAL_ARCHITECTURE.md # 기술 아키텍처 문서
└── 📄 package.json          # 워크스페이스 설정
```

## 🔧 개발 가이드

### SuperClaude 활용법

이 프로젝트는 **SuperClaude**를 활용한 효율적인 개발을 지원합니다.  
자세한 활용법은 [`SUPERCLAUDE_GUIDE.md`](./SUPERCLAUDE_GUIDE.md)를 참조하세요.

#### 주요 명령어 예시:

```bash
# 백엔드 API 구현
/implement "사용자 인증 API" --persona-backend --persona-security --validate

# 프론트엔드 컴포넌트 개발
/build "질문 카드 UI" --persona-frontend --magic --c7

# 통합 테스트
/test "페어링 플로우 E2E" --persona-qa --play

# 성능 최적화
/improve "API 응답 속도" --persona-performance --think
```

### 🎨 기술 스택

#### Backend

- **런타임**: Node.js 18+
- **프레임워크**: Express.js
- **데이터베이스**: PostgreSQL (프로덕션), SQLite (개발)
- **캐시**: Redis
- **인증**: JWT + bcrypt
- **스케줄러**: node-cron + Bull Queue
- **API 문서**: OpenAPI/Swagger

#### Frontend

- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite
- **상태 관리**: Zustand + React Query
- **스타일링**: Tailwind CSS + Emotion
- **라우팅**: React Router v6
- **폼 관리**: React Hook Form

#### DevOps & Tools

- **컨테이너**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **모니터링**: Sentry + Winston
- **테스팅**: Jest + Vitest + Playwright
- **코드 품질**: ESLint + Prettier + Husky

## 📱 API 문서

개발 서버 실행 후 다음 경로에서 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:3000/api-docs
- **기술 아키텍처**: [`TECHNICAL_ARCHITECTURE.md`](./TECHNICAL_ARCHITECTURE.md)

### 주요 API 엔드포인트

| Method | Endpoint                | 설명             |
| ------ | ----------------------- | ---------------- |
| POST   | `/api/auth/invite`      | 초대 링크 생성   |
| POST   | `/api/auth/accept`      | 초대 수락        |
| GET    | `/api/questions/today`  | 오늘의 질문 조회 |
| POST   | `/api/answers`          | 답변 제출        |
| GET    | `/api/summaries/weekly` | 주간 요약 조회   |

## 🚀 배포

### 환경별 배포

#### 개발 환경

```bash
npm run dev
```

#### 스테이징 환경

```bash
# Docker Compose 사용
npm run docker:build
npm run docker:up
```

#### 프로덕션 환경

```bash
# 빌드
npm run build

# 프로덕션 시작
npm start
```

### 환경 변수 설정

각 환경별로 필요한 환경 변수들:

- **필수**: `JWT_SECRET`, `DB_HOST`, `KAKAO_REST_API_KEY`
- **카카오톡 API**: `KAKAO_REST_API_KEY`, `KAKAO_JAVASCRIPT_KEY`
- **데이터베이스**: `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- **Redis**: `REDIS_HOST`, `REDIS_PORT`

자세한 환경 변수 목록은 [`.env.example`](./.env.example)을 참조하세요.

## 🧪 테스트

### 테스트 전략

- **Unit Tests**: 80% 커버리지 목표
- **Integration Tests**: API 엔드포인트 테스트
- **E2E Tests**: 주요 사용자 플로우 테스트

### 테스트 실행

```bash
# 전체 테스트
npm test

# 백엔드 테스트
npm run test:backend

# 프론트엔드 테스트
npm run test:frontend

# E2E 테스트
npm run test:e2e

# 커버리지 리포트
npm run test:coverage
```

## 📊 모니터링 및 로깅

### 핵심 메트릭

- **사용자 메트릭**: DAU, 질문 응답률, 페어 유지율
- **기술 메트릭**: API 응답 시간, 에러율, 메시지 전송 성공률
- **비즈니스 메트릭**: 주간 완료율, 평균 답변 길이

### 로깅

- **개발**: Console + File 로깅
- **프로덕션**: Winston + Sentry 연동

## 🤝 기여하기

### 개발 프로세스

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성 (`feature/기능명`)
3. 코드 작성 및 테스트
4. Pull Request 생성
5. 코드 리뷰 후 병합

### 커밋 컨벤션

```
타입(범위): 제목

- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- test: 테스트 추가/수정
- chore: 빌드/패키지 관리
```

### 코드 스타일

- **ESLint**: Airbnb 스타일 가이드 기반
- **Prettier**: 코드 포맷팅 자동화
- **Pre-commit Hook**: Husky + lint-staged

## 🔒 보안 가이드

### 환경변수 보안

- ⚠️ **절대 금지**: `.env` 파일을 Git에 커밋하지 마세요
- 🔑 **키 생성**: 강력한 랜덤 키 사용 (`openssl rand -hex 32`)
- 🚧 **운영 분리**: 개발/스테이징/운영 환경별 다른 키 사용
- 🔄 **정기 교체**: 보안 키를 주기적으로 교체하세요

### API 키 관리

- 카카오 API 키는 개발자 콘솔에서 발급받은 실제 값 사용
- AWS 자격증명은 최소 권한 원칙에 따라 IAM 설정
- Sentry DSN은 프로젝트 설정에서 확인

### Git 보안

- 포괄적인 `.gitignore`로 민감정보 자동 제외
- Husky pre-commit 훅으로 코드 품질 자동 검사
- 커밋 전 `git status`로 민감정보 포함 여부 확인

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

## 📞 문의 및 지원

- **이슈 신고**: [GitHub Issues](https://github.com/AidenVibe/mundapdari/issues)
- **기능 제안**: [GitHub Discussions](https://github.com/AidenVibe/mundapdari/discussions)
- **이메일**: dev@mundapdari.com

## 🎉 감사의 말

문답다리 서비스는 가족 간 소통의 중요성을 믿고 개발되었습니다.  
더 많은 가족이 따뜻한 대화를 나눌 수 있기를 희망합니다.

---

<div align="center">

**🌉 문답다리와 함께 가족의 마음을 이어보세요**

Made with ❤️ by [Your Name]

</div>
