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
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Post(':id/view')
  async incrementView(@Param('id') id: string, @Req() req: ExpressRequest) {
    // IP 주소 추출 (프록시 환경 고려)
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    await this.postsService.incrementViewCount(+id, ip);
    return { success: true };
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
