import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req, Res } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request as ExpressRequest, Response } from 'express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Post()
  @UseGuards(JwtAuthGuard) // 로그인 필수
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const postId = +id;
    const post = await this.postsService.findOne(postId);

    // 쿠키에서 조회한 게시물 목록 가져오기
    const viewedPosts = req.cookies['viewed_posts'] ? JSON.parse(req.cookies['viewed_posts']) : {};
    const now = Date.now();

    // 10분(600,000ms) 이내에 조회한 적이 없으면 조회수 증가
    if (!viewedPosts[postId] || now - viewedPosts[postId] > 600000) {
      await this.postsService.incrementViewCount(postId);
      viewedPosts[postId] = now;

      // 쿠키 업데이트 (10분 후 만료)
      res.cookie('viewed_posts', JSON.stringify(viewedPosts), {
        maxAge: 600000, // 10분
        httpOnly: true,
      });
    }

    return post;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) // 로그인 필수
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Request() req) {
    return this.postsService.update(+id, updatePostDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) // 로그인 필수
  remove(@Param('id') id: string, @Request() req) {
    return this.postsService.remove(+id, req.user.userId);
  }
}
