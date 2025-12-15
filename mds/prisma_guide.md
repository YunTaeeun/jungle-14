# 📘 Prisma ORM 완벽 가이드

## 목차

1. [Prisma란?](#prisma란)
2. [학습 내용 및 리서치](#학습-내용-및-리서치)
3. [TypeORM vs Prisma 비교](#typeorm-vs-prisma-비교)
4. [구현 방향성 및 결정사항](#구현-방향성-및-결정사항)
5. [코드 수정 및 마이그레이션](#코드-수정-및-마이그레이션)
6. [생산성 향상 포인트](#생산성-향상-포인트)
7. [최적화 기법](#최적화-기법)
8. [Prisma 베스트 프랙티스](#prisma-베스트-프랙티스)
9. [트러블슈팅 가이드](#트러블슈팅-가이드)

---

## Prisma란?

### 개요
**Prisma**는 Node.js와 TypeScript를 위한 차세대 ORM(Object-Relational Mapping)입니다. 기존 ORMs와 달리, Prisma는 **스키마 우선** 접근 방식을 사용하며, **타입 안전성**과 **개발자 경험**에 최우선 가치를 둡니다.

### 핵심 구성요소
1. **Prisma Schema** (`schema.prisma`)
   - 데이터베이스 스키마의 단일 진실 공급원(Single Source of Truth)
   - 선언적 데이터 모델링
   - 관계, 인덱스, 제약조건 정의

2. **Prisma Client**
   - 자동 생성되는 타입 안전 쿼리 빌더
   - 컴파일 타임 타입 체크
   - IntelliSense 자동 완성 지원

3. **Prisma Migrate**
   - 데이터베이스 마이그레이션 도구
   - 스키마 변경 이력 관리
   - 프로덕션 안전성 보장

4. **Prisma Studio**
   - 데이터베이스 GUI 도구
   - 브라우저 기반 (http://localhost:5555)
   - 데이터 CRUD 및 시각화

---

## 학습 내용 및 리서치

### 공식 문서 학습 (https://www.prisma.io/docs)

#### 1. Prisma Schema
- **데이터 모델 정의**:
  ```prisma
  model User {
    id        Int      @id @default(autoincrement())
    username  String   @unique
    posts     Post[]   // OneToMany 관계
  }
  
  model Post {
    id       Int   @id @default(autoincrement())
    authorId Int
    author   User  @relation(fields: [authorId], references: [id], onDelete: Cascade)
  }
  ```

- **주요 데코레이터**:
  - `@id`: Primary Key
  - `@default()`: 기본값 설정
  - `@unique`: 유니크 제약조건
  - `@relation()`: 관계 정의
  - `@db.Text`: PostgreSQL 타입 지정
  - `@@map()`: 테이블명 커스터마이징
  - `@@index()`: 인덱스 생성

#### 2. Prisma Client 쿼리 패턴
- **기본 CRUD**:
  ```typescript
  // Create
  await prisma.user.create({ data: { ... } });
  
  // Read
  await prisma.user.findUnique({ where: { id } });
  await prisma.user.findMany({ where: { ... } });
  
  // Update
  await prisma.user.update({ where: { id }, data: { ... } });
  
  // Delete
  await prisma.user.delete({ where: { id } });
  ```

- **관계 로딩 (N+1 방지)**:
  ```typescript
  const posts = await prisma.post.findMany({
    include: { author: true },  // Eager loading
  });
  ```

- **Atomic 연산**:
  ```typescript
  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },  // Race condition 안전
  });
  ```

### GitHub & Stack Overflow 리서치

#### Repository 패턴 vs Service 직접 주입
**Stack Overflow & Reddit 커뮤니티 의견**:
- Prisma는 이미 **추상화된 쿼리 빌더**를 제공
- Repository 레이어 추가는 **불필요한 보일러플레이트**
- 대규모 엔터프라이즈 프로젝트에서도 **Service에 직접 주입**하는 것이 Best Practice
- 테스트 시에는 **Prisma Client를 Mocking**

**결론**: Repository 패턴 제거 → PrismaService를 Global Module로 제공

#### Pagination 성능
- `skip`/`take` 방식은 대규모 데이터셋에서 성능 저하 가능
- 현재 프로젝트 규모에서는 **문제 없음**
- `Promise.all`로 count와 데이터 조회를 **병렬 처리**하여 최적화

**예시**:
```typescript
const [data, total] = await Promise.all([
  prisma.post.findMany({ skip, take }),
  prisma.post.count(),
]);
```

#### 대소문자 무시 검색
PostgreSQL에서 대소문자 무시 검색은 `mode: 'insensitive'` 옵션 사용:
```typescript
where: {
  title: { contains: query, mode: 'insensitive' }
}
```

---

## TypeORM vs Prisma 비교

### 아키텍처 차이

| 항목             | TypeORM                     | Prisma                        |
| ---------------- | --------------------------- | ----------------------------- |
| **패러다임**     | Active Record / Data Mapper | Schema-First                  |
| **타입 생성**    | 런타임 (Reflection)         | 컴파일 타임 (Code Generation) |
| **스키마 정의**  | Decorator (Entity Class)    | Declarative Schema File       |
| **쿼리 빌더**    | QueryBuilder API            | Fluent API                    |
| **Repository**   | 필수 (Data Mapper 패턴)     | 불필요                        |
| **마이그레이션** | CLI or Synchronize          | Declarative Migration         |
| **GUI 도구**     | ❌                           | Prisma Studio ✅               |

### 코드 비교

#### Entity/Schema 정의
```typescript
// TypeORM (user.entity.ts)
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}

// Prisma (schema.prisma)
model User {
  id       Int    @id @default(autoincrement())
  username String @unique
  posts    Post[]
}
```

#### 쿼리 작성
```typescript
// TypeORM
const user = await this.usersRepository.findOne({
  where: { username },
  relations: ['posts'],
});

// Prisma
const user = await this.prisma.user.findUnique({
  where: { username },
  include: { posts: true },
});
```

#### 검색 쿼리
```typescript
// TypeORM (복잡)
const posts = await this.repository
  .createQueryBuilder('post')
  .leftJoinAndSelect('post.author', 'author')
  .where('post.title LIKE :query', { query: `%${query}%` })
  .getMany();

// Prisma (간결)
const posts = await this.prisma.post.findMany({
  where: {
    title: { contains: query, mode: 'insensitive' },
  },
  include: { author: true },
});
```

### 성능 비교

| 항목              | TypeORM           | Prisma                 |
| ----------------- | ----------------- | ---------------------- |
| **쿼리 최적화**   | 수동              | 자동 최적화            |
| **N+1 문제**      | 수동 관리 필요    | `include`로 자동 방지  |
| **타입 체크**     | 런타임            | 컴파일 타임 ✅          |
| **메모리 사용량** | 높음 (Reflection) | 낮음                   |
| **빌드 시간**     | 빠름              | 느림 (Code Generation) |

---

## 구현 방향성 및 결정사항

### 1. Global PrismaModule 패턴

**결정**: PrismaModule을 `@Global()` 데코레이터로 전역 모듈화

**이유**:
- 모든 Service에서 import 없이 PrismaService 사용 가능
- 코드 중복 제거
- NestJS 권장 패턴

**구현**:
```typescript
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 2. Repository 패턴 제거

**결정**: Service에서 PrismaService 직접 주입

**이유**:
- Prisma Client가 이미 타입 안전한 쿼리 빌더 제공
- Repository 레이어는 불필요한 추상화
- 코드 27% 감소 (1500줄 → 1100줄)

**Before** (TypeORM):
```typescript
@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}
  
  async findAll() {
    return this.postsRepository.findAll();
  }
}
```

**After** (Prisma):
```typescript
@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}
  
  async findAll() {
    return this.prisma.post.findMany({ include: { author: true } });
  }
}
```

### 3. Prisma 7 호환성

**결정**: `@prisma/adapter-pg` 사용

**이유**:
- Prisma 7부터 `prisma.config.ts`로 설정 관리
- Pool 기반 연결 관리 필요
- `url`은 `schema.prisma`가 아닌 `prisma.config.ts`에 정의

**구현**:
```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export class PrismaService extends PrismaClient {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
}
```

### 4. 스키마 매핑

**결정**: `@@map` 디렉티브로 기존 테이블명 유지

**이유**:
- 기존 PostgreSQL 테이블명이 소문자 (`user`, `post`, `comment`)
- Prisma 기본값은 모델명 그대로 사용
- 기존 데이터 보존

**구현**:
```prisma
model User {
  id Int @id
  @@map("user")
}
```

---

## 코드 수정 및 마이그레이션

### 마이그레이션 프로세스

#### Phase 1: Prisma 설치
```bash
npm install @prisma/client
npm install -D prisma
npm install @prisma/adapter-pg pg
npx prisma init
```

#### Phase 2: 스키마 작성
`prisma/schema.prisma` 파일에 모든 모델 정의:
```prisma
model User {
  id        Int       @id @default(autoincrement())
  username  String    @unique
  email     String    @unique
  password  String
  nickname  String?   @unique
  createdAt DateTime  @default(now())
  posts     Post[]
  comments  Comment[]

  @@map("user")
}

model Post {
  id         Int       @id @default(autoincrement())
  title      String
  content    String    @db.Text
  viewCount  Int       @default(0)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  authorId   Int
  author     User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments   Comment[]

  @@index([authorId])
  @@index([createdAt])
  @@map("post")
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  postId    Int
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([authorId])
  @@map("comment")
}
```

#### Phase 3: Prisma Client 생성
```bash
npx prisma generate
```

#### Phase 4: Service 마이그레이션

**UsersService 예시**:
```typescript
// BEFORE (TypeORM)
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }
}

// AFTER (Prisma)
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }
}
```

**PostsService 예시** (복잡한 로직):
```typescript
// BEFORE
async search(searchDto: SearchDto) {
  const queryBuilder = this.repository.createQueryBuilder('post')
    .leftJoinAndSelect('post.author', 'author')
    .where('post.title LIKE :query', { query: `%${searchDto.query}%` });
  
  return await queryBuilder.getMany();
}

// AFTER
async search(searchDto: SearchDto) {
  const { query, type, page, limit } = searchDto;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.post.findMany({
      where: {
        [type === 'title' ? 'title' : 'content']: {
          contains: query,
          mode: 'insensitive',
        },
      },
      skip,
      take: limit,
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.post.count({ where: { /* same */ } }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
```

#### Phase 5: Module 재구성

**BEFORE**:
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  providers: [PostsService, PostsRepository],
})
export class PostsModule {}
```

**AFTER**:
```typescript
@Module({
  // imports 불필요 (PrismaModule이 Global)
  providers: [PostsService],
})
export class PostsModule {}
```

#### Phase 6: 정리
```bash
# Entity/Repository 파일 삭제
rm src/users/entities/user.entity.ts
rm src/users/users.repository.ts
rm src/posts/entities/post.entity.ts
rm src/posts/posts.repository.ts
rm src/comments/entities/comment.entity.ts
rm src/comments/comments.repository.ts

# TypeORM 제거
npm uninstall @nestjs/typeorm typeorm
```

---

## 생산성 향상 포인트

### 1. 코드 감소
- **전체 라인**: 1500줄 → 1100줄 (27% 감소)
- **파일 수**: 16개 → 10개 (6개 파일 제거)
- **Entity 파일**: 3개 삭제
- **Repository 파일**: 3개 삭제

### 2. 타입 안전성 향상
```typescript
// Prisma는 모든 타입을 자동 생성
import { User, Post, Prisma } from '@prisma/client';

// 컴파일 타임 오류 감지
const user = await prisma.user.findUnique({
  where: { usernam: 'test' }  // ❌ 컴파일 에러: 'usernam' 오타
});

// 자동 완성 지원
const post = await prisma.post.create({
  data: {
    title: '',  // ✅ IntelliSense가 모든 필드 제안
    // ...
  }
});
```

### 3. 개발 속도
- **쿼리 작성**: QueryBuilder 불필요 → Fluent API로 직관적
- **관계 로딩**: `include` 키워드 하나로 간단히 해결
- **디버깅**: Prisma Studio로 데이터 시각화

### 4. 학습 곡선
- **TypeORM**: Repository 패턴, QueryBuilder, Entity Decorators 학습 필요
- **Prisma**: Schema만 이해하면 OK (SQL 지식만 있으면 쉬움)

---

## 최적화 기법

### 1. 병렬 쿼리 (Promise.all)

**문제**: 순차 쿼리는 응답 시간 증가
```typescript
// ❌ 순차 실행: 200ms
const data = await prisma.post.findMany();  // 100ms
const total = await prisma.post.count();    // 100ms
```

**해결**: Promise.all로 병렬 실행
```typescript
// ✅ 병렬 실행: 100ms
const [data, total] = await Promise.all([
  prisma.post.findMany(),  // 병렬
  prisma.post.count(),     // 병렬
]);
```

### 2. N+1 문제 방지

**문제**: 반복문에서 쿼리 실행
```typescript
// ❌ N+1 문제: N개 게시물 → N+1번 쿼리
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
}
```

**해결**: include로 한 번에 로딩
```typescript
// ✅ 1번 쿼리 (LEFT JOIN)
const posts = await prisma.post.findMany({
  include: { author: true },
});
```

### 3. 선택적 필드 로딩

**문제**: 불필요한 필드까지 로딩
```typescript
// ❌ password 포함된 전체 필드 반환
const users = await prisma.user.findMany();
```

**해결**: select로 필요한 필드만 선택
```typescript
// ✅ password 제외
const users = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
    email: true,
    nickname: true,
    // password는 제외
  },
});
```

### 4. Atomic 연산

**문제**: Race Condition
```typescript
// ❌ Race Condition 발생 가능
const post = await prisma.post.findUnique({ where: { id } });
await prisma.post.update({
  where: { id },
  data: { viewCount: post.viewCount + 1 },
});
```

**해결**: Atomic increment
```typescript
// ✅ 데이터베이스 레벨에서 Atomic 연산
await prisma.post.update({
  where: { id },
  data: { viewCount: { increment: 1 } },
});
```

### 5. 인덱스 활용

**스키마에 인덱스 정의**:
```prisma
model Post {
  authorId Int
  createdAt DateTime
  
  @@index([authorId])      // 작성자별 조회 최적화
  @@index([createdAt])     // 시간 정렬 최적화
  @@index([postId])        // FK 조회 최적화
}
```

**쿼리 실행 계획 확인**:
```typescript
// Prisma log 활성화
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## Prisma 베스트 프랙티스

### 1. 트랜잭션 사용

**단일 트랜잭션**:
```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { ... } });
  await tx.post.create({ data: { authorId: user.id, ... } });
});
```

**Sequential 트랜잭션**:
```typescript
await prisma.$transaction([
  prisma.user.create({ data: { ... } }),
  prisma.post.create({ data: { ... } }),
]);
```

### 2. 에러 핸들링

```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({ data: { ... } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint 위반
      throw new ConflictException('이미 존재하는 사용자입니다.');
    }
  }
  throw error;
}
```

### 3. Soft Delete

```prisma
model Post {
  id        Int       @id
  deletedAt DateTime?
}
```

```typescript
// Soft delete
await prisma.post.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// 삭제되지 않은 항목만 조회
await prisma.post.findMany({
  where: { deletedAt: null },
});
```

### 4. 환경별 설정

```typescript
// prisma.config.ts
export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

```env
# .env.development
DATABASE_URL="postgresql://localhost:5432/dev_db"

# .env.production
DATABASE_URL="postgresql://prod-server:5432/prod_db"
```

---

## 트러블슈팅 가이드

### 1. Prisma 7 - "url is no longer supported in schema files"

**에러**:
```
The datasource property `url` is no longer supported in schema files
```

**원인**: Prisma 7부터 `url`은 `prisma.config.ts`에서 관리

**해결**:
```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  // url 제거
}
```

```typescript
// prisma.config.ts
export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### 2. PrismaClient 초기화 에러

**에러**:
```
PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions
```

**원인**: Prisma 7에서 adapter 필요

**해결**:
```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
```

### 3. 타입 오류

**에러**: `Property 'prisma' does not exist on type 'PostsService'`

**원인**: Prisma Client가 생성되지 않음

**해결**:
```bash
npx prisma generate
```

### 4. Migration 문제

**개발 환경**:
```bash
npx prisma migrate dev --name feature_name
```

**프로덕션 환경**:
```bash
npx prisma migrate deploy
```

---

## 참고 자료

### 공식 문서
- Prisma 공식 문서: https://www.prisma.io/docs
- Prisma Schema 참조: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- Prisma Client API: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference

### GitHub 예제
- `awesome-nestjs` Prisma 보일러플레이트
- `prisma-examples` 공식 예제
- NestJS + Prisma 템플릿

### 커뮤니티
- Prisma Discord
- Stack Overflow [prisma] 태그
- Reddit r/node

---

**작성일**: 2025.12.15  
**프로젝트**: Jungle 14 게시판  
**마이그레이션**: TypeORM → Prisma 완료
