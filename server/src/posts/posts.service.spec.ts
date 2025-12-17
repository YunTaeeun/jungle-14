import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PostsService', () => {
    let service: PostsService;
    let prismaService: any;
    let cacheManager: jest.Mocked<Cache>;

    const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        viewCount: 0,
        authorId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password: 'hash',
            nickname: null,
            createdAt: new Date(),
        },
    };

    const mockPosts = [mockPost];

    beforeEach(async () => {
        const mockPrismaService = {
            post: {
                findMany: jest.fn() as any,
                findUnique: jest.fn() as any,
                create: jest.fn() as any,
                update: jest.fn() as any,
                delete: jest.fn() as any,
                count: jest.fn() as any,
            },
        };

        const mockCacheManager = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: CACHE_MANAGER, useValue: mockCacheManager },
            ],
        }).compile();

        service = module.get<PostsService>(PostsService);
        prismaService = module.get(PrismaService);
        cacheManager = module.get(CACHE_MANAGER);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        /* 이 테스트는 { 게시물 목록 캐시 히트 시 캐시 반환 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return cached posts if available', async () => {
            // Arrange
            cacheManager.get.mockResolvedValue(mockPosts);

            // Act
            const result = await service.findAll();

            // Assert
            expect(cacheManager.get).toHaveBeenCalledWith('posts');
            expect(prismaService.post.findMany).not.toHaveBeenCalled();
            expect(result).toEqual(mockPosts);
        });

        /* 이 테스트는 { 캐시 미스 시 DB 조회 후 캐싱 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should fetch from DB and cache if cache miss', async () => {
            // Arrange
            cacheManager.get.mockResolvedValue(null);
            prismaService.post.findMany.mockResolvedValue(mockPosts);

            // Act
            const result = await service.findAll();

            // Assert
            expect(cacheManager.get).toHaveBeenCalledWith('posts');
            expect(prismaService.post.findMany).toHaveBeenCalledWith({
                include: { author: true },
                orderBy: { createdAt: 'desc' },
            });
            expect(cacheManager.set).toHaveBeenCalledWith('posts', mockPosts, 60000);
            expect(result).toEqual(mockPosts);
        });
    });

    describe('findAllPaginated', () => {
        /* 이 테스트는 { 페이지네이션 결과와 메타데이터 반환 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return paginated results with correct metadata', async () => {
            // Arrange
            prismaService.post.findMany.mockResolvedValue(mockPosts);
            prismaService.post.count.mockResolvedValue(10);

            // Act
            const result = await service.findAllPaginated(1, 10);

            // Assert
            expect(result).toEqual({
                data: mockPosts,
                total: 10,
                page: 1,
                limit: 10,
                totalPages: 1,
            });
        });

        /* 이 테스트는 { Promise.all로 병렬 쿼리 실행 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should use Promise.all for parallel queries', async () => {
            // Arrange
            prismaService.post.findMany.mockResolvedValue(mockPosts);
            prismaService.post.count.mockResolvedValue(5);

            // Act
            await service.findAllPaginated(2, 10);

            // Assert
            expect(prismaService.post.findMany).toHaveBeenCalledWith({
                skip: 10,
                take: 10,
                include: { author: true },
                orderBy: { createdAt: 'desc' },
            });
            expect(prismaService.post.count).toHaveBeenCalled();
        });

        /* 이 테스트는 { 전체 페이지 수 올바르게 계산 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should calculate totalPages correctly', async () => {
            // Arrange
            prismaService.post.findMany.mockResolvedValue(mockPosts);
            prismaService.post.count.mockResolvedValue(25);

            // Act
            const result = await service.findAllPaginated(1, 10);

            // Assert
            expect(result.totalPages).toBe(3); // ceil(25/10) = 3
        });
    });

    describe('search', () => {
        /* 이 테스트는 { 제목으로 검색 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should search by title', async () => {
            // Arrange
            const searchDto = { query: 'test', type: 'title' as const, page: 1, limit: 10 };
            prismaService.post.findMany.mockResolvedValue(mockPosts);
            prismaService.post.count.mockResolvedValue(1);

            // Act
            const result = await service.search(searchDto);

            // Assert
            expect(prismaService.post.findMany).toHaveBeenCalledWith({
                where: { title: { contains: 'test', mode: 'insensitive' } },
                skip: 0,
                take: 10,
                include: { author: true },
                orderBy: { createdAt: 'desc' },
            });
            expect(result.data).toEqual(mockPosts);
        });

        /* 이 테스트는 { 내용으로 검색 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should search by content', async () => {
            // Arrange
            const searchDto = { query: 'content', type: 'content' as const, page: 1, limit: 10 };
            prismaService.post.findMany.mockResolvedValue(mockPosts);
            prismaService.post.count.mockResolvedValue(1);

            // Act
            await service.search(searchDto);

            // Assert
            expect(prismaService.post.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { content: { contains: 'content', mode: 'insensitive' } },
                }),
            );
        });

        /* 이 테스트는 { 작성자명으로 검색 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should search by author', async () => {
            // Arrange
            const searchDto = { query: 'user', type: 'author' as const, page: 1, limit: 10 };
            prismaService.post.findMany.mockResolvedValue(mockPosts);
            prismaService.post.count.mockResolvedValue(1);

            // Act
            await service.search(searchDto);

            // Assert
            expect(prismaService.post.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { author: { username: { contains: 'user', mode: 'insensitive' } } },
                }),
            );
        });
    });

    describe('findOne', () => {
        /* 이 테스트는 { 개별 게시물 캐시 히트 시 캐시 반환 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return cached post if available', async () => {
            // Arrange
            cacheManager.get.mockResolvedValue(mockPost);

            // Act
            const result = await service.findOne(1);

            // Assert
            expect(cacheManager.get).toHaveBeenCalledWith('post:1');
            expect(prismaService.post.findUnique).not.toHaveBeenCalled();
            expect(result).toEqual(mockPost);
        });

        /* 이 테스트는 { 캐시 미스 시 DB 조회 후 게시물 캐싱 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should fetch from DB and cache if cache miss', async () => {
            // Arrange
            cacheManager.get.mockResolvedValue(null);
            prismaService.post.findUnique.mockResolvedValue(mockPost);

            // Act
            const result = await service.findOne(1);

            // Assert
            expect(prismaService.post.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { author: true },
            });
            expect(cacheManager.set).toHaveBeenCalledWith('post:1', mockPost, 300000);
            expect(result).toEqual(mockPost);
        });

        /* 이 테스트는 { 존재하지 않는 게시물 조회 시 예외 발생 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should throw NotFoundException if post not found', async () => {
            // Arrange
            cacheManager.get.mockResolvedValue(null);
            prismaService.post.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findOne(999)).rejects.toThrow(
                new NotFoundException('게시물을 찾을 수 없습니다.'),
            );
        });
    });

    describe('create', () => {
        /* 이 테스트는 { 게시물 생성 및 목록 캐시 무효화 }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should create a post and invalidate cache', async () => {
            // Arrange
            const createDto = { title: 'New Post', content: 'New Content' };
            prismaService.post.create.mockResolvedValue(mockPost);

            // Act
            const result = await service.create(createDto, 1);

            // Assert
            expect(prismaService.post.create).toHaveBeenCalledWith({
                data: {
                    title: 'New Post',  // sanitized
                    content: 'New Content',  // sanitized
                    authorId: 1
                },
                include: { author: true },
            });
            expect(cacheManager.del).toHaveBeenCalledWith('posts');
            expect(result).toEqual(mockPost);
        });
    });

    describe('update', () => {
        /* 이 테스트는 { 게시물 수정 및 캐시 무효화 }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should update post and invalidate cache', async () => {
            // Arrange
            const updateDto = { title: 'Updated' };
            cacheManager.get.mockResolvedValue(null);
            prismaService.post.findUnique.mockResolvedValue(mockPost);
            prismaService.post.update.mockResolvedValue({ ...mockPost, ...updateDto });

            // Act
            const result = await service.update(1, updateDto, 1);

            // Assert
            expect(prismaService.post.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateDto,
                include: { author: true },
            });
            expect(cacheManager.del).toHaveBeenCalledWith('posts');
            expect(cacheManager.del).toHaveBeenCalledWith('post:1');
            expect(result.title).toBe('Updated');
        });

        /* 이 테스트는 { 작성자가 아닌 사용자의 게시물 수정 시도 차단 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should throw ForbiddenException if not author', async () => {
            // Arrange
            cacheManager.get.mockResolvedValue(null);
            prismaService.post.findUnique.mockResolvedValue(mockPost);

            // Act & Assert
            await expect(service.update(1, { title: 'Updated' }, 999)).rejects.toThrow(
                new ForbiddenException('본인의 게시물만 수정할 수 있습니다'),
            );
            expect(prismaService.post.update).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        /* 이 테스트는 { 게시물 삭제 및 캐시 무효화 }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should delete post and invalidate cache', async () => {
            // Arrange
            cacheManager.get.mockResolvedValue(null);
            prismaService.post.findUnique.mockResolvedValue(mockPost);
            prismaService.post.delete.mockResolvedValue(mockPost);

            // Act
            await service.remove(1, 1);

            // Assert
            expect(prismaService.post.delete).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(cacheManager.del).toHaveBeenCalledWith('posts');
            expect(cacheManager.del).toHaveBeenCalledWith('post:1');
        });

        /* 이 테스트는 { 작성자가 아닌 사용자의 게시물 삭제 시도 차단 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should throw ForbiddenException if not author', async () => {
            // Arrange
            cacheManager.get.mockResolvedValue(null);
            prismaService.post.findUnique.mockResolvedValue(mockPost);

            // Act & Assert
            await expect(service.remove(1, 999)).rejects.toThrow(
                new ForbiddenException('본인의 게시물만 삭제할 수 있습니다'),
            );
            expect(prismaService.post.delete).not.toHaveBeenCalled();
        });
    });

    describe('incrementViewCount', () => {
        /* 이 테스트는 { 처음 조회 시 조회수 증가 }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should increment view count if not already viewed', async () => {
            // Arrange
            cacheManager.get.mockResolvedValueOnce(null); // view key
            cacheManager.get.mockResolvedValueOnce(mockPost); // post cache
            prismaService.post.update.mockResolvedValue({ ...mockPost, viewCount: 1 });

            // Act
            const result = await service.incrementViewCount(1, '127.0.0.1', 'Mozilla/5.0');

            // Assert
            expect(cacheManager.get).toHaveBeenCalledWith('view:127.0.0.1:Mozilla/5.0:1');
            expect(prismaService.post.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { viewCount: { increment: 1 } },
            });
            expect(cacheManager.set).toHaveBeenCalledWith('view:127.0.0.1:Mozilla/5.0:1', true, 600000);
            expect(result).toBe(true);
        });

        /* 이 테스트는 { 중복 조회 방지 (이미 본 경우) }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should not increment if already viewed', async () => {
            // Arrange
            cacheManager.get.mockResolvedValue(true);

            // Act
            const result = await service.incrementViewCount(1, '127.0.0.1', 'Mozilla/5.0');

            // Assert
            expect(prismaService.post.update).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });

        /* 이 테스트는 { 캐시된 게시물의 조회수 업데이트 }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should update cached post viewCount', async () => {
            // Arrange
            const cachedPost = { ...mockPost, viewCount: 5 };
            cacheManager.get.mockResolvedValueOnce(null); // view key
            cacheManager.get.mockResolvedValueOnce(cachedPost); // post cache
            prismaService.post.update.mockResolvedValue({ ...cachedPost, viewCount: 6 });

            // Act
            await service.incrementViewCount(1, '127.0.0.1', 'Mozilla/5.0');

            // Assert
            expect(cacheManager.set).toHaveBeenCalledWith(
                'post:1',
                expect.objectContaining({ viewCount: 6 }),
                300000,
            );
        });
    });
});
