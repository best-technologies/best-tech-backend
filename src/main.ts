import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { LoggerService } from './common/logger/logger.service';
import * as colors from 'colors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods:
      process.env.ALLOWED_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ✅ Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties that are not in the DTO
      forbidNonWhitelisted: true, // throws error on unknown properties
      transform: true, // transforms payloads to DTO instances
    }),
  );

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('B-Tech Backend API')
    .setDescription(
      'NestJS backend API for B-Tech authentication, services, contact, and newsletter management',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'Application health check endpoints')
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User dashboard and profile endpoints')
    .addTag(
      'Services',
      'Service, category, and subcategory management endpoints',
    )
    .addTag('Contact Us', 'Contact us form endpoints')
    .addTag('Newsletter - Public', 'Public newsletter subscription endpoints')
    .addTag('Newsletter - Admin', 'Admin newsletter subscription management')
    .addTag(
      'Newsletter Templates - Admin',
      'Admin newsletter template management',
    )
    .addTag('Admin - Departments', 'Admin department management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 1000;
  await app.listen(port, '0.0.0.0');

  logger.log(
    colors.cyan('🚀 Server running on:') +
      colors.magenta(` http://localhost:${port}/api/v1`),
  );
  logger.log(
    colors.cyan('📚 API Documentation:') +
      colors.magenta(` http://localhost:${port}/api/docs`),
  );
}

bootstrap();
