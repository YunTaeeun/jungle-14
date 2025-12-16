import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('PostsController', () => {
    let controller: PostsController;
    let service: jest.Mocked<PostsService>;

    const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        viewCount: 0,
        authorId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockRequest = {
        user: { userId: 1, username: 'testuser' },
    };

    beforeEach(async () => {
        const mockService = {
            findAll: jest.fn(),
            findAllPaginated: jest.fn(),
            search: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            incrementViewCount: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostsController],
            providers: [{ provide: PostsService, useValue: mockService }],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<PostsController>(PostsController);
        service = module.get(PostsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        /* 이 테스트는 { 페이지네이션 없이 모든 게시물 조회 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return all posts without pagination', async () => {
            service.findAll.mockResolvedValue([mockPost]);

            const result = await controller.findAll({});

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockPost]);
        });

        /* 이 테스트는 { 페이지 및 limit 제공 시 페이지네이션 적용 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return paginated posts when page and limit provided', async () => {
            const paginatedResult = {
                data: [mockPost],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
            };
            service.findAllPaginated.mockResolvedValue(paginatedResult);

            const result = await controller.findAll({ page: 1, limit: 10 });

            expect(service.findAllPaginated).toHaveBeenCalledWith(1, 10);
            expect(result).toEqual(paginatedResult);
        });
    });

    describe('search', () => {
        /* 이 테스트는 { 게시물 검색 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should search posts', async () => {
            const searchDto = { query: 'test', type: 'title' as const, page: 1, limit: 10 };
            const searchResult = {
                data: [mockPost],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
            };
            service.search.mockResolvedValue(searchResult);

            const result = await controller.search(searchDto);

            expect(service.search).toHaveBeenCalledWith(searchDto);
            expect(result).toEqual(searchResult);
        });
    });

    describe('findOne', () => {
        /* 이 테스트는 { 개별 게시물 조회 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return a single post', async () => {
            service.findOne.mockResolvedValue(mockPost);

            const result = await controller.findOne('1');

            expect(service.findOne).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockPost);
        });
    });

    describe('create', () => {
        /* 이 테스트는 { 게시물 생성 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should create a new post', async () => {
            const createDto = { title: 'New Post', content: 'New Content' };
            service.create.mockResolvedValue(mockPost);

            const result = await controller.create(createDto, mockRequest as any);

            expect(service.create).toHaveBeenCalledWith(createDto, 1);
            expect(result).toEqual(mockPost);
        });
    });

    describe('update', () => {
        /* 이 테스트는 { 게시물 수정 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should update a post', async () => {
            const updateDto = { title: 'Updated' };
            service.update.mockResolvedValue({ ...mockPost, title: 'Updated' });

            const result = await controller.update('1', updateDto, mockRequest as any);

            expect(service.update).toHaveBeenCalledWith(1, updateDto, 1);
            expect(result.title).toBe('Updated');
        });
    });

    describe('remove', () => {
        /* 이 테스트는 { 게시물 삭제 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should delete a post', async () => {
            service.remove.mockResolvedValue();

            await controller.remove('1', mockRequest as any);

            expect(service.remove).toHaveBeenCalledWith(1, 1);
        });
    });

    describe('incrementViewCount', () => {
        /* 이 테스트는 { 게시물 조회수 증가 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should increment view count', async () => {
            service.incrementViewCount.mockResolvedValue(true);

            const result = await controller.incrementViewCount('1', '127.0.0.1');

            expect(service.incrementViewCount).toHaveBeenCalledWith(1, '127.0.0.1');
            expect(result).toEqual({ success: true });
        });

        /* 이 테스트는 { 중복 조회 시 false 반환 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return false if already viewed', async () => {
            service.incrementViewCount.mockResolvedValue(false);

            const result = await controller.incrementViewCount('1', '127.0.0.1');

            expect(result).toEqual({ success: false });
        });
    });
});
