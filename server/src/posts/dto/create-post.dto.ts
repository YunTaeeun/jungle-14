import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty({ message: '제목은 필수입니다' })
    @MinLength(1, { message: '제목은 최소 1자 이상이어야 합니다' })
    @MaxLength(200, { message: '제목은 최대 200자까지 가능합니다' })
    title: string;

    @IsString()
    @IsNotEmpty({ message: '내용은 필수입니다' })
    @MinLength(1, { message: '내용은 최소 1자 이상이어야 합니다' })
    @MaxLength(50000, { message: '내용은 최대 50000자까지 가능합니다' })
    content: string;
}
