import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  // 특정 게시물의 댓글 목록 조회
  @Get('posts/:postId/comments')
  findAllByPost(@Param('postId') postId: string) {
    return this.commentsService.findAllByPost(+postId);
  }

  // 댓글 작성 (로그인 필수)
  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req
  ) {
    return this.commentsService.create(+postId, createCommentDto, req.user.userId);
  }

  // 댓글 수정 (로그인 필수)
  @Patch('comments/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req
  ) {
    return this.commentsService.update(+id, updateCommentDto, req.user.userId);
  }

  // 댓글 삭제 (로그인 필수)
  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.commentsService.remove(+id, req.user.userId);
  }
}
