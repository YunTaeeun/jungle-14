import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Post } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchDto } from './dto/search.dto';
import { PaginatedResult } from './dto/pagination.dto';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  // 전체 목록 (캐싱 적용)
  async findAll(): Promise<Post[]> {
    const cached = await this.cacheManager.get<Post[]>('posts');
    if (cached) {
      console.log('✅ 목록 캐시 히트!');
      return cached;
    }

    console.log('💾 DB 조회');
    const posts = await this.prisma.post.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    await this.cacheManager.set('posts', posts, 60000);
    return posts;
  }

  // 페이지네이션 (성능 최적화: Promise.all)
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Post>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 검색 (대소문자 무시)
  async search(searchDto: SearchDto): Promise<PaginatedResult<Post>> {
    const { query, type = 'title', page = 1, limit = 10 } = searchDto;
    const skip = (page - 1) * limit;

    let where: any = {};

    // query가 있을 때만 검색 조건 추가
    if (query && query.trim()) {
      if (type === 'title') {
        where.title = { contains: query, mode: 'insensitive' };
      } else if (type === 'content') {
        where.content = { contains: query, mode: 'insensitive' };
      } else if (type === 'author') {
        where.author = {
          username: { contains: query, mode: 'insensitive' },
        };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 상세 조회
  async findOne(id: number): Promise<Post> {
    const cached = await this.cacheManager.get<Post>(`post:${id}`);
    if (cached) {
      console.log(`✅ 게시물 ${id} 캐시 히트!`);
      return cached;
    }

    console.log(`💾 게시물 ${id} DB 조회`);
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!post) {
      throw new NotFoundException('게시물을 찾을 수 없습니다');
    }

    await this.cacheManager.set(`post:${id}`, post, 300000);
    return post;
  }

  // 생성 (XSS 방지 + 캐시 race condition 수정)
  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    // XSS 방지: HTML sanitize
    const sanitizedTitle = sanitizeHtml(createPostDto.title, {
      allowedTags: [],  // 제목은 순수 텍스트만
      allowedAttributes: {}
    });

    const sanitizedContent = sanitizeHtml(createPostDto.content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
      allowedAttributes: {
        'a': ['href']
      }
    });

    // Race condition 방지: 생성 전 캐시 무효화
    await this.cacheManager.del('posts');

    const post = await this.prisma.post.create({
      data: {
        title: sanitizedTitle,
        content: sanitizedContent,
        authorId: userId,
      },
      include: { author: true },
    });

    return post;
  }

  // 수정 (XSS 방지 + 캐시 race condition 수정)
  async update(id: number, updatePostDto: UpdatePostDto, userId: number): Promise<Post> {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('본인의 게시물만 수정할 수 있습니다');
    }

    // XSS 방지: HTML sanitize
    const sanitizedData: any = { ...updatePostDto };

    if (updatePostDto.title) {
      sanitizedData.title = sanitizeHtml(updatePostDto.title, {
        allowedTags: [],
        allowedAttributes: {}
      });
    }

    if (updatePostDto.content) {
      sanitizedData.content = sanitizeHtml(updatePostDto.content, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
        allowedAttributes: {
          'a': ['href']
        }
      });
    }

    // Race condition 방지: 수정 전 캐시 무효화
    await this.cacheManager.del('posts');
    await this.cacheManager.del(`post:${id}`);

    const updated = await this.prisma.post.update({
      where: { id },
      data: sanitizedData,
      include: { author: true },
    });

    return updated;
  }

  // 삭제 (캐시 race condition 수정)
  async remove(id: number, userId: number): Promise<void> {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('본인의 게시물만 삭제할 수 있습니다');
    }

    // Race condition 방지: 삭제 전 캐시 무효화
    await this.cacheManager.del('posts');
    await this.cacheManager.del(`post:${id}`);

    await this.prisma.post.delete({ where: { id } });
  }

  // 조회수 증가 (조작 방지: IP + User-Agent)
  async incrementViewCount(id: number, ip: string, userAgent: string): Promise<boolean> {
    // User-Agent 해시값 사용 (너무 길 수 있으므로)
    const viewKey = `view:${ip}:${userAgent.substring(0, 50)}:${id}`;
    const alreadyViewed = await this.cacheManager.get(viewKey);

    if (alreadyViewed) {
      console.log(`🚫 중복 조회 차단: IP=${ip}, UA=${userAgent.substring(0, 20)}..., Post=${id}`);
      return false;  // 증가하지 않음
    }

    // DB 업데이트
    await this.prisma.post.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });

    // 캐시 일부 수정 (viewCount만 업데이트)
    const cacheKey = `post:${id}`;
    const cachedPost = await this.cacheManager.get<any>(cacheKey);

    if (cachedPost) {
      // 캐시된 게시물이 있으면 viewCount만 증가
      cachedPost.viewCount = (cachedPost.viewCount || 0) + 1;
      await this.cacheManager.set(cacheKey, cachedPost, 300000); // TTL 5분 유지
      console.log(`✅ 조회수 증가 + 캐시 부분 수정: IP=${ip}, Post=${id}`);
    } else {
      console.log(`✅ 조회수 증가 (캐시 없음): IP=${ip}, Post=${id}`);
    }

    // 10분간 같은 조합으로 중복 방지
    await this.cacheManager.set(viewKey, true, 600000);
    return true;  // 증가함
  }
}
