# 🚀 문답다리(Mundapdari) SuperClaude 개발 가이드

> 이 문서는 문답다리 서비스 개발 시 SuperClaude를 효과적으로 활용하기 위한 종합 가이드입니다.

## 📌 프로젝트 개요

**문답다리(Mundapdari)**는 한국 가족 간 소통 부족 문제를 해결하는 "하루 1문답" 서비스입니다.
- 부모-자녀 간 매일 하나의 질문 공유
- 카카오톡 기반 간편한 접근성
- 주간 대화 요약 카드 제공

## 🎯 개발 단계별 SuperClaude 활용법

### 📋 Phase 1: 프로젝트 초기 설정 (Week 0)

#### 1.1 프로젝트 구조 분석 및 설정
```bash
# 프로젝트 전체 구조 로드 및 분석
/load @Mundapdari/ --analyze --persona-architect

# 기술 스택 결정 및 설정
/implement "프로젝트 초기 설정" --persona-backend --seq
```

#### 1.2 아키텍처 설계
```bash
# 시스템 아키텍처 설계
/design "가족 Q&A 서비스 아키텍처" --persona-architect --think-hard --c7

# 데이터베이스 스키마 설계
/build "데이터베이스 스키마" --focus database --persona-backend
```

#### 1.3 보안 및 개인정보 보호 설계
```bash
# 보안 요구사항 분석
/analyze "개인정보 보호 및 보안" --persona-security --ultrathink

# KISA 가이드라인 준수 체크
/validate "개인정보보호 컴플라이언스" --persona-security --safe-mode
```

### 📦 Phase 2: Core MVP 구현 (Week 1-2)

#### 2.1 백엔드 개발
```bash
# API 서버 구현
/implement "Express API 서버" --persona-backend --c7
  - 사용자 인증 (JWT)
  - 페어링 시스템
  - 질문 스케줄러
  - 답변 저장/조회

# 카카오톡 API 연동
/implement "카카오톡 메시지 API 연동" --persona-backend --seq --validate

# 데이터베이스 마이그레이션
/build "SQLite 데이터베이스 마이그레이션" --persona-backend
```

#### 2.2 프론트엔드 개발
```bash
# React 웹앱 초기 설정
/build "React 웹뷰 앱" --persona-frontend --magic --c7

# 핵심 컴포넌트 구현
/implement "Q&A 답변 컴포넌트" --persona-frontend --magic
  - 질문 표시 컴포넌트
  - 답변 입력 폼
  - 상대 답변 조회 뷰
  - 모바일 반응형 디자인

# 60대+ 사용자를 위한 접근성 최적화
/improve "접근성 및 UX" --persona-frontend --focus accessibility
```

#### 2.3 테스트 구현
```bash
# 단위 테스트 작성
/test "unit tests" --persona-qa --c7

# 통합 테스트
/test "integration tests" --persona-qa --seq

# E2E 테스트 (페어링 플로우)
/test "e2e pairing flow" --persona-qa --play
```

### 🎨 Phase 3: Engagement Features (Week 3-4)

#### 3.1 주간 요약 카드 기능
```bash
# 주간 카드 생성 로직
/implement "주간 요약 카드 생성기" --persona-backend --seq

# 카드 UI 컴포넌트
/build "주간 요약 카드 UI" --persona-frontend --magic
```

#### 3.2 게이미피케이션 요소
```bash
# 스트릭(연속 참여) 시스템
/implement "스트릭 추적 시스템" --persona-backend

# 배지 및 리워드 UI
/build "배지 시스템 UI" --persona-frontend --magic
```

#### 3.3 알림 시스템
```bash
# 리마인더 알림 구현
/implement "알림 스케줄러" --persona-backend --validate

# 푸시 알림 최적화
/improve "알림 타이밍 최적화" --persona-performance --think
```

## 🛠️ 상황별 명령어 템플릿

### 🔍 디버깅 및 문제 해결
```bash
# 버그 분석
/analyze "API 응답 지연 문제" --persona-analyzer --think --seq

# 성능 이슈 해결
/troubleshoot "카카오톡 메시지 전송 실패" --persona-backend --seq

# 보안 취약점 스캔
/analyze "XSS 취약점" --persona-security --validate
```

### ⚡ 성능 최적화
```bash
# 프론트엔드 번들 최적화
/improve "React 번들 크기" --persona-performance --persona-frontend

# API 응답 속도 개선
/optimize "데이터베이스 쿼리" --persona-performance --persona-backend

# 이미지 생성 최적화 (주간 카드)
/improve "이미지 생성 성능" --persona-performance --think
```

### 📝 문서화
```bash
# API 문서 생성
/document "API 엔드포인트" --persona-scribe=ko

# 사용자 가이드 작성
/document "부모님 사용 가이드" --persona-scribe=ko --persona-mentor

# 기술 문서 작성
/document "시스템 아키텍처" --persona-architect --persona-scribe=en
```

### 🚀 배포 및 운영
```bash
# 배포 준비 체크리스트
/validate "프로덕션 배포 준비" --persona-devops --safe-mode

# CI/CD 파이프라인 설정
/implement "GitHub Actions CI/CD" --persona-devops --c7

# 모니터링 설정
/build "로깅 및 모니터링" --persona-devops --persona-backend
```

## 💡 페르소나 활용 Best Practices

### 페르소나별 주요 역할

