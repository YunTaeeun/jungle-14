# NestJS 게시판 테스트 스위트

## 📋 개요

이 브랜치는 NestJS 기반 게시판 프로젝트를 위한 **완성된 테스트 스위트**를 제공합니다.

**포함된 테스트:**
- ✅ 71개의 테스트 케이스 (100% 통과)
- ✅ 71.24% 코드 커버리지
- ✅ Service Layer 테스트 (Auth, Users, Posts, Comments)
- ✅ Controller Layer 테스트 (API 엔드포인트)
- ✅ 모든 테스트에 한글 설명 주석 포함

---

## 🚀 빠른 시작

### 1. 테스트 파일 다운로드

```bash
# 현재 프로젝트에서 테스트 브랜치 체크아웃
git fetch origin
git checkout test-suite

# 또는 특정 폴더만 가져오기
git checkout test-suite -- server/src/**/*.spec.ts
```

### 2. 테스트 실행

```bash
cd server

# 테스트 실행
npm test

# 커버리지 확인
npm run test:cov

# 특정 파일만 테스트
npm test -- auth.service.spec.ts
```

---

## 📦 포함된 파일

### Service Tests (4개, 55 tests)
```
server/src/auth/auth.service.spec.ts        (13 tests)
server/src/users/users.service.spec.ts      (13 tests)
server/src/comments/comments.service.spec.ts (10 tests)
server/src/posts/posts.service.spec.ts      (19 tests)
```

### Controller Tests (4개, 16 tests)
```
server/src/auth/auth.controller.spec.ts         (2 tests)
server/src/users/users.controller.spec.ts       (2 tests)
server/src/comments/comments.controller.spec.ts (4 tests)
server/src/posts/posts.controller.spec.ts       (9 tests)
```

---

## 🔧 프로젝트 요구사항

이 테스트들이 동작하려면 프로젝트가 다음 구조를 가져야 합니다:

### 필수 의존성

```json
{
  "devDependencies": {
    "@nestjs/testing": "^11.0.1",
    "jest": "^29.5.0",
    "@types/jest": "^29.5.0"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/cache-manager": "^2.0.0",
    "bcrypt": "^5.1.1",
    "cache-manager": "^5.2.0"
  }
}
```

### 필수 파일 구조

```
server/src/
├── auth/
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── auth.service.spec.ts      ← 테스트 파일
│   └── auth.controller.spec.ts   ← 테스트 파일
├── users/
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── users.service.spec.ts     ← 테스트 파일
│   └── users.controller.spec.ts  ← 테스트 파일
├── posts/
│   ├── posts.service.ts
│   ├── posts.controller.ts
│   ├── posts.service.spec.ts     ← 테스트 파일
│   └── posts.controller.spec.ts  ← 테스트 파일
├── comments/
│   ├── comments.service.ts
│   ├── comments.controller.ts
│   ├── comments.service.spec.ts  ← 테스트 파일
│   └── comments.controller.spec.ts ← 테스트 파일
└── prisma/
    └── prisma.service.ts
```

---

## 📝 테스트 적용 방법

### Option 1: 전체 파일 복사 (권장)

```bash
# 1. 테스트 브랜치 체크아웃
git checkout test-suite

# 2. 테스트 파일들이 자동으로 해당 위치에 배치됨
# 3. 테스트 실행
npm test
```

### Option 2: 선택적 파일 복사

```bash
# 필요한 테스트만 가져오기
git checkout test-suite -- server/src/auth/*.spec.ts
git checkout test-suite -- server/src/users/*.spec.ts
git checkout test-suite -- server/src/posts/*.spec.ts
git checkout test-suite -- server/src/comments/*.spec.ts
```

### Option 3: 수동 복사

1. 이 브랜치에서 원하는 `.spec.ts` 파일을 복사
2. 본인 프로젝트의 해당 폴더에 붙여넣기
3. `npm test` 실행

---

## ⚙️ 프로젝트 설정

### Jest 설정 (package.json)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

---

## 🧪 테스트 내용

### Auth 모듈
- ✅ 회원가입 (중복 검증, 비밀번호 해싱)
- ✅ 로그인 (JWT 토큰 발급)
- ✅ 사용자 검증 (JWT Strategy)

