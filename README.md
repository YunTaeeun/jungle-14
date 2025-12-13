# 게시판 프로젝트

NestJS + Next.js를 사용한 풀스택 게시판 애플리케이션

## 🚀 기술 스택

### Backend
- **NestJS** - Node.js 프레임워크
- **TypeORM** - ORM
- **PostgreSQL** - 데이터베이스 (Docker)
- **JWT** - 인증/인가
- **bcrypt** - 비밀번호 해싱
- **Passport** - 인증 미들웨어

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**

---

## ✨ 주요 기능

### 🔐 인증 시스템
- JWT 기반 회원가입/로그인
- 비밀번호 bcrypt 해싱
- Protected Routes (Guards)
- localStorage 기반 토큰 관리

### 📝 게시물 관리
- CRUD (생성, 조회, 수정, 삭제)
- 본인 게시물만 수정/삭제 가능 (권한 체크)
- User와 ManyToOne 관계
- 작성자 정보 표시 (nickname 우선)

### 👤 사용자 관리
- 프로필 조회
- 닉네임 설정 (중복 불가)
- 이메일/비밀번호 변경
- 내 게시물 목록

### 🏗️ 아키텍처
- **Repository 패턴** - DB 접근 로직 분리
- **Service 레이어** - 비즈니스 로직만 처리
- **HTTP Logging Interceptor** - 모든 요청/응답 로깅

### 🎨 UI/UX
- 미니멀 디자인
- 반응형 레이아웃
- 로그인 상태별 네비게이션
- 3열 그리드 게시물 목록

---

## 📁 프로젝트 구조

```
.
├── client/                 # Next.js Frontend
│   ├── app/
│   │   ├── login/         # 로그인
│   │   ├── register/      # 회원가입
│   │   ├── write/         # 글쓰기
│   │   ├── post/[id]/     # 게시물 상세
│   │   │   └── edit/      # 게시물 수정
│   │   ├── profile/       # 내정보
│   │   └── settings/      # 계정 설정
│   ├── components/
│   │   └── Navigation.tsx
│   └── types/
│       └── index.ts       # TypeScript 타입 정의
│
└── server/                # NestJS Backend
    ├── src/
    │   ├── auth/          # 인증 모듈
    │   │   ├── dto/
    │   │   ├── strategies/
    │   │   └── guards/
    │   ├── users/         # 사용자 모듈
    │   │   └── users.repository.ts  # Custom Repository
    │   ├── posts/         # 게시물 모듈
    │   │   └── posts.repository.ts  # Custom Repository
    │   └── logging.interceptor.ts   # HTTP 로깅
    └── .env               # 환경변수
```

---

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

### 2. PostgreSQL 설정 (Docker)

**Docker로 PostgreSQL 실행**:
```bash
docker run --name jungle-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

**데이터베이스 생성**:
```bash
docker exec -it jungle-postgres psql -U postgres -c "CREATE DATABASE jungle_board;"
```

**자동 재시작 설정**:
```bash
docker update --restart=unless-stopped jungle-postgres
```

### 3. 환경변수 설정

`server/.env` 파일 생성:
```env
JWT_SECRET=your-super-secret-key
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=jungle_board
```

### 4. 서버 실행

```bash
# Backend (포트 3000) - Docker 자동 시작
cd server
npm run start:dev

# Frontend (포트 3001)
cd client
npm run dev
```

### 5. 접속

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000

---

## 📡 API 엔드포인트

### 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인

### 사용자
- `GET /users/me` - 내 정보 (인증 필요)
- `PATCH /users/profile` - 프로필 수정 (인증 필요)
- `GET /users/:id` - 사용자 조회

### 게시물
- `GET /posts` - 전체 조회
- `GET /posts/:id` - 단일 조회
- `POST /posts` - 생성 (인증 필요)
- `PATCH /posts/:id` - 수정 (본인만)
- `DELETE /posts/:id` - 삭제 (본인만)

---

## 🔧 개발 도구

### HTTP 로깅
모든 HTTP 요청/응답이 터미널에 실시간 표시:
```
[HTTP] ➡️  POST /auth/login
[HTTP] ✅ POST /auth/login - 156ms
```

### PostgreSQL 확인
```bash
# VS Code 확장: PostgreSQL (cweijan.vscode-postgresql-client2)
# 또는 명령어:
docker exec -it jungle-postgres psql -U postgres -d jungle_board
```

---

## 📊 데이터베이스 스키마

### User
- `id` - Primary Key
- `username` - 유니크, 로그인 ID
- `email` - 유니크
- `password` - bcrypt 해싱
- `nickname` - 유니크, 선택사항
- `createdAt`

### Post
- `id` - Primary Key
- `title`
- `content`
- `author` - User와 ManyToOne 관계
- `createdAt`
- `updatedAt`

---

## 🏗️ 아키텍처 패턴

### Repository 패턴
```
Controller → Service → Repository → TypeORM → PostgreSQL
```

**장점**:
- DB 쿼리 로직 분리
- Service는 비즈니스 로직만 집중
- 테스트 용이
- 코드 재사용성 증가

---

## 🚀 배포 전 체크리스트

- [ ] `.env` 파일에 강력한 JWT_SECRET 설정
- [ ] CORS origin을 프로덕션 도메인으로 변경
- [ ] TypeORM `synchronize: false` 설정
- [ ] 프로덕션 로깅 레벨 조정
- [ ] httpOnly 쿠키 사용 고려 (보안)
- [ ] PostgreSQL 프로덕션 DB 설정

---

## 📝 TODO

### 🔥 우선순위 높음
- [ ] 댓글 기능 (CommentsModule 활성화)
- [ ] 페이지네이션 (무한 스크롤 or 페이지 번호)
- [ ] 검색 기능 (제목/내용/작성자)
- [ ] 조회수 기능

### 🎨 UX 개선
- [ ] 이미지 업로드 (게시물 첨부)
- [ ] 좋아요/추천 기능
- [ ] 글씨체 변경 (Pretendard, Noto Sans 등)
- [ ] 글 작성 시 서식 (중앙 정렬, 굵게, 기울임)
- [ ] 다크 모드

### 📱 반응형
- [ ] 모바일 최적화
- [ ] 태블릿 레이아웃

### 🔐 보안
- [ ] httpOnly 쿠키 (XSS 방지)
- [ ] CSRF 토큰
- [ ] Rate Limiting (API 요청 제한)

### 🚀 성능
- [ ] Redis 캐싱
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 코드 스플리팅

### 🧪 테스트
- [ ] 유닛 테스트 (Jest)
- [ ] E2E 테스트 (Playwright)
- [ ] API 테스트

### 📊 추가 기능
- [ ] 알림 기능 (댓글/좋아요 알림)
- [ ] 북마크/저장
- [ ] 태그 시스템
- [ ] 카테고리 분류
- [ ] 사용자 팔로우
- [ ] 실시간 채팅 (WebSocket)

---

## 📄 라이선스

MIT

---

## 👨‍💻 개발 정보

개발 기간: 2025.12

**주요 구현**:
- JWT 인증/인가 시스템
- Repository 패턴
- PostgreSQL 마이그레이션
- Docker 자동화
- TypeScript 타입 안정성
- HTTP 로깅 시스템
