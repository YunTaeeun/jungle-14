import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommentsService', () => {
    let service: CommentsService;
    let prismaService: any;

    const mockComment = {
        id: 1,
        content: 'Test Comment',
        postId: 1,
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

    beforeEach(async () => {
        const mockPrismaService = {
            comment: {
                findMany: jest.fn() as any,
                create: jest.fn() as any,
                findUnique: jest.fn() as any,
                update: jest.fn() as any,
                delete: jest.fn() as any,
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<CommentsService>(CommentsService);
        prismaService = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAllByPost', () => {
        /* 이 테스트는 { 특정 게시물의 모든 댓글 조회 }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return all comments for a post', async () => {
            // Arrange
            const comments = [mockComment];
            prismaService.comment.findMany.mockResolvedValue(comments);

            // Act
            const result = await service.findAllByPost(1);

            // Assert
            expect(prismaService.comment.findMany).toHaveBeenCalledWith({
                where: { postId: 1 },
                include: { author: true },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(comments);
        });

        /* 이 테스트는 { 댓글이 없는 경우 빈 배열 반환 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return empty array if no comments', async () => {
            // Arrange
            prismaService.comment.findMany.mockResolvedValue([]);

            // Act
            const result = await service.findAllByPost(1);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('create', () => {
        /* 이 테스트는 { 새로운 댓글 생성 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should create a comment', async () => {
            // Arrange
            const createDto = { content: 'New Comment' };
            prismaService.comment.create.mockResolvedValue(mockComment);

            // Act
            const result = await service.create(1, createDto, 1);

            // Assert
            expect(prismaService.comment.create).toHaveBeenCalledWith({
                data: {
                    content: 'New Comment',
                    postId: 1,
                    authorId: 1,
                },
                include: { author: true },
            });
            expect(result).toEqual(mockComment);
        });

        /* 이 테스트는 { 생성된 댓글에 작성자 정보 포함 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should include author information in created comment', async () => {
            // Arrange
            const createDto = { content: 'Test' };
            prismaService.comment.create.mockResolvedValue(mockComment);

            // Act
            const result = await service.create(1, createDto, 1);

            // Assert
            expect((result as any).author).toBeDefined();
            expect((result as any).author.username).toBe('testuser');
        });
    });

    describe('update', () => {
        /* 이 테스트는 { 댓글 수정 성공 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should update a comment', async () => {
            // Arrange
            const updateDto = { content: 'Updated Content' };
            prismaService.comment.findUnique.mockResolvedValue(mockComment);
            prismaService.comment.update.mockResolvedValue({
                ...mockComment,
                content: 'Updated Content',
            });

            // Act
            const result = await service.update(1, updateDto, 1);

            // Assert
            expect(prismaService.comment.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateDto,
                include: { author: true },
            });
            expect(result.content).toBe('Updated Content');
        });

        /* 이 테스트는 { 존재하지 않는 댓글 수정 시도 시 예외 발생 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should throw NotFoundException if comment not found', async () => {
            // Arrange
            prismaService.comment.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.update(999, { content: 'Test' }, 1)).rejects.toThrow(
                new NotFoundException(`ID 999번 댓글을 찾을 수 없습니다.`),
            );
            expect(prismaService.comment.update).not.toHaveBeenCalled();
        });

        /* 이 테스트는 { 작성자가 아닌 사용자의 댓글 수정 시도 차단 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should throw ForbiddenException if not author', async () => {
            // Arrange
            prismaService.comment.findUnique.mockResolvedValue(mockComment);

            // Act & Assert
            await expect(service.update(1, { content: 'Test' }, 999)).rejects.toThrow(
                new ForbiddenException(`본인의 댓글만 수정할 수 있습니다.`),
            );
            expect(prismaService.comment.update).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        /* 이 테스트는 { 댓글 삭제 성공 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should delete a comment', async () => {
            // Arrange
            prismaService.comment.findUnique.mockResolvedValue(mockComment);
            prismaService.comment.delete.mockResolvedValue(mockComment);

            // Act
            await service.remove(1, 1);

            // Assert
            expect(prismaService.comment.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        /* 이 테스트는 { 존재하지 않는 댓글 삭제 시도 시 예외 발생 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should throw NotFoundException if comment not found', async () => {
            // Arrange
            prismaService.comment.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.remove(999, 1)).rejects.toThrow(
                new NotFoundException(`ID 999번 댓글을 찾을 수 없습니다.`),
            );
            expect(prismaService.comment.delete).not.toHaveBeenCalled();
        });

        /* 이 테스트는 { 작성자가 아닌 사용자의 댓글 삭제 시도 차단 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should throw ForbiddenException if not author', async () => {
            // Arrange
            prismaService.comment.findUnique.mockResolvedValue(mockComment);

            // Act & Assert
            await expect(service.remove(1, 999)).rejects.toThrow(
                new ForbiddenException(`본인의 댓글만 삭제할 수 있습니다.`),
            );
            expect(prismaService.comment.delete).not.toHaveBeenCalled();
        });
    });
});
