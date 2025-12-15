import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Ip } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SearchDto } from './dto/search.dto';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

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

  @Post(':id/view')
  async incrementViewCount(
    @Param('id') id: string,
    @Ip() ip: string,
  ) {
    const incremented = await this.postsService.incrementViewCount(+id, ip);
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
