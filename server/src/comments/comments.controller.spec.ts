import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('CommentsController', () => {
    let controller: CommentsController;
    let service: jest.Mocked<CommentsService>;

    const mockComment = {
        id: 1,
        content: 'Test Comment',
        postId: 1,
        authorId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockRequest = {
        user: { userId: 1, username: 'testuser' },
    };

    beforeEach(async () => {
        const mockService = {
            findAllByPost: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentsController],
            providers: [{ provide: CommentsService, useValue: mockService }],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<CommentsController>(CommentsController);
        service = module.get(CommentsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAllByPost', () => {
        /* 이 테스트는 { 특정 게시물의 댓글 목록 조회 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return all comments for a post', async () => {
            service.findAllByPost.mockResolvedValue([mockComment]);

            const result = await controller.findAllByPost('1');

            expect(service.findAllByPost).toHaveBeenCalledWith(1);
            expect(result).toEqual([mockComment]);
        });
    });

    describe('create', () => {
        /* 이 테스트는 { 댓글 생성 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should create a comment', async () => {
            const createDto = { content: 'New Comment' };
            service.create.mockResolvedValue(mockComment);

            const result = await controller.create('1', createDto, mockRequest as any);

            expect(service.create).toHaveBeenCalledWith(1, createDto, 1);
            expect(result).toEqual(mockComment);
        });
    });

    describe('update', () => {
        /* 이 테스트는 { 댓글 수정 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should update a comment', async () => {
            const updateDto = { content: 'Updated' };
            service.update.mockResolvedValue({ ...mockComment, content: 'Updated' });

            const result = await controller.update('1', updateDto, mockRequest as any);

            expect(service.update).toHaveBeenCalledWith(1, updateDto, 1);
            expect(result.content).toBe('Updated');
        });
    });

    describe('remove', () => {
        /* 이 테스트는 { 댓글 삭제 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should delete a comment', async () => {
            service.remove.mockResolvedValue();

            await controller.remove('1', mockRequest as any);

            expect(service.remove).toHaveBeenCalledWith(1, 1);
        });
    });
});
