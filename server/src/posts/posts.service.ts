import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostsRepository } from './posts.repository';
import { UsersRepository } from '../users/users.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly usersRepository: UsersRepository,
  ) { }

  // 전체 게시물 조회 (Redis 캐싱 적용)
  async findAll(): Promise<Post[]> {
    // 1. Redis 캐시에서 먼저 확인
    const cached = await this.cacheManager.get<Post[]>('posts');
    if (cached) {
      console.log('✅ 목록 캐시 히트!');
      return cached;
    }

    // 2. 캐시에 없으면 DB 조회
    console.log('💾 DB 조회');
    const posts = await this.postsRepository.findAll();

    // 3. 조회한 데이터를 캐시에 저장 (1분)
    await this.cacheManager.set('posts', posts, 60000);

    return posts;
  }

  // 새 게시물 작성
  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    // 1. 작성자 정보 조회
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    // 2. 게시물 생성
    const post = await this.postsRepository.create({
      ...createPostDto,
      author: user, // 작성자 정보 연결
    });

    // 3. 캐시 무효화 - 새 글이 생겼으니 목록 캐시 삭제
    await this.cacheManager.del('posts');

    return post;
  }

  // 게시물 상세 조회
  async findOne(id: number): Promise<Post> {
    // 1. 캐시 확인
    const cached = await this.cacheManager.get<Post>(`post:${id}`);
    if (cached) {
      console.log(`✅ 게시물 ${id} 캐시 히트!`);
      return cached;
    }
    // 2. DB 조회
    console.log(`💾 게시물 ${id} DB 조회`);
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new NotFoundException(`ID ${id}번 게시물을 찾을 수 없습니다`);
    }
    // 3. 캐시 저장 (5분)
    await this.cacheManager.set(`post:${id}`, post, 300000);

    return post;
  }

  // 조회수 증가 (IP 기반 중복 방지)
  async incrementViewCount(id: number, ip: string): Promise<void> {
    // Redis 키 생성: "view:IP주소:게시물ID"
    const viewKey = `view:${ip}:${id}`;

    // 1. Redis에서 조회 기록 확인
    const alreadyViewed = await this.cacheManager.get(viewKey);

    if (alreadyViewed) {
      // 10분 이내에 이미 조회한 기록이 있으면 무시
      console.log(`🚫 중복 조회 차단: IP=${ip}, Post=${id}`);
      return;
    }

    // 2. 처음 조회 또는 10분 경과 -> 조회수 증가
    const post = await this.findOne(id);
    post.viewCount++;
    await this.postsRepository.save(post);

    // 3. Redis에 조회 기록 저장 (10분 = 600초)
    await this.cacheManager.set(viewKey, true, 600000);
    console.log(`✅ 조회수 증가: IP=${ip}, Post=${id}, Count=${post.viewCount}`);
  }

  // 게시물 수정
  async update(id: number, updatePostDto: UpdatePostDto, userId: number): Promise<Post> {
    const post = await this.findOne(id);

    // 권한 체크: 본인의 게시물만 수정 가능
    if (post.author.id !== userId) {
      throw new ForbiddenException('본인의 게시물만 수정할 수 있습니다');
    }

    const updated = await this.postsRepository.update(id, updatePostDto);

    if (!updated) {
      throw new NotFoundException('수정된 게시물을 찾을 수 없습니다');
    }

    // 캐시 무효화 - 게시물이 수정되었으니 목록 캐시 삭제
    await this.cacheManager.del('posts');

    return updated;
  }

  // 게시물 삭제
  async remove(id: number, userId: number): Promise<void> {
    const post = await this.findOne(id);

    // 권한 체크: 본인의 게시물만 삭제 가능
    if (post.author.id !== userId) {
      throw new ForbiddenException('본인의 게시물만 삭제할 수 있습니다');
    }

    await this.postsRepository.remove(id);

    // 캐시 무효화 - 게시물이 삭제되었으니 목록 캐시 삭제
    await this.cacheManager.del('posts');
  }
}