### Users 모듈
- ✅ 사용자 조회 (ID, username, email)
- ✅ 프로필 업데이트 (닉네임, 이메일, 비밀번호)
- ✅ 중복 검증 (닉네임, 이메일)

### Posts 모듈
- ✅ CRUD 작업
- ✅ Redis 캐싱 (Cache-Aside 패턴)
- ✅ 페이지네이션
- ✅ 검색 (제목, 내용, 작성자)
- ✅ 조회수 증가

### Comments 모듈
- ✅ CRUD 작업
- ✅ 권한 검증 (작성자 확인)
- ✅ 게시물 연관 관계

---

## 🔍 테스트 구조

각 테스트 파일은 다음 패턴을 따릅니다:

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let dependency: MockedDependency;

  beforeEach(async () => {
    // Mock 설정
    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        { provide: Dependency, useValue: mockDependency }
      ]
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  /* 이 테스트는 { 기능 설명 }을 테스트하는 기능입니다. */
  it('should do something', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

---

## 📊 커버리지 목표

이 테스트 스위트를 적용하면:

| 항목                 | 커버리지 |
| -------------------- | -------- |
| **전체**             | 71.24%   |
| **Service Layer**    | ~98%     |
| **Controller Layer** | 80-95%   |

---

## 🛠️ 커스터마이징

### 프로젝트 구조가 다른 경우

1. **파일 경로 수정**
   - 테스트 파일의 import 경로를 프로젝트에 맞게 수정

2. **메서드명이 다른 경우**
   - 테스트 내 메서드 호출을 실제 메서드명에 맞게 수정

3. **추가 기능이 있는 경우**
   - 제공된 테스트를 참고하여 추가 테스트 작성

### 한글 주석 제거

모든 테스트에 한글 주석이 포함되어 있습니다:
```typescript
/* 이 테스트는 { 기능 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
```

필요없다면 주석을 제거하시면 됩니다.

---

## 🐛 문제 해결

### "Cannot find module" 에러

```bash
# 의존성 재설치
npm install
```

### Mock 관련 에러

테스트에서 사용하는 Mock이 실제 구현과 다를 수 있습니다.
- 실제 서비스의 메서드 시그니처 확인
- Mock 설정을 실제 구현에 맞게 수정

### 타입 에러

```typescript
// 타입 에러가 발생하면 any로 캐스팅
const mockService: any = {
  method: jest.fn()
};
```

---

## 📚 추가 자료

### 테스트 작성 가이드

**AAA 패턴 사용:**
```typescript
it('should create a post', async () => {
  // Arrange - 테스트 준비
  const createDto = { title: 'Test', content: 'Content' };
  mockService.create.mockResolvedValue(mockPost);

  // Act - 실행
  const result = await service.create(createDto, 1);

  // Assert - 검증
  expect(mockService.create).toHaveBeenCalledWith(createDto, 1);
  expect(result).toEqual(mockPost);
});
```

### Mock 작성 팁

```typescript
// Service Mock
const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
};

// Prisma Mock
const mockPrisma = {
  user: {
    findUnique: jest.fn() as any,
    create: jest.fn() as any,
    update: jest.fn() as any
  }
};
```

---

## 🤝 기여

이 테스트 스위트를 개선하고 싶으시다면:

1. Fork this branch
2. 개선사항 추가
3. Pull Request 생성

---

## 📄 라이선스

MIT License - 자유롭게 사용하세요!

---

## 💬 문의

테스트 관련 질문이나 이슈가 있다면:
- Issue 생성
- 또는 프로젝트 관리자에게 문의

---

## ✅ 체크리스트

테스트 적용 전 확인사항:

- [ ] NestJS 프로젝트 설치됨
- [ ] Jest 설정 완료
- [ ] 필수 의존성 설치 (`@nestjs/testing`, `jest`)
- [ ] Prisma, Cache Manager 설정됨
- [ ] 프로젝트 구조가 요구사항과 일치
- [ ] `npm test` 명령어 동작 확인

---

**Happy Testing! 🎉**

이 테스트 스위트로 안정적이고 신뢰할 수 있는 게시판 애플리케이션을 만드세요!
