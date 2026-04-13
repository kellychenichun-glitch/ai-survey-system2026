import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN')?.split(',') || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AI Survey System API')
    .setDescription('AI 多通路客服與問卷分析系統 API 文件')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', '認證相關')
    .addTag('Surveys', '問卷管理')
    .addTag('Responses', '問卷回覆')
    .addTag('Analytics', '分析功能')
    .addTag('Knowledge', '知識庫')
    .addTag('FAQ', 'FAQ 管理')
    .addTag('Calls', '通話管理')
    .addTag('Chats', '聊天管理')
    .addTag('Tickets', '工單管理')
    .addTag('Settings', '系統設定')
    .addTag('Users', '使用者管理')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 AI Survey System API Server                        ║
║                                                          ║
║   📡 Server running on: http://localhost:${port}         ║
║   📚 API Documentation: http://localhost:${port}/api/docs║
║   🌍 Environment: ${configService.get('NODE_ENV')}      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
