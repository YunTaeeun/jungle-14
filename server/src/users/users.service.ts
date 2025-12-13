import { Injectable, ConflictException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) { }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async create(userData: Partial<User>): Promise<User> {
    return this.usersRepository.create(userData);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.findById(userId);

    if (!user) {
      throw new ConflictException('사용자를 찾을 수 없습니다');
    }

    // 닉네임 중복 체크
    if (dto.nickname) {
      const existing = await this.usersRepository.findByNickname(dto.nickname);
      if (existing && existing.id !== userId) {
        throw new ConflictException('이미 사용 중인 닉네임입니다');
      }
    }

    // 비밀번호 해싱
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    const updated = await this.usersRepository.save(user);

    // 비밀번호 제외하고 반환
    const { password, ...result } = updated;
    return result;
  }
}
