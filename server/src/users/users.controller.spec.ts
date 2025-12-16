import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UsersController', () => {
    let controller: UsersController;
    let service: jest.Mocked<UsersService>;

    const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        nickname: null,
        createdAt: new Date(),
    };

    const mockRequest = {
        user: { userId: 1, username: 'testuser' },
    };

    beforeEach(async () => {
        const mockService = {
            findById: jest.fn(),
            updateProfile: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [{ provide: UsersService, useValue: mockService }],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMe', () => {
        /* 이 테스트는 { 로그인 사용자 프로필 조회 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should return user profile', async () => {
            service.findById.mockResolvedValue(mockUser);

            const result = await controller.getMe(mockRequest as any);

            expect(service.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockUser);
        });
    });

    describe('updateProfile', () => {
        /* 이 테스트는 { 사용자 프로필 업데이트 API }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should update user profile', async () => {
            const updateDto = { nickname: 'newnick' };
            service.updateProfile.mockResolvedValue({ ...mockUser, nickname: 'newnick' });

            const result = await controller.updateProfile(updateDto, mockRequest as any);

            expect(service.updateProfile).toHaveBeenCalledWith(1, updateDto);
            expect(result.nickname).toBe('newnick');
        });
    });
});
