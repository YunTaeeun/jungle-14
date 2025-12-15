import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Post } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchDto } from './dto/search.dto';
import { PaginatedResult } from './dto/pagination.dto';

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

    if (type === 'title') {
      where.title = { contains: query, mode: 'insensitive' };
    } else if (type === 'content') {
      where.content = { contains: query, mode: 'insensitive' };
    } else if (type === 'author') {
      where.author = {
        username: { contains: query, mode: 'insensitive' },
      };
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
      throw new NotFoundException(`ID ${id}번 게시물을 찾을 수 없습니다`);
    }

    await this.cacheManager.set(`post:${id}`, post, 300000);
    return post;
  }

  // 생성
  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    const post = await this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId: userId,
      },
      include: { author: true },
    });

    await this.cacheManager.del('posts');
    return post;
  }

  // 수정
  async update(id: number, updatePostDto: UpdatePostDto, userId: number): Promise<Post> {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('본인의 게시물만 수정할 수 있습니다');
    }

    const updated = await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: { author: true },
    });

    await this.cacheManager.del('posts');
    await this.cacheManager.del(`post:${id}`);
    return updated;
  }

  // 삭제
  async remove(id: number, userId: number): Promise<void> {
    const post = await this.findOne(id);

    if (post.authorId !== userId) {
      throw new ForbiddenException('본인의 게시물만 삭제할 수 있습니다');
    }

    await this.prisma.post.delete({ where: { id } });
    await this.cacheManager.del('posts');
    await this.cacheManager.del(`post:${id}`);
  }

  // 조회수 증가
  async incrementViewCount(id: number, ip: string): Promise<void> {
    const viewKey = `view:${ip}:${id}`;
    const alreadyViewed = await this.cacheManager.get(viewKey);

    if (alreadyViewed) {
      console.log(`🚫 중복 조회 차단: IP=${ip}, Post=${id}`);
      return;
    }

    await this.prisma.post.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });

    await this.cacheManager.set(viewKey, true, 600000);
    console.log(`✅ 조회수 증가: IP=${ip}, Post=${id}`);
  }
}
