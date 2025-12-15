# Redis 설정 가이드

## 🚀 Redis란?

**In-Memory 데이터 저장소** - 초고속 캐싱 시스템

**용도**:
- API 응답 캐싱 (속도 향상)
- 조회수 실시간 집계
- 세션 관리
- 리더보드/랭킹

---

## 📦 1. Redis 설치 (Docker)

```bash
# Redis 실행
docker run --name jungle-redis -p 6379:6379 -d redis:7

# 자동 재시작 설정
docker update --restart=unless-stopped jungle-redis

# 확인
docker ps | findstr redis
```

---

## 📥 2. NestJS 패키지 설치

```bash
npm install @nestjs/cache-manager cache-manager cache-manager-redis-yet redis
```

---

## ⚙️ 3. 설정

### app.module.ts
```typescript
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    // Redis 캐시 설정
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
          ttl: 60000, // 기본 1분
        }),
      }),
    }),
    // 기존 imports...
  ],
})
```

---

## 💡 4. 사용 방법

### A. 자동 캐싱 (데코레이터)
```typescript
// posts.controller.ts
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Get()
@CacheKey('all-posts')  // 캐시 키
@CacheTTL(10000)        // 10초
findAll() {
  return this.postsService.findAll();
}
```

### B. 수동 캐싱 (Service)
```typescript
// posts.service.ts
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export class PostsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    // 캐시 확인
    const cached = await this.cacheManager.get('posts');
    if (cached) return cached;

    // DB 조회
    const posts = await this.postsRepository.findAll();
    
    // 캐시 저장 (10초)
    await this.cacheManager.set('posts', posts, 10000);
    
    return posts;
  }
}
```

### C. 조회수 집계 (Redis Increment)
```typescript
// 실시간 조회수
const key = `post:${id}:views`;
await this.cacheManager.store.client.incr(key);

// 1분마다 DB 동기화
setInterval(async () => {
  const keys = await redis.keys('post:*:views');
  for (const key of keys) {
    const count = await redis.get(key);
    // PostgreSQL에 저장
  }
}, 60000);
```

---

## 📊 성능 비교

| 작업 | PostgreSQL | Redis |
|------|------------|-------|
| GET /posts | 5ms | **0.1ms** ⚡ |
| 조회수 증가 | 100ms | **0.01ms** ⚡ |

**100배 빠름!**

---

## 🔧 Redis CLI

```bash
# Redis 접속
docker exec -it jungle-redis redis-cli

# 명령어
> GET posts
> SET mykey "value"
> INCR counter
> KEYS *
> TTL mykey
> FLUSHALL  # 전체 삭제
```

---

**Redis 설치 완료! 이제 NestJS 설정만 하면 됩니다!** 🚀
