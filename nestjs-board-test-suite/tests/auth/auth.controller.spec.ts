import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    let service: jest.Mocked<AuthService>;

    beforeEach(async () => {
        const mockService = {
            register: jest.fn(),
            login: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockService }],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        /* 이 테스트는 { 사용자 등록 API 엔드포인트 }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should register a new user', async () => {
            const registerDto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            };
            const result = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                nickname: null,
                createdAt: new Date(),
            };
            service.register.mockResolvedValue(result);

            const response = await controller.register(registerDto);

            expect(service.register).toHaveBeenCalledWith(registerDto);
            expect(response).toEqual(result);
        });
    });

    describe('login', () => {
        /* 이 테스트는 { 로그인 API 엔드포인트 및 JWT 토큰 발급 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
        it('should login and return access token', async () => {
            const loginDto = {
                username: 'testuser',
                password: 'password123',
            };
            const result = {
                access_token: 'jwt-token',
                user: {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                },
            };
            service.login.mockResolvedValue(result);

            const response = await controller.login(loginDto);

            expect(service.login).toHaveBeenCalledWith(loginDto);
            expect(response).toEqual(result);
        });
    });
});
