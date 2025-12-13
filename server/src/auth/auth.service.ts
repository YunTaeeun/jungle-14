import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // 회원가입
    async register(registerDto: RegisterDto) {
        // 중복 체크
        const existingUser = await this.usersService.findByUsername(registerDto.username);
        if (existingUser) {
            throw new ConflictException('이미 존재하는 사용자명입니다');
        }

        const existingEmail = await this.usersService.findByEmail(registerDto.email);
        if (existingEmail) {
            throw new ConflictException('이미 존재하는 이메일입니다');
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // 사용자 생성
        const user = await this.usersService.create({
            username: registerDto.username,
            email: registerDto.email,
            password: hashedPassword,
        });

        // 비밀번호 제외하고 반환
        const { password, ...result } = user;
        return result;
    }

    // 로그인
    async login(loginDto: LoginDto) {
        // 사용자 찾기
        const user = await this.usersService.findByUsername(loginDto.username);
        if (!user) {
            throw new UnauthorizedException('사용자명 또는 비밀번호가 올바르지 않습니다');
        }

        // 비밀번호 검증
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('사용자명 또는 비밀번호가 올바르지 않습니다');
        }

        // JWT 토큰 발급
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };
    }

    // 사용자 검증 (JWT Strategy에서 사용)
    async validateUser(userId: number) {
        return await this.usersService.findById(userId);
    }
}
