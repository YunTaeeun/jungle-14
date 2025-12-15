# 🐘 PostgreSQL & TypeORM 게시물 DB 구현

## 1. 📚 개념 (Concept)

### 1.1 TypeORM Pattern
> "TypeORM은 Active Record와 Data Mapper 패턴을 모두 지원합니다... Data Mapper 패턴을 사용하면 엔티티는 매우 가볍게 유지하고, 모든 쿼리 로직은 'Repository'라는 별도의 클래스에 작성합니다." - *TypeORM 공식 문서*

우리는 **Data Mapper 패턴**과 **Custom Repository 패턴**을 사용하여 데이터베이스 로직을 철저히 분리했습니다.

### 1.2 Entity
> "Entity는 데이터베이스 테이블에 매핑되는 클래스입니다." - *NestJS 공식 문서*

`Post` 엔티티는 데이터베이스의 `post` 테이블 구조를 정의하며, `User` 엔티티와의 관계(Relationship)를 설정합니다.

### 1.3 Repository Design Pattern
> "Repository는 도메인 객체에 접근하는 컬렉션과 같은 인터페이스를 제공하여 도메인 모델과 데이터 매핑 레이어 사이를 중재합니다." - *Martin Fowler*

서비스 레이어(`PostsService`)가 데이터베이스의 구체적인 구현(SQL)을 알 필요 없이, 메서드 호출만으로 데이터를 조작할 수 있게 합니다.

---

## 2. 🗺️ 구현 계획 (Implementation Plan)

### 2.1 데이터베이스 아키텍처
1.  **PostgreSQL 설정**: Docker 컨테이너로 안정적인 DB 환경 구축 (`postgres:16`).
2.  **Schema 설계**:
    *   `id`: Primary Key (Auto Increment)
    *   `title`, `content`: 게시물 본문
    *   `viewCount`: 조회수 (Default 0)
    *   `author`: User 테이블과 N:1 관계 (Foreign Key)
    *   `createdAt`, `updatedAt`: 자동 타임스탬프

### 2.2 코드 구조화
1.  **Entity**: `post.entity.ts`에 스키마 정의.
2.  **Repository**: `posts.repository.ts`에 DB 접근 로직 캡슐화.
3.  **Service**: `posts.service.ts`에서 비즈니스 로직 처리 및 트랜잭션 관리.

---

## 3. 💻 실제 구현 코드 (Implementation Code)

### 3.1 Post Entity (`post.entity.ts`)

```typescript
// server/src/posts/entities/post.entity.ts

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: 0 }) // 조회수 추가, 기본값 0
  viewCount: number;

  // ManyToOne: 여러 게시물은 하나의 작성자를 가질 수 있음
  // eager: true 설정은 조회 시 자동으로 작성자 정보를 조인해서 가져옴
  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**설명**:
*   `@ManyToOne`: User와의 관계를 설정합니다. `eager: true` 덕분에 `find` 메서드 실행 시 별도의 `relations` 옵션 없이도 작성자 정보가 함께 로드됩니다.
*   `@CreateDateColumn`: 레코드가 생성될 때 자동으로 현재 시간이 입력됩니다.

### 3.2 Custom Repository (`posts.repository.ts`)

NestJS 최신 버전에서는 Custom Repository를 구현할 때 `DataSource`를 주입받아 처리하는 것이 권장됩니다.

```typescript
// server/src/posts/posts.repository.ts

@Injectable()
export class PostsRepository {
  // TypeORM의 기본 Repository를 내부적으로 사용
  private repository: Repository<Post>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Post);
  }

  // 전체 조회: 생성일 기준 내림차순 (최신순)
  async findAll(): Promise<Post[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 상세 조회
  async findById(id: number): Promise<Post | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  // 생성: DTO와 작성자 정보를 받아 저장
  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const post = this.repository.create({
      ...createPostDto,
      author: user,
    });
    return this.repository.save(post);
  }

  // 엔티티 직접 저장 (조회수 증가 등에 사용)
  async save(post: Post): Promise<Post> {
    return this.repository.save(post);
  }

  // 삭제
  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
```

**설명**:
*   `DataSource`를 통해 `Post` 엔티티의 리포지토리를 가져옵니다.
*   `findAll`에서 `order: { createdAt: 'DESC' }`를 사용하여 최신 글이 먼저 나오도록 정렬했습니다.

### 3.3 Service Layer (`posts.service.ts`)

서비스는 리포지토리를 주입받아 사용합니다. 여기서 데이터베이스 로직이 완전히 추상화됩니다.

```typescript
@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    // ... Redis 등 다른 의존성
  ) {}

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    // 1. 사용자 정보 확인 (User 검증 로직 생략)
    const user = await this.usersRepository.findById(userId);
    
    // 2. 리포지토리에 위임
    const post = await this.postsRepository.create(createPostDto, user);
    
    // 3. 캐시 무효화 (새 글 작성 시 목록 캐시 삭제)
    // await this.cacheManager.del('posts');
    
    return post;
  }

  // ... 기타 메서드들
}
```

---

## 4. 📝 추가 내용 (Additional Notes)

### 4.1 Docker 환경 설정
PostgreSQL을 로컬에 설치하지 않고 Docker를 사용하여 환경을 격리했습니다.

```bash
# PostgreSQL 컨테이너 실행 명령어
docker run --name jungle-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16
```

### 4.2 데이터 무결성
*   **Foreign Key**: `authorId` 컬럼이 생성되며, User 테이블의 `id`를 참조합니다.
*   **Transaction**: 현재는 단일 작업 위주라 명시적 트랜잭션이 없지만, 추후 댓글/좋아요 등 복합 작업 시 `QueryRunner`를 사용한 트랜잭션 처리가 필요할 수 있습니다.
