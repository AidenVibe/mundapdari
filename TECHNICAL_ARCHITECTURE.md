# 🏗️ 문답다리(Mundapdari) 기술 아키텍처 문서

## 1. 시스템 개요

### 1.1 아키텍처 다이어그램
```
┌─────────────────────────────────────────────────────────────────┐
│                         사용자 (부모/자녀)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   카카오톡 앱    │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼──────┐         ┌───────▼──────┐
        │ 카카오톡 메시지│         │   웹뷰 (React)│
        │   (알림톡)    │         └───────┬──────┘
        └───────┬──────┘                 │
                │                         │
                └────────┬────────────────┘
                         │
                ┌────────▼────────┐
                │   API Gateway   │
                │   (Express.js)  │
                └────────┬────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐ ┌───────▼──────┐ ┌──────▼───────┐
│ Auth Service │ │  Q&A Service  │ │Message Service│
└───────┬──────┘ └───────┬──────┘ └──────┬───────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                ┌────────▼────────┐
                │   PostgreSQL    │
                │   (Database)    │
                └─────────────────┘
```

### 1.2 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| **Frontend** | React 18 | 컴포넌트 재사용성, 카카오톡 웹뷰 호환성 |
| **Backend** | Node.js + Express | 빠른 개발, JavaScript 통일성 |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) | 관계형 데이터, 확장성 |
| **Cache** | Redis | 세션 관리, 임시 토큰 저장 |
| **Message Queue** | Bull Queue | 메시지 스케줄링, 재시도 로직 |
| **File Storage** | AWS S3 | 주간 카드 이미지 저장 |
| **Monitoring** | Winston + Sentry | 로깅 및 에러 트래킹 |

## 2. 데이터베이스 설계

### 2.1 ERD (Entity Relationship Diagram)
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Users     │     │    Pairs     │     │  Questions   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │────<│ parent_id(FK)│     │ id (PK)      │
│ phone        │     │ child_id(FK) │     │ content      │
│ name         │────<│ status       │     │ category     │
│ role         │     │ created_at   │     │ order        │
│ created_at   │     │ updated_at   │     │ active       │
│ last_active  │     └──────────────┘     │ created_at   │
└──────────────┘              │            └──────────────┘
        │                     │                    │
        │              ┌──────▼───────┐           │
        │              │   Answers    │           │
        │              ├──────────────┤           │
        └─────────────>│ id (PK)      │<──────────┘
                       │ question_id  │
                       │ user_id (FK) │
                       │ pair_id (FK) │
                       │ content      │
                       │ answered_at  │
                       └──────────────┘
                              │
                       ┌──────▼───────┐
                       │  Reactions   │
                       ├──────────────┤
                       │ id (PK)      │
                       │ answer_id(FK)│
                       │ user_id (FK) │
                       │ emoji        │
                       │ created_at   │
                       └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Streaks    │     │ WeeklySummary│     │ Notifications│
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ pair_id (FK) │     │ pair_id (FK) │     │ user_id (FK) │
│ current_days │     │ week_start   │     │ type         │
│ max_days     │     │ week_end     │     │ scheduled_at │
│ last_update  │     │ card_url     │     │ sent_at      │
└──────────────┘     │ created_at   │     │ status       │
                     └──────────────┘     └──────────────┘
```

### 2.2 데이터베이스 스키마

```sql
-- Users 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL, -- 암호화 저장
    name VARCHAR(50) NOT NULL,
    role ENUM('parent', 'child') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Pairs 테이블
CREATE TABLE pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id),
    child_id UUID REFERENCES users(id),
    status ENUM('pending', 'active', 'inactive') DEFAULT 'pending',
    invitation_token VARCHAR(64) UNIQUE,
    invitation_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, child_id)
);

-- Questions 테이블
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    category VARCHAR(20),
    order_num INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Answers 테이블
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id),
    user_id UUID REFERENCES users(id),
    pair_id UUID REFERENCES pairs(id),
    content TEXT CHECK (char_length(content) <= 500),
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_pair_question (pair_id, question_id)
);

-- Reactions 테이블
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID REFERENCES answers(id),
    user_id UUID REFERENCES users(id),
    emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(answer_id, user_id)
);

