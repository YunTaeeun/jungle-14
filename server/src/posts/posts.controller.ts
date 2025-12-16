import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Ip, Headers } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchDto } from './dto/search.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  // 스팸 방지: 게시물 생성은 1분에 3회로 제한
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post()
  @UseGuards(JwtAuthGuard) // 로그인 필수
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get('search')
  search(@Query() searchDto: SearchDto) {
    return this.postsService.search(searchDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    if (page && limit) {
      return this.postsService.findAllPaginated(+page, +limit);
    }
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  // 조회수 조작 방지: IP + User-Agent 조합으로 체크
  @Post(':id/view')
  async incrementViewCount(
    @Param('id') id: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const incremented = await this.postsService.incrementViewCount(+id, ip, userAgent || 'unknown');
    return { success: incremented };
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
