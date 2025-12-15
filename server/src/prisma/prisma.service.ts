import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;

    constructor() {
        const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jungle_board';

        // 환경별 연결 풀 설정 (Prisma 7 베스트 프랙티스)
        const poolConfig = {
            connectionString,
            // 프로덕션 환경
            ...(process.env.NODE_ENV === 'production' && {
                max: 20,  // 최대 연결 수
                min: 5,   // 최소 연결 수
                idleTimeoutMillis: 30000,  // 유휴 연결 타임아웃
                connectionTimeoutMillis: 2000,  // 연결 타임아웃
            }),
            // 개발 환경
            ...(process.env.NODE_ENV === 'development' && {
                max: 10,
                min: 2,
            }),
        };

        const pool = new Pool(poolConfig);

        // Pool 에러 핸들링
        pool.on('error', (err) => {
            console.error('❌ Unexpected Pool Error:', err);
            process.exit(-1);
        });

        const adapter = new PrismaPg(pool);
        super({ adapter });

        // super() 호출 후에 this 사용 가능
        this.pool = pool;
    }

    async onModuleInit() {
        await this.$connect();
        console.log('✅ Prisma Client connected');

        // 연결 풀 상태 로깅 (개발 환경)
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 Pool: Total=${this.pool.totalCount}, Idle=${this.pool.idleCount}`);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();  // Pool 종료 처리
        console.log('👋 Prisma Client & Pool disconnected');
    }
}
