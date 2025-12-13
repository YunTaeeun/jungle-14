import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Post } from '../../posts/entities/post.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string; // bcrypt 해시로 저장

    @Column({ nullable: true, unique: true })
    nickname: string; // 표시 이름 (선택, 유니크)

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Post, (post) => post.author)
    posts: Post[];
}
