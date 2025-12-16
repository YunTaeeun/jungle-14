import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword123',
    nickname: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    /* 이 테스트는 { 새로운 사용자 등록 성공 시나리오 }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    const registerDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.create.mockResolvedValue(mockUser);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(usersService.findByUsername).toHaveBeenCalledWith('newuser');
      expect(usersService.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'hashedPassword',
      });
      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe('testuser');
    });

    /* 이 테스트는 { 중복 사용자명 검증 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    it('should throw ConflictException if username already exists', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('이미 존재하는 사용자명입니다'),
      );
      expect(usersService.findByEmail).not.toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
    });

    /* 이 테스트는 { 중복 이메일 검증 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('이미 존재하는 이메일입니다'),
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });

    /* 이 테스트는 { 비밀번호 bcrypt 해싱 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    it('should hash password with bcrypt', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      usersService.create.mockResolvedValue(mockUser);

      // Act
      await service.register(registerDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedPassword123',
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      username: 'testuser',
      password: 'password123',
    };

    /* 이 테스트는 { 로그인 성공 및 JWT 토큰 발급 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    it('should successfully login and return access token', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token-123');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(usersService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 1,
      });
      expect(result).toEqual({
        access_token: 'jwt-token-123',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      });
    });

    /* 이 테스트는 { 존재하지 않는 사용자 로그인 시도 차단 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('사용자명 또는 비밀번호가 올바르지 않습니다'),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    /* 이 테스트는 { 잘못된 비밀번호 입력 시 로그인 차단 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('사용자명 또는 비밀번호가 올바르지 않습니다'),
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    /* 이 테스트는 { JWT 페이로드에 올바른 사용자 정보 포함 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    it('should include correct user information in token payload', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token');

      // Act
      await service.login(loginDto);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
      });
    });

    /* 이 테스트는 { 응답에서 비밀번호 노출 방지 }를 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    it('should not expose password in response', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('validateUser', () => {
    /* 이 테스트는 { JWT 전략에서 사용자 검증 성공 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    it('should return user if found', async () => {
      // Arrange
      usersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser(1);

      // Assert
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    /* 이 테스트는 { 존재하지 않는 사용자 검증 시 null 반환 }을 테스트하는 기능입니다. 해당 기능이 없다면 주석처리 해주세요 */
    it('should return null if user not found', async () => {
      // Arrange
      usersService.findById.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(999);

      // Assert
      expect(usersService.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });
});
