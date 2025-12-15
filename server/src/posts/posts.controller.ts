import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req, Res, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchDto } from './dto/search.dto';
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

  // 검색 엔드포인트 (GET /posts/search 보다 먼저 선언)
  @Get('search')
  search(@Query() searchDto: SearchDto) {
    return this.postsService.search(searchDto);
  }

  // 페이지네이션 적용 (query 파라미터로 page, limit 받음)
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.postsService.findAllPaginated(pageNum, limitNum);
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
