# 🌉 문답다리(Mundapdari) Backend API

부모와 자녀를 연결하는 일일 질문 답변 서비스의 백엔드 API 서버입니다.

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 18.x 이상
- SQLite (개발환경) 또는 PostgreSQL (운영환경)  
- Redis (선택사항, 캐싱 및 큐)

### 설치 및 실행

1. **의존성 설치**
```bash
cd backend
npm install
```

2. **환경변수 설정**
```bash
cp ../.env.example .env
# .env 파일을 편집하여 필요한 값들을 설정하세요
```

3. **데이터베이스 초기화**
```bash
# 마이그레이션 실행
npm run db:migrate

# 초기 데이터 시딩 (질문 데이터 + 개발용 테스트 데이터)
npm run db:seed
```

4. **개발 서버 실행**
```bash
npm run dev
```

서버가 실행되면 http://localhost:3000 에서 API에 접근할 수 있습니다.

## 📋 사용 가능한 스크립트

### 개발
- `npm run dev` - 개발 서버 실행 (nodemon 사용)
- `npm start` - 프로덕션 서버 실행
- `npm test` - 테스트 실행
- `npm run lint` - 코드 린팅

### 데이터베이스
- `npm run db:migrate` - 마이그레이션 실행
- `npm run db:migrate status` - 마이그레이션 상태 확인
- `npm run db:seed` - 초기 데이터 시딩
- `npm run db:reset` - 데이터베이스 초기화 (주의: 모든 데이터 삭제)

## 🗄️ 데이터베이스

### 개발 환경 (SQLite)
- 데이터베이스 파일: `./database/mundapdari.db`
- 자동으로 생성되며 별도 설치 불필요

### 운영 환경 (PostgreSQL)
환경변수 설정:
```
NODE_ENV=production
DB_HOST=your-postgres-host
DB_NAME=mundapdari
DB_USER=your-username
DB_PASSWORD=your-password
```

## 🔧 주요 기능

### 인증 시스템
- JWT 기반 토큰 인증
- 전화번호 기반 사용자 등록
- 초대 링크를 통한 페어링

### 질문/답변 시스템
- 일일 질문 자동 선택
- 답변 작성 및 수정
- 이모지 리액션

### 알림 시스템
- Bull Queue 기반 비동기 처리
- 일일 질문 알림 스케줄링
- 답변 알림

### 보안 기능
- 전화번호 암호화 저장
- Rate limiting
- CORS 설정
- Helmet 보안 헤더

## 📚 API 문서

### 인증 API
```
POST /api/auth/register     # 사용자 등록
POST /api/auth/invite       # 초대 링크 생성
POST /api/auth/accept       # 초대 수락
GET  /api/auth/verify       # 토큰 검증
POST /api/auth/refresh      # 토큰 갱신
```

### 질문 API
```
GET /api/questions/today    # 오늘의 질문
GET /api/questions/:id      # 특정 질문 조회
GET /api/questions          # 질문 목록 (페이징)
```

### 답변 API  
```
POST /api/answers                           # 답변 작성
GET  /api/answers/question/:questionId      # 특정 질문의 답변들
PUT  /api/answers/:id                       # 답변 수정
POST /api/answers/:id/reaction              # 리액션 추가
```

### 시스템 API
```
GET /api/health            # 헬스 체크
GET /api/health/detailed   # 상세 헬스 체크
```

## 🔑 환경변수

주요 환경변수들:

```bash
# 애플리케이션
NODE_ENV=development
PORT=3000

# 데이터베이스
DB_HOST=localhost
DB_NAME=mundapdari
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# 암호화
ENCRYPTION_KEY=32-character-hex-key

# Redis (선택사항)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🏗️ 프로젝트 구조

```
backend/
├── src/
│   ├── config/          # 설정 파일들
│   ├── controllers/     # 라우트 핸들러
│   ├── middleware/      # 미들웨어 함수들
│   ├── models/          # 데이터베이스 모델
│   ├── routes/          # 라우트 정의
│   ├── services/        # 비즈니스 로직
│   ├── utils/           # 유틸리티 함수들
│   └── index.js         # 애플리케이션 진입점
├── database/
│   └── migrations/      # 데이터베이스 마이그레이션
├── scripts/             # 유틸리티 스크립트
├── logs/                # 로그 파일들
└── package.json
```

## 🧪 테스트

```bash
# 모든 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage

# 테스트 감시 모드
npm run test:watch
```

## 📝 로깅

로그는 다음 위치에 저장됩니다:
- `logs/error.log` - 에러 로그
- `logs/combined.log` - 모든 로그
- 개발환경에서는 콘솔에도 출력

## 🔄 데이터베이스 관리

### 전체 초기화
```bash
# 주의: 모든 데이터가 삭제됩니다
npm run db:reset -- --confirm
```

### 개발 데이터만 재설정
```bash
npm run db:seed clear -- --confirm
npm run db:seed
```

### 마이그레이션 상태 확인
```bash
npm run db:migrate status
```

## 🚀 배포

### Docker 빌드
```bash
docker build -t mundapdari-backend .
docker run -p 3000:3000 mundapdari-backend
```

### 환경별 설정
- **개발**: SQLite + 로컬 Redis
- **스테이징**: PostgreSQL + Redis
- **운영**: PostgreSQL + Redis + 모니터링

## 🐛 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   ```bash
   # 다른 포트 사용
   PORT=3001 npm run dev
   ```

2. **데이터베이스 연결 실패**
   ```bash
   # 환경변수 확인
   npm run db:migrate status
   ```

3. **Redis 연결 실패**
   - Redis가 설치되지 않은 경우 알림 기능이 비활성화됩니다
   - 개발환경에서는 선택사항입니다

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. Node.js 버전 (18.x 이상)
2. 환경변수 설정
3. 데이터베이스 연결
4. 로그 파일 (`logs/error.log`)

## 🔐 보안 고려사항

- 운영환경에서는 강력한 JWT 시크릿 키 사용
- 암호화 키는 32바이트 hex 문자열 사용
- CORS 설정을 프론트엔드 도메인으로 제한
- Rate limiting 설정 조정
- 전화번호 등 민감정보는 암호화하여 저장

## 📈 모니터링

- Health check: `/api/health`
- 상세 모니터링: `/api/health/detailed`
- 성능 메트릭: `/api/health/metrics`

## 🤝 기여

1. 코드 스타일: ESLint + Prettier
2. 커밋 메시지: Conventional Commits
3. 테스트: 새 기능에 대한 테스트 작성 필수

---

더 자세한 정보는 [Technical Architecture 문서](../TECHNICAL_ARCHITECTURE.md)를 참조하세요.