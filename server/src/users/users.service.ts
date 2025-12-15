import { Injectable, ConflictException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { nickname },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    return this.prisma.user.create({
      data: userData as any,
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.findById(userId);

    if (!user) {
      throw new ConflictException('사용자를 찾을 수 없습니다');
    }

    // 닉네임 중복 체크
    if (dto.nickname) {
      const existing = await this.findByNickname(dto.nickname);
      if (existing && existing.id !== userId) {
        throw new ConflictException('이미 사용 중인 닉네임입니다');
      }
    }

    // 비밀번호 해싱
    let updateData: any = { ...dto };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // 비밀번호 제외하고 반환
    const { password, ...result } = updated;
    return result;
  }
}