-- Streaks 테이블
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pair_id UUID REFERENCES pairs(id) UNIQUE,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_activity DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WeeklySummaries 테이블
CREATE TABLE weekly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pair_id UUID REFERENCES pairs(id),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    summary_data JSONB, -- 주간 Q&A 데이터
    card_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pair_id, week_start)
);
```

## 3. API 설계

### 3.1 RESTful API 엔드포인트

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| **인증 & 페어링** |
| POST | `/api/auth/register` | 사용자 등록 | No |
| POST | `/api/auth/invite` | 초대 링크 생성 | Yes |
| POST | `/api/auth/accept` | 초대 수락 | No |
| GET | `/api/auth/verify` | 토큰 검증 | Yes |
| **질문 & 답변** |
| GET | `/api/questions/today` | 오늘의 질문 조회 | Yes |
| POST | `/api/answers` | 답변 제출 | Yes |
| GET | `/api/answers/:questionId` | 답변 조회 | Yes |
| PUT | `/api/answers/:answerId` | 답변 수정 | Yes |
| POST | `/api/answers/:answerId/reaction` | 리액션 추가 | Yes |
| **통계 & 요약** |
| GET | `/api/stats/streak` | 스트릭 조회 | Yes |
| GET | `/api/summaries/weekly` | 주간 요약 조회 | Yes |
| POST | `/api/summaries/generate` | 주간 카드 생성 | System |
| **알림** |
| POST | `/api/notifications/schedule` | 알림 예약 | System |
| POST | `/api/notifications/send` | 즉시 알림 발송 | System |

### 3.2 API 요청/응답 예시

#### 초대 링크 생성
```javascript
// Request
POST /api/auth/invite
{
  "inviter_phone": "010-1234-5678",
  "inviter_name": "김민준",
  "inviter_role": "child"
}

// Response
{
  "success": true,
  "data": {
    "invitation_url": "https://mundapdari.com/invite/a1b2c3d4e5f6",
    "expires_at": "2024-01-16T09:00:00Z"
  }
}
```

#### 오늘의 질문 조회
```javascript
// Request
GET /api/questions/today
Headers: { "Authorization": "Bearer {token}" }

