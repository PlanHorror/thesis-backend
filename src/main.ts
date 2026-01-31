import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useLogger(new Logger());
  app.enableCors({
    origin: ['http://localhost:3000', process.env.FRONTEND_URL],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Thesis Backend API')
    .setDescription('API documentation for the Thesis Backend application')
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
      'accessToken',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Admin', 'Admin management endpoints')
    .addTag('Admin - Students', 'Admin student management endpoints')
    .addTag('Admin - Lecturers', 'Admin lecturer management endpoints')
    .addTag('Admin - Departments', 'Admin department management endpoints')
    .addTag('Admin - Courses', 'Admin course management endpoints')
    .addTag('Admin - Semesters', 'Admin semester management endpoints')
    .addTag('Admin - Enrollments', 'Admin enrollment management endpoints')
    .addTag(
      'Admin - Enrollment Sessions',
      'Admin enrollment session management endpoints',
    )
    .addTag(
      'Admin - Exam Schedules',
      'Admin exam schedule management endpoints',
    )
    .addTag('Admin - Notifications', 'Admin notification management endpoints')
    .addTag('Admin - Posts', 'Admin post management endpoints')
    .addTag('Admin - Webhooks', 'Admin webhook management endpoints')
    .addTag('Students', 'Student endpoints')
    .addTag('Lecturers', 'Lecturer endpoints')
    .addTag('Courses', 'Course endpoints')
    .addTag('Course Documents', 'Course document endpoints')
    .addTag('Enrollments', 'Enrollment endpoints')
    .addTag('Departments', 'Department endpoints')
    .addTag('Semesters', 'Semester endpoints')
    .addTag('Course Semesters', 'Course on semester endpoints')
    .addTag('Exam Schedules', 'Exam schedule endpoints')
    .addTag('Notifications', 'Notification endpoints')
    .addTag('Posts', 'Post endpoints')
    .addTag('Webhooks', 'Webhook endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  Logger.log(`Application is running on: ${process.env.PORT ?? 3000}`);
  Logger.log(
    `Swagger documentation available at: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
