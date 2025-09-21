import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

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
    origin: '*',
  });
  app.setGlobalPrefix('api');
  Logger.log(`Application is running on: ${process.env.PORT ?? 3000}`);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
