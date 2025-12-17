import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Comment } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginatedResult } from '../posts/dto/pagination.dto';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async create(postId: number, createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
    // XSS 방지: HTML sanitize
    const sanitizedContent = sanitizeHtml(createCommentDto.content, {
      allowedTags: ['b', 'i', 'em', 'strong'],  // 댓글은 간단한 서식만
      allowedAttributes: {}
    });

    // Prisma는 FK 제약 조건을 자동으로 검증
    const comment = await this.prisma.comment.create({
      data: {
        content: sanitizedContent,
        postId,
        authorId: userId,
      },
      include: { author: true },
    });

    // 캐시 무효화
    await this.invalidateCommentCache(postId);

    return comment;
  }

  async findAllByPost(postId: number, page: number = 1, limit: number = 20): Promise<PaginatedResult<Comment>> {
    const skip = (page - 1) * limit;

    // 캐시 키 생성
    const cacheKey = `comments:post:${postId}:${page}:${limit}`;
    const cached = await this.cacheManager.get<PaginatedResult<Comment>>(cacheKey);

    if (cached) {
      console.log(`✅ 댓글 캐시 히트: Post ${postId}, Page ${page}`);
      return cached;
    }

    console.log(`💾 댓글 DB 조회: Post ${postId}, Page ${page}`);

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        skip,
        take: limit,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count({ where: { postId } }),
    ]);

    const result = {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // 3분간 캐시
    await this.cacheManager.set(cacheKey, result, 180000);
    return result;
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다');
    }

    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('본인의 댓글만 수정할 수 있습니다');
    }

    // XSS 방지: HTML sanitize
    const sanitizedContent = updateCommentDto.content
      ? sanitizeHtml(updateCommentDto.content, {
        allowedTags: ['b', 'i', 'em', 'strong'],
        allowedAttributes: {}
      })
      : comment.content; // content가 없으면 기존 값 유지

    const updated = await this.prisma.comment.update({
      where: { id },
      data: { content: sanitizedContent },
      include: { author: true },
    });

    // 캐시 무효화
    await this.invalidateCommentCache(comment.postId);

    return updated;
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('본인의 댓글만 삭제할 수 있습니다');
    }

    await this.prisma.comment.delete({ where: { id } });

    // 캐시 무효화
    await this.invalidateCommentCache(comment.postId);
  }

  async countByPostId(postId: number): Promise<number> {
    return this.prisma.comment.count({
      where: { postId },
    });
  }

  // 캐시 무효화 헬퍼
  private async invalidateCommentCache(postId: number): Promise<void> {
    // 해당 게시물의 모든 페이지 캐시 삭제
    // Redis의 패턴 매칭을 사용해야 하지만, cache-manager는 지원 안함
    // 대신 주요 페이지들만 수동으로 삭제
    const pagesToInvalidate = [1, 2, 3, 4, 5]; // 처음 5페이지 무효화
    const limits = [20]; // 기본 limit

    for (const page of pagesToInvalidate) {
      for (const limit of limits) {
        const key = `comments:post:${postId}:${page}:${limit}`;
        await this.cacheManager.del(key);
      }
    }

    console.log(`🗑️  댓글 캐시 무효화: Post ${postId}`);
  }
}