// Response
{
  "success": true,
  "data": {
    "question": {
      "id": "q123",
      "content": "오늘 가장 감사했던 순간은 무엇인가요?",
      "category": "gratitude"
    },
    "my_answer": null,
    "partner_answer": {
      "content": "아침에 네가 전화해줘서 고마웠어",
      "answered_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

## 4. 보안 설계

### 4.1 보안 아키텍처
```
┌──────────────────────────────────────────────────┐
│                   HTTPS (TLS 1.3)                │
├──────────────────────────────────────────────────┤
│                   Rate Limiting                   │
│               (100 req/min per IP)               │
├──────────────────────────────────────────────────┤
│                  CORS Protection                  │
│            (Whitelist: kakao domains)            │
├──────────────────────────────────────────────────┤
│                  JWT Authentication               │
│              (Access + Refresh Token)            │
├──────────────────────────────────────────────────┤
│                Input Validation                   │
│           (Joi schemas, XSS prevention)          │
├──────────────────────────────────────────────────┤
│              Data Encryption at Rest              │
│              (AES-256 for PII data)              │
└──────────────────────────────────────────────────┘
```

### 4.2 보안 구현 세부사항

| 보안 영역 | 구현 방법 | 도구/라이브러리 |
|-----------|----------|----------------|
| **인증** | JWT 기반 인증 | jsonwebtoken, bcrypt |
| **암호화** | 전화번호 암호화 | crypto (AES-256-GCM) |
| **세션 관리** | Redis 세션 스토어 | express-session, redis |
| **입력 검증** | Schema 검증 | Joi, express-validator |
| **XSS 방지** | 입력 새니타이징 | DOMPurify, helmet |
| **CSRF 방지** | CSRF 토큰 | csurf |
| **SQL Injection** | Prepared Statements | pg (parameterized queries) |
| **Rate Limiting** | IP 기반 제한 | express-rate-limit |
| **로깅** | 보안 이벤트 로깅 | winston, morgan |

### 4.3 개인정보 보호

```javascript
// 전화번호 암호화 예시
const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 5. 인프라 및 배포

### 5.1 배포 아키텍처
```
┌────────────────────────────────────────────────────┐
│                   CloudFlare CDN                   │
└────────────────────┬───────────────────────────────┘
                     │
            ┌────────▼────────┐
            │   AWS ALB       │
            │ (Load Balancer) │
            └────────┬────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────┐         ┌───────▼──────┐
│   EC2 #1     │         │   EC2 #2     │
│  Node.js App │         │  Node.js App │
└───────┬──────┘         └───────┬──────┘
        │                         │
        └────────┬────────────────┘
                 │
         ┌───────▼──────┐
         │   AWS RDS    │
         │ (PostgreSQL) │
         └───────┬──────┘
                 │
         ┌───────▼──────┐
         │  AWS S3      │
         │ (Image Store)│
         └──────────────┘
```

### 5.2 환경별 구성

| 환경 | 용도 | 인프라 | 데이터베이스 |
|-----|------|--------|-------------|
| **Development** | 로컬 개발 | localhost:3000 | SQLite |
| **Staging** | 테스트/QA | AWS t3.micro | PostgreSQL (RDS) |
| **Production** | 실서비스 | AWS t3.medium x2 | PostgreSQL (RDS) |

### 5.3 CI/CD 파이프라인

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm install
          npm test
          npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS
        run: |
          # Docker 빌드 및 ECR 푸시
          docker build -t mundapdari .
          docker push $ECR_REGISTRY/mundapdari:latest
          
          # ECS 서비스 업데이트
          aws ecs update-service --cluster prod --service mundapdari
```

## 6. 성능 최적화

### 6.1 캐싱 전략

| 캐시 레벨 | 대상 | TTL | 구현 |
|-----------|------|-----|------|
| **CDN** | 정적 자원 | 7일 | CloudFlare |
| **Redis** | 세션 데이터 | 24시간 | Redis |
| **Application** | 질문 목록 | 1시간 | Node.js Memory |
| **Database** | 자주 조회되는 쿼리 | 5분 | PostgreSQL |

### 6.2 데이터베이스 최적화

```sql
-- 인덱스 생성
CREATE INDEX idx_answers_pair_date ON answers(pair_id, answered_at DESC);
CREATE INDEX idx_pairs_status ON pairs(status) WHERE status = 'active';
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at) 
  WHERE status = 'pending';

-- 파티셔닝 (월별)
CREATE TABLE answers_2024_01 PARTITION OF answers
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 6.3 프론트엔드 최적화

```javascript
// React 컴포넌트 최적화
import { lazy, Suspense, memo } from 'react';

// Code Splitting
const WeeklySummary = lazy(() => import('./components/WeeklySummary'));

// Memoization
const QuestionCard = memo(({ question, answer }) => {
  return (
    <div className="question-card">
      {/* ... */}
    </div>
  );
});

// 이미지 최적화
<img 
  src="/api/images/card.webp" 
  loading="lazy"
  decoding="async"
  alt="주간 요약 카드"
/>
```

## 7. 모니터링 및 로깅

### 7.1 모니터링 스택

| 도구 | 용도 | 메트릭 |
|------|------|--------|
| **AWS CloudWatch** | 인프라 모니터링 | CPU, Memory, Network |
| **Sentry** | 에러 트래킹 | JavaScript/Node.js 에러 |
| **Winston** | 애플리케이션 로깅 | API 요청, 비즈니스 로직 |
| **Grafana** | 대시보드 | 종합 메트릭 시각화 |

### 7.2 핵심 모니터링 지표

```javascript
// 모니터링 설정
const metrics = {
  // 비즈니스 메트릭
  dailyActiveUsers: gauge('daily_active_users'),
  questionResponseRate: gauge('question_response_rate'),
  averageResponseTime: histogram('api_response_time'),
  
  // 기술 메트릭
  messageDeliveryRate: gauge('message_delivery_rate'),
  databaseQueryTime: histogram('db_query_time'),
  cacheHitRate: gauge('cache_hit_rate'),
  
  // 에러 메트릭
  errorRate: counter('error_rate'),
  failedMessages: counter('failed_messages')
};
```

## 8. 확장성 고려사항

### 8.1 수평 확장 전략

- **Stateless 설계**: 서버 인스턴스 간 상태 공유 없음
- **Load Balancing**: AWS ALB를 통한 트래픽 분산
- **Database Connection Pooling**: pg-pool 사용
- **Message Queue**: Bull Queue로 비동기 처리

### 8.2 마이크로서비스 전환 계획

```
현재 (Monolith)          →    미래 (Microservices)
┌──────────────┐              ┌──────────────┐
│              │              │ Auth Service │
│   Monolith   │              ├──────────────┤
│   Express    │      →       │ Q&A Service  │
│     App      │              ├──────────────┤
│              │              │Message Service│
└──────────────┘              ├──────────────┤
                              │Summary Service│
                              └──────────────┘
```

## 9. 개발 환경 설정

### 9.1 필요 도구
- Node.js 18.x LTS
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose
- Git

### 9.2 로컬 개발 시작하기

```bash
# 1. 저장소 클론
git clone https://github.com/yourusername/mundapdari.git
cd mundapdari

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일 편집하여 필요한 값 설정

# 3. 의존성 설치
npm install

# 4. 데이터베이스 마이그레이션
npm run db:migrate

# 5. 개발 서버 시작
npm run dev

# 6. 테스트 실행
npm test
```

## 10. 테스트 전략

### 10.1 테스트 피라미드

```
         /\
        /E2E\        (10%)
       /------\
      /Integration\  (30%)
     /------------\
    /   Unit Tests  \ (60%)
   /----------------\
```

### 10.2 테스트 커버리지 목표

| 테스트 유형 | 커버리지 목표 | 도구 |
|------------|--------------|------|
| Unit Tests | 80% | Jest |
| Integration | 70% | Supertest |
| E2E | Critical paths | Playwright |

---

> 📝 이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.