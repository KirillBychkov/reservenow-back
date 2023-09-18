import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Content-Type',
      'accept',
    ],
    origin: '*',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('ReserveNow')
    .setDescription('The ReserveNow API description')
    .setVersion('1.0')
    .addServer('http://localhost:3000')
    .addServer('http://51.15.35.161')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.useGlobalPipes(new ValidationPipe());
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
