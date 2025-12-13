import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) { }

    async findByUsername(username: string): Promise<User | null> {
        return this.repository.findOne({ where: { username } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({ where: { email } });
    }

    async findById(id: number): Promise<User | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByNickname(nickname: string): Promise<User | null> {
        return this.repository.findOne({ where: { nickname } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.repository.create(userData);
        return this.repository.save(user);
    }

    async save(user: User): Promise<User> {
        return this.repository.save(user);
    }
}
