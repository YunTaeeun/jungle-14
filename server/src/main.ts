import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './logging.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 활성화 (프론트엔드 연결용)
  app.enableCors({
    origin: 'http://localhost:3001', // 프론트엔드 주소
    credentials: true,
  });

  // 쿠키 파서
  app.use(cookieParser());

  // DTO 검증 활성화
  app.useGlobalPipes(new ValidationPipe());

  // HTTP 요청/응답 로깅
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
