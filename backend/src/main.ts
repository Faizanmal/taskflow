import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix for API
  app.setGlobalPrefix('api');

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('TaskFlow API')
    .setDescription('Collaborative Task Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Tasks', 'Task management endpoints')
    .addTag('Tasks - Bulk Operations', 'Bulk task operations')
    .addTag('Workspaces', 'Workspace management endpoints')
    .addTag('Search', 'Global search endpoints')
    .addTag('Comments', 'Task comments endpoints')
    .addTag('Attachments', 'File attachments endpoints')
    .addTag('Time Tracking', 'Time tracking endpoints')
    .addTag('Templates', 'Task templates endpoints')
    .addTag('Notifications', 'Notification endpoints')
    .addTag('Messaging', 'Direct messaging endpoints')
    .addTag('Analytics', 'Productivity analytics endpoints')
    .addTag('Security', '2FA and GDPR endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Cookie parser for JWT cookies
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
  logger.log(`📡 WebSocket server running on: http://localhost:${port}/events`);
}

void bootstrap();
