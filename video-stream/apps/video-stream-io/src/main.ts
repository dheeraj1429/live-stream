import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  console.log(`bootstrap server listing on ${configService.get('PORT')}`);
  await app.listen(configService.get('PORT'));
}
bootstrap();
