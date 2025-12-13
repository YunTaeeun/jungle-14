import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsRepository {
    constructor(
        @InjectRepository(Post)
        private readonly repository: Repository<Post>,
    ) { }

    async findAll(): Promise<Post[]> {
        return this.repository.find({ relations: ['author'] });
    }

    async findById(id: number): Promise<Post | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['author'],
        });
    }

    async create(postData: Partial<Post>): Promise<Post> {
        const post = this.repository.create(postData);
        return this.repository.save(post);
    }

    async update(id: number, postData: Partial<Post>): Promise<Post | null> {
        await this.repository.update(id, postData);
        return this.findById(id);
    }

    async save(post: Post): Promise<Post> {
        return this.repository.save(post);
    }

    async remove(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}
