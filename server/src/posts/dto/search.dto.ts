import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class SearchDto extends PaginationDto {
    @IsNotEmpty({ message: '검색어를 입력해주세요.' })
    @IsString()
    query: string;

    @IsOptional()
    @IsIn(['title', 'content', 'author'], { message: 'type은 title, content, author 중 하나여야 합니다.' })
    type?: 'title' | 'content' | 'author' = 'title';
}
