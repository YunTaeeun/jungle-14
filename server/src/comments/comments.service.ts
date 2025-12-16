import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Comment } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(postId: number, createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
    // XSS 방지: HTML sanitize
    const sanitizedContent = sanitizeHtml(createCommentDto.content, {
      allowedTags: ['b', 'i', 'em', 'strong'],  // 댓글은 간단한 서식만
      allowedAttributes: {}
    });

    // Prisma는 FK 제약 조건을 자동으로 검증
    return this.prisma.comment.create({
      data: {
        content: sanitizedContent,
        postId,
        authorId: userId,
      },
      include: { author: true },
    });
  }

  async findAllByPost(postId: number): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { postId },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
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

    return this.prisma.comment.update({
      where: { id },
      data: { content: sanitizedContent },
      include: { author: true },
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('본인의 댓글만 삭제할 수 있습니다');
    }

    await this.prisma.comment.delete({ where: { id } });
  }

  async countByPostId(postId: number): Promise<number> {
    return this.prisma.comment.count({
      where: { postId },
    });
  }
}
