# 게시판 프로젝트

NestJS + Next.js를 사용한 풀스택 게시판 애플리케이션

## 🚀 기술 스택

### Backend
- **NestJS** - Node.js 프레임워크
- **Prisma** - 차세대 TypeScript ORM
- **PostgreSQL** - 데이터베이스 (Docker)
- **Redis** - 캐싱 시스템 (Docker)
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
- User와 관계 설정
- 작성자 정보 표시 (nickname 우선)
- **조회수** - localStorage 기반 중복 방지 (10분)
- **페이지네이션** - 무한 스크롤
- **검색** - 제목/내용/작성자 검색

### 💬 댓글 시스템
- 댓글 CRUD
- 본인 댓글만 수정/삭제 (권한 체크)
- 실시간 댓글 업데이트
- Post/User와 관계 설정

### 👤 사용자 관리
- 프로필 조회
- 닉네임 설정 (중복 불가)
- 이메일/비밀번호 변경
- 내 게시물 목록

### 🏗️ 아키텍처
- **Prisma ORM** - 타입 안전한 데이터베이스 쿼리
- **Service 레이어** - 비즈니스 로직 처리
- **Global PrismaModule** - 전역 데이터베이스 접근
- **HTTP Logging Interceptor** - 모든 요청/응답 로깅

### ⚡ 성능 최적화
- **Redis 캐싱**
  - 게시물 목록: 1분
  - 게시물 상세: 5분
  - 캐시 무효화: 생성/수정/삭제 시
- **Prisma 최적화**
  - Promise.all 병렬 쿼리
  - include로 N+1 문제 방지
  - Atomic increment 연산
- **응답 시간**
  - 캐시 히트: 0.1-2ms
  - DB 조회: 5-25ms

### 🎨 UI/UX
- 미니멀 디자인
- 반응형 레이아웃
- 로그인 상태별 네비게이션
- 그리드 게시물 목록
- 무한 스크롤 페이지네이션
- 실시간 검색

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
│   │   ├── settings/      # 계정 설정
│   │   └── search/        # 검색 결과
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── CommentSection.tsx
│   │   ├── InfiniteScrollPosts.tsx
│   │   └── SearchBar.tsx
│   └── types/
│       └── index.ts       # TypeScript 타입 정의
│
└── server/                # NestJS Backend
    ├── prisma/
    │   └── schema.prisma  # Prisma 스키마
    ├── src/
    │   ├── prisma/        # Prisma 모듈
    │   │   ├── prisma.service.ts
    │   │   └── prisma.module.ts
    │   ├── auth/          # 인증 모듈
    │   │   ├── dto/
    │   │   ├── strategies/
    │   │   └── guards/
    │   ├── users/         # 사용자 모듈
    │   ├── posts/         # 게시물 모듈
    │   ├── comments/      # 댓글 모듈
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
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jungle_board?schema=public"
JWT_SECRET=your-super-secret-key
PORT=3000
NODE_ENV=development
```

### 4. Redis 설정 (Docker)

**Redis 실행**:
```bash
docker run --name jungle-redis -p 6379:6379 -d redis:7
```

**자동 재시작 설정**:
```bash
docker update --restart=unless-stopped jungle-redis
```

### 5. Prisma 마이그레이션

```bash
cd server
npx prisma generate  # Prisma Client 생성
```

### 6. 서버 실행

```bash
# Backend (포트 3000) - Docker 자동 시작
cd server
npm run start:dev

# Frontend (포트 3001)
cd client
npm run dev
```

### 7. 접속

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Prisma Studio**: `npx prisma studio` (포트 5555)

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
- `GET /posts?page=1&limit=10` - 페이지네이션 조회
- `GET /posts/search?query=검색어&type=title` - 검색
- `GET /posts/:id` - 단일 조회
- `POST /posts` - 생성 (인증 필요)
- `POST /posts/:id/view` - 조회수 증가
- `PATCH /posts/:id` - 수정 (본인만)
- `DELETE /posts/:id` - 삭제 (본인만)

### 댓글
- `GET /posts/:postId/comments` - 댓글 목록
- `POST /posts/:postId/comments` - 댓글 작성 (인증 필요)
- `PATCH /comments/:id` - 댓글 수정 (본인만)
- `DELETE /comments/:id` - 댓글 삭제 (본인만)

---

## 🔧 개발 도구

### Prisma Studio
데이터베이스 GUI 도구:
```bash
npx prisma studio
```

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
- `viewCount` - 조회수 (기본값 0)
- `authorId` - User FK
- `createdAt`
- `updatedAt`

### Comment
- `id` - Primary Key
- `content`
- `postId` - Post FK (Cascade Delete)
- `authorId` - User FK
- `createdAt`
- `updatedAt`

---

## 🏗️ 아키텍처 패턴

### Prisma ORM 패턴
```
Controller → Service → Prisma Client → PostgreSQL
```

**장점**:
- Repository 패턴 불필요 (Prisma가 이미 추상화 제공)
- 타입 안전성 (컴파일 타임 타입 체크)
- 간결한 코드 (27% 라인 감소)
- N+1 문제 자동 방지 (`include`)
- Atomic 연산 지원 (`increment`)

---

## 🚀 배포 전 체크리스트

- [ ] `.env` 파일에 강력한 JWT_SECRET 설정
- [ ] DATABASE_URL을 프로덕션 DB로 변경
- [ ] CORS origin을 프로덕션 도메인으로 변경
- [ ] 프로덕션 로깅 레벨 조정
- [ ] httpOnly 쿠키 사용 고려 (보안)
- [ ] Prisma migrate deploy 실행

---

## 📝 완료된 기능

### ✅ 구현 완료
- [x] JWT 인증/인가
- [x] 게시물 CRUD
- [x] 조회수 기능
- [x] **댓글 시스템** ✅
- [x] **페이지네이션 (무한 스크롤)** ✅
- [x] **검색 기능 (제목/내용/작성자)** ✅
- [x] Redis 캐싱
- [x] **Prisma ORM 마이그레이션** ✅

### 🎨 UX 개선 (향후)
- [ ] 이미지 업로드 (게시물 첨부)
- [ ] 좋아요/추천 기능
- [ ] 글씨체 변경 (Pretendard, Noto Sans 등)
- [ ] 다크 모드

### 📱 반응형 (향후)
- [ ] 모바일 최적화
- [ ] 태블릿 레이아웃

### 🔐 보안 (향후)
- [ ] httpOnly 쿠키 (XSS 방지)
- [ ] CSRF 토큰
- [ ] Rate Limiting (API 요청 제한)

### 🚀 성능 (향후)
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 코드 스플리팅

### 🧪 테스트 (향후)
- [ ] 유닛 테스트 (Jest)
- [ ] E2E 테스트 (Playwright)

---

## 📄 라이선스

MIT

---

## 👨‍💻 개발 정보

개발 기간: 2025.12

**주요 구현**:
- JWT 인증/인가 시스템
- **Prisma ORM** (TypeORM에서 마이그레이션)
- PostgreSQL + Redis
- 댓글, 페이지네이션, 검색 기능
- 조회수 기능 (localStorage 중복 방지)
- Docker 자동화
- TypeScript 타입 안정성
- HTTP 로깅 시스템

**기술 결정**:
- TypeORM → Prisma 마이그레이션 (코드 27% 감소, 타입 안전성 향상)
- Repository 패턴 제거 (Prisma가 이미 추상화 제공)
- Global PrismaModule (어디서든 사용 가능)
