# NestJS 게시판 테스트 스위트

[![npm version](https://badge.fury.io/js/%40your-username%2Fnestjs-board-test-suite.svg)](https://badge.fury.io/js/%40your-username%2Fnestjs-board-test-suite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

NestJS 기반 게시판 프로젝트를 위한 **완전한 테스트 스위트**입니다.

## 📦 설치

```bash
npm install --save-dev @your-username/nestjs-board-test-suite
```

## ✨ 특징

- ✅ **71개 테스트 케이스** (100% 통과)
- ✅ **71.24% 코드 커버리지**
- ✅ 모든 테스트에 **한글 설명** 포함
- ✅ Service & Controller 완전 커버
- ✅ 즉시 사용 가능

## 🧪 포함된 테스트

### Service Tests (55 tests)
- `auth.service.spec.ts` - 인증 서비스 (13 tests)
- `users.service.spec.ts` - 사용자 서비스 (13 tests)
- `posts.service.spec.ts` - 게시물 서비스 (19 tests)
- `comments.service.spec.ts` - 댓글 서비스 (10 tests)

### Controller Tests (16 tests)
- `auth.controller.spec.ts` - 인증 API (2 tests)
- `users.controller.spec.ts` - 사용자 API (2 tests)
- `posts.controller.spec.ts` - 게시물 API (9 tests)
- `comments.controller.spec.ts` - 댓글 API (4 tests)

## 🚀 사용 방법

### 1. 설치 후 파일 복사

```bash
# 패키지 설치
npm install --save-dev @your-username/nestjs-board-test-suite

# 테스트 파일 복사
cp -r node_modules/@your-username/nestjs-board-test-suite/tests/* src/
```

### 2. 또는 수동 복사

```bash
# Auth 테스트
cp node_modules/@your-username/nestjs-board-test-suite/tests/auth/*.ts src/auth/

# Users 테스트
cp node_modules/@your-username/nestjs-board-test-suite/tests/users/*.ts src/users/

# Posts 테스트
cp node_modules/@your-username/nestjs-board-test-suite/tests/posts/*.ts src/posts/

# Comments 테스트
cp node_modules/@your-username/nestjs-board-test-suite/tests/comments/*.ts src/comments/
```

### 3. 테스트 실행

```bash
npm test
```

## 📋 요구사항

### 필수 의존성

```json
{
  "devDependencies": {
    "@nestjs/testing": "^11.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/cache-manager": "^2.0.0",
    "bcrypt": "^5.0.0"
  }
}
```

### 프로젝트 구조

```
src/
├── auth/
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── auth.service.spec.ts      ← 복사됨
│   └── auth.controller.spec.ts   ← 복사됨
├── users/
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── users.service.spec.ts     ← 복사됨
│   └── users.controller.spec.ts  ← 복사됨
├── posts/
│   ├── posts.service.ts
│   ├── posts.controller.ts
│   ├── posts.service.spec.ts     ← 복사됨
│   └── posts.controller.spec.ts  ← 복사됨
├── comments/
│   ├── comments.service.ts
│   ├── comments.controller.ts
│   ├── comments.service.spec.ts  ← 복사됨
│   └── comments.controller.spec.ts ← 복사됨
└── prisma/
    └── prisma.service.ts
```

## 🔧 커스터마이징

프로젝트 구조가 다르다면:

1. Import 경로 수정
2. Mock 데이터 조정
3. 메서드명 변경

## 💡 테스트 예시

```typescript
/* 이 테스트는 { 새로운 사용자 등록 성공 시나리오 }를 테스트하는 기능입니다. */
it('should successfully register a new user', async () => {
  // Arrange
  const registerDto = { username: 'test', email: 'test@test.com', password: '1234' };
  
  // Act
  const result = await service.register(registerDto);
  
  // Assert
  expect(result.username).toBe('test');
});
```

## 📊 커버리지

| 항목                 | 커버리지 |
| -------------------- | -------- |
| **전체**             | 71.24%   |
| **Service Layer**    | ~98%     |
| **Controller Layer** | 85-95%   |

## 📚 문서

자세한 사용법은 [INSTALL.md](./INSTALL.md)를 참고하세요.

## 🤝 기여

버그 리포트나 개선 제안은 환영합니다!

## 📄 라이선스

MIT

## 👤 Author

Your Name

---

**Happy Testing!** 🎉
