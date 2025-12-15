import { IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsPositive({ message: 'page는 1 이상이어야 합니다.' })
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsPositive({ message: 'limit은 1 이상이어야 합니다.' })
    @Min(1)
    limit?: number = 10;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