| 페르소나 | 주요 업무 | 활용 시점 |
|---------|----------|----------|
| `--persona-architect` | 시스템 설계, 기술 결정, 확장성 검토 | 프로젝트 초기, 주요 기능 추가 시 |
| `--persona-frontend` | React 컴포넌트, 웹뷰 UI, 접근성 | UI 개발, 사용자 경험 개선 |
| `--persona-backend` | API 개발, DB 설계, 서버 로직 | 서버 개발, 데이터 처리 |
| `--persona-security` | 개인정보 보호, 보안 검증, 암호화 | 인증 구현, 데이터 보호 |
| `--persona-qa` | 테스트 전략, 품질 보증, 버그 검증 | 테스트 작성, 품질 검증 |
| `--persona-performance` | 성능 최적화, 로드 테스트, 병목 해결 | 성능 이슈, 최적화 |
| `--persona-devops` | 배포, CI/CD, 인프라, 모니터링 | 배포 준비, 운영 |
| `--persona-scribe=ko` | 한국어 문서화, 가이드 작성 | 문서 작성 |
| `--persona-analyzer` | 문제 분석, 디버깅, 근본 원인 파악 | 버그 수정, 이슈 분석 |
| `--persona-mentor` | 코드 리뷰, 교육 자료, 베스트 프랙티스 | 팀 교육, 지식 공유 |

### 복합 페르소나 활용

```bash
# 보안이 중요한 백엔드 개발
/implement "사용자 인증 시스템" --persona-backend --persona-security --validate

# 성능이 중요한 프론트엔드 개발
/build "실시간 답변 업데이트" --persona-frontend --persona-performance --magic

# 아키텍처 문서화
/document "시스템 설계 문서" --persona-architect --persona-scribe=ko
```

## 🔧 MCP 서버 활용 전략

### Context7 (`--c7`)
- **용도**: 프레임워크 패턴, 베스트 프랙티스
- **활용 예시**:
  ```bash
  /implement "React 컴포넌트 구조" --c7
  /build "Express 미들웨어" --c7
  ```

### Sequential (`--seq`)
- **용도**: 복잡한 로직 분석, 다단계 문제 해결
- **활용 예시**:
  ```bash
  /analyze "페어링 로직 흐름" --seq
  /troubleshoot "메시지 전송 실패" --seq --think
  ```

### Magic (`--magic`)
- **용도**: UI 컴포넌트 생성, 디자인 시스템
- **활용 예시**:
  ```bash
  /build "질문 카드 UI" --magic
  /implement "이모티콘 선택기" --magic --persona-frontend
  ```

### Playwright (`--play`)
- **용도**: E2E 테스트, 브라우저 자동화
- **활용 예시**:
  ```bash
  /test "전체 사용자 플로우" --play
  /test "카카오톡 웹뷰 호환성" --play --persona-qa
  ```

## 📊 프로젝트 진행 체크리스트

### Week 1-2: Core MVP
- [ ] 프로젝트 구조 설정
- [ ] 데이터베이스 스키마 구현
- [ ] 사용자 인증 시스템
- [ ] 페어링 기능
- [ ] 질문 스케줄러
- [ ] 기본 웹뷰 UI
- [ ] 카카오톡 API 연동
- [ ] 단위 테스트 작성

### Week 3-4: Engagement Features  
- [ ] 주간 요약 카드
- [ ] 스트릭 시스템
- [ ] 리마인더 알림
- [ ] 이모티콘 반응
- [ ] UI/UX 개선
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 배포 준비

### Week 5-6: Scale & Polish
- [ ] AI 질문 생성 (선택)
- [ ] 음성 답변 (선택)
- [ ] 프리미엄 기능 (선택)
- [ ] 모니터링 설정
- [ ] 문서화 완성
- [ ] 프로덕션 배포

## 🚨 주의사항 및 팁

### 보안 고려사항
```bash
# 항상 보안 검증과 함께 구현
/implement "민감 데이터 처리" --persona-security --validate --safe-mode

# 개인정보 암호화 필수
/build "전화번호 암호화" --persona-security --persona-backend
```

### 성능 목표
- API 응답: < 200ms
- 페이지 로드: < 3초 (3G)
- 메시지 전송: 09:00 ±5분
- 에러율: < 1%

### 테스트 커버리지
```bash
# 목표: 80% 이상 커버리지
/test "coverage report" --persona-qa
```

### 반복 개선
```bash
# 주기적인 코드 품질 개선
/improve "코드 품질" --loop --iterations 3 --persona-refactorer

# 성능 모니터링 및 개선
/analyze "성능 메트릭" --persona-performance --wave-mode
```

## 📚 참고 자료

- [PRD Draft](./PRD%20draft.md) - 초기 요구사항 문서
- [PRD by Claude](./PRD%20(by%20Claude).md) - 상세 구현 계획
- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) - 기술 아키텍처 문서
- [카카오 개발자 문서](https://developers.kakao.com/)

## 🎉 프로젝트 성공을 위한 핵심 포인트

1. **단순함 유지**: MVP는 핵심 기능에만 집중
2. **사용자 중심**: 60대 부모님도 쉽게 사용할 수 있는 UI
3. **안정성 우선**: 매일 정확한 시간에 메시지 전송
4. **개인정보 보호**: KISA 가이드라인 준수
5. **점진적 개선**: 사용자 피드백 기반 반복 개선

---

> 💬 이 가이드는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.
> SuperClaude의 모든 기능을 활용하여 효율적인 개발을 진행하세요!