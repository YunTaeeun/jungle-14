import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
    let prismaService: any;

    const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        nickname: null,
        createdAt: new Date(),
    };

    beforeEach(async () => {
        const mockPrismaService = {
            user: {
                findUnique: jest.fn() as any,
                create: jest.fn() as any,
                update: jest.fn() as any,
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prismaService = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findById', () => {
        /* 이 테스트는 { ID로 사용자 조회 성공 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return user if found', async () => {
            // Arrange
            prismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await service.findById(1);

            // Assert
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockUser);
        });

        /* 이 테스트는 { 존재하지 않는 사용자 ID 조회 시 null 반환 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return null if user not found', async () => {
            // Arrange
            prismaService.user.findUnique.mockResolvedValue(null);

            // Act
            const result = await service.findById(999);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('findByUsername', () => {
        /* 이 테스트는 { 사용자명으로 사용자 조회 성공 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return user if found', async () => {
            // Arrange
            prismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await service.findByUsername('testuser');

            // Assert
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'testuser' },
            });
            expect(result).toEqual(mockUser);
        });

        /* 이 테스트는 { 존재하지 않는 사용자명 조회 시 null 반환 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return null if user not found', async () => {
            // Arrange
            prismaService.user.findUnique.mockResolvedValue(null);

            // Act
            const result = await service.findByUsername('nonexistent');

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('findByEmail', () => {
        /* 이 테스트는 { 이메일로 사용자 조회 성공 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return user if found', async () => {
            // Arrange
            prismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await service.findByEmail('test@example.com');

            // Assert
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(result).toEqual(mockUser);
        });

        /* 이 테스트는 { 존재하지 않는 이메일 조회 시 null 반환 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return null if user not found', async () => {
            // Arrange
            prismaService.user.findUnique.mockResolvedValue(null);

            // Act
            const result = await service.findByEmail('nonexistent@example.com');

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        /* 이 테스트는 { 새로운 사용자 생성 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should create a new user', async () => {
            // Arrange
            const createDto = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'hashedPassword',
            };
            prismaService.user.create.mockResolvedValue(mockUser);

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: createDto,
            });
            expect(result).toEqual(mockUser);
        });
    });

    describe('updateProfile', () => {
        /* 이 테스트는 { 사용자 프로필 업데이트 성공 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should update user profile', async () => {
            // Arrange
            const updateDto = { nickname: 'newnick', email: 'new@example.com' };
            prismaService.user.findUnique.mockResolvedValue(mockUser);
            prismaService.user.update.mockResolvedValue({
                ...mockUser,
                nickname: 'newnick',
                email: 'new@example.com',
            });

            // Act
            const result = await service.updateProfile(1, updateDto);

            // Assert
            expect(prismaService.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateDto,
            });
            expect(result.nickname).toBe('newnick');
        });

        /* 이 테스트는 { 존재하지 않는 사용자 프로필 업데이트 시도 시 예외 발생 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should throw NotFoundException if user not found', async () => {
            // Arrange
            prismaService.user.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(
                service.updateProfile(999, { nickname: 'test' }),
            ).rejects.toThrow(new ConflictException('사용자를 찾을 수 없습니다'));
        });

        /* 이 테스트는 { 중복 닉네임 업데이트 시도 시 예외 발생 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should throw ConflictException if nickname already taken', async () => {
            // Arrange
            const otherUser = { ...mockUser, id: 2, nickname: 'taken' };
            prismaService.user.findUnique
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(otherUser);

            // Act & Assert
            await expect(
                service.updateProfile(1, { nickname: 'taken' }),
            ).rejects.toThrow(new ConflictException('이미 사용 중인 닉네임입니다'));
        });

        /* 이 테스트는 { 본인 닉네임 유지 허용 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should allow same user to keep their nickname', async () => {
            // Arrange
            const userWithNick = { ...mockUser, nickname: 'mynick' };
            prismaService.user.findUnique
                .mockResolvedValueOnce(userWithNick)
                .mockResolvedValueOnce(userWithNick);
            prismaService.user.update.mockResolvedValue(userWithNick);

            // Act
            const result = await service.updateProfile(1, { nickname: 'mynick' });

            // Assert
            expect(result.nickname).toBe('mynick');
            expect(prismaService.user.update).toHaveBeenCalled();
        });

        /* 이 테스트는 { 중복 이메일 업데이트 시도 시 예외 발생 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should throw ConflictException if email already taken', async () => {
            // Arrange
            const otherUser = { ...mockUser, id: 2, email: 'taken@example.com' };
            prismaService.user.findUnique
                .mockResolvedValueOnce(mockUser) // findById
                .mockResolvedValueOnce(otherUser); // findByEmail - conflict!

            // Act & Assert
            await expect(
                service.updateProfile(1, { email: 'taken@example.com' }),
            ).rejects.toThrow(new ConflictException('이미 사용 중인 이메일입니다'));

            // Should not reach update
            expect(prismaService.user.update).not.toHaveBeenCalled();
        });

        /* 이 테스트는 { 비밀번호 업데이트 시 bcrypt 해싱 적용 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should update password with hashing', async () => {
            // Arrange
            prismaService.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
            prismaService.user.update.mockResolvedValue({
                ...mockUser,
                password: 'newHashedPassword',
            });

            // Act
            await service.updateProfile(1, { password: 'newpass' });

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
            expect(prismaService.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { password: 'newHashedPassword' },
            });
        });
    });
});
