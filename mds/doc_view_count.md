# 👁️ 조회수 기능 구현 (View Count)

## 1. 📚 개념 (Concept)

### 1.1 View Counting Strategy
조회수는 단순히 숫자를 올리는 것이 아니라, "중복 조회(Abuse)"를 어떻게 방지할 것인가가 핵심입니다.

> "사용자 경험을 해치지 않으면서, 의도적인 어뷰징을 막는 것이 중요합니다. 엄격한 IP 체크나 로그인 필수 정책보다는, 쿠키나 로컬 스토리지를 활용한 클라이언트 측 제어가 가볍고 효과적일 수 있습니다." - *General Web Practice*

우리는 **LocalStorage**를 사용한 **클라이언트 측 중복 방지** 방식을 채택했습니다.

*   **Cookie vs LocalStorage**:
    *   초기에는 Cookie를 시도했으나, 개발 환경(Localhost)의 Port 차이(3000 vs 3001)로 인한 CORS 문제, SameSite 정책 등으로 인해 복잡도가 증가했습니다.
    *   LocalStorage는 도메인 단위로 작동하며, 구현이 직관적이고 프론트엔드에서 제어하기 쉽습니다.

### 1.2 Debouncing (Time-based Check)
특정 시간(10분) 동안은 동일 게시물의 조회수가 올라가지 않도록 "시간 제한"을 둡니다.

---

## 2. 🗺️ 구현 계획 (Implementation Plan)

### 2.1 Backend (단순화)
백엔드는 복잡한 중복 체크 로직을 제거하고, 요청이 오면 무조건 조회수를 1 올리는 역할만 수행합니다.
*   `POST /posts/:id/view`: 조회수 증가 전용 API.

### 2.2 Frontend (로직 집중)
프론트엔드(`PostDetailClient`)에서 모든 판단을 수행합니다.
1.  게시물 상세 페이지 진입 (`useEffect`).
2.  `localStorage`에서 `viewed_posts` 데이터를 가져옴.
3.  현재 게시물(`id`)의 마지막 조회 시간을 확인.
4.  **10분(600,000ms)**이 지났거나 처음 조회라면?
    *   백엔드 API 호출 (`POST /view`).
    *   현재 시간을 `localStorage`에 저장.
5.  10분 이내라면?
    *   API 호출 건너뜀 (조회수 증가 안 함).

---

## 3. 💻 실제 구현 코드 (Implementation Code)

### 3.1 Backend Controller (`posts.controller.ts`)

```typescript
// server/src/posts/posts.controller.ts

@Controller('posts')
export class PostsController {
  
  // 조회 로직 간소화: ID 받아서 Service 호출
  @Post(':id/view')
  async incrementView(@Param('id') id: string) {
    await this.postsService.incrementViewCount(+id);
    return { success: true };
  }
}
```

### 3.2 Backend Service (`posts.service.ts`)

```typescript
// server/src/posts/posts.service.ts

async incrementViewCount(id: number): Promise<void> {
  // DB에서 직접 조회수 증가 (Atomic Update 권장되지만 현재는 조회->수정 방식)
  const post = await this.findOne(id);
  post.viewCount++;
  await this.postsRepository.save(post);
  
  // *중요*: 조회수가 변했으므로 상세 조회 캐시를 무효화해야 할 수도 있지만,
  // 실시간성이 덜 중요하면 무효화하지 않고 5분 뒤 갱신되게 둘 수도 있습니다.
  // 현재는 무효화하지 않고 캐시 만료를 기다리는 정책입니다.
}
```

### 3.3 Frontend Client Component (`PostDetailClient.tsx`)

```typescript
// client/app/post/[id]/PostDetailClient.tsx

export default function PostDetailClient({ post }: { post: any }) {
    useEffect(() => {
        // 1. 로컬스토리지에서 조회 기록 가져오기
        const viewedPostsStr = localStorage.getItem('viewed_posts');
        const viewedPosts = viewedPostsStr ? JSON.parse(viewedPostsStr) : {};
        
        // 2. 시간 계산
        const now = Date.now();
        const lastViewed = viewedPosts[post.id];

        // 3. 중복 체크 (10분 = 600,000ms)
        // 처음 방문이거나, 마지막 방문으로부터 10분이 지났으면
        if (!lastViewed || now - lastViewed > 600000) {
            
            // 4. API 호출 (비동기)
            fetch(`http://localhost:3000/posts/${post.id}/view`, {
                method: 'POST',
                credentials: 'include',
            }).catch(err => console.error('조회수 증가 실패:', err));

            // 5. 기록 업데이트
            viewedPosts[post.id] = now;
            localStorage.setItem('viewed_posts', JSON.stringify(viewedPosts));
        }
    }, [post.id]); // post.id가 바뀔 때마다 실행

    // ... 렌더링 로직 (조회수 표시: {post.viewCount})
}
```

---

## 4. 📝 추가 내용 (Additional Notes)

### 4.1 장단점 분석
*   **장점**:
    *   서버 부하 감소 (중복 요청 자체를 안 보냄).
    *   구현이 매우 간단하고 직관적.
    *   사용자가 브라우저를 닫아도 기록 유지 (LocalStorage 특성).
*   **단점**:
    *   사용자가 LocalStorage를 비우거나 시크릿 모드를 쓰면 조회수가 다시 올라감 (완벽한 어뷰징 방지는 아님).
    *   브라우저마다 별도로 카운팅됨 (크롬에서 보고 엣지에서 보면 또 올라감).

### 4.2 개선 가능성
*   **IP 기반 체크**: 서버에서 Redis를 사용해 IP 주소를 키로 10분간 막는 방법 (더 강력하지만 서버 자원 소모).
*   **회원 전용**: 로그인한 유저만 카운팅 (가장 정확하지만 비회원 조회수 누락).
*   현재 프로젝트 규모에서는 LocalStorage 방식이 **비용 대비 효과(ROI)**가 가장 뛰어납니다.
