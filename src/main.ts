import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('ReserveNow')
    .setDescription('The ReserveNow API description')
    .setVersion('1.0')
    .addServer('')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.useGlobalPipes(new ValidationPipe());
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
