import { NestFactory } from '@nestjs/core';
import { VideoTranscoderModule } from './video-transcoder.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { KAFKA_SERVICES } from '@app/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(VideoTranscoderModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [configService.get('BROKER_0_URI')],
      },
      consumer: {
        groupId: KAFKA_SERVICES.VIDEO_TRANSCODE_SERVICE_GROUP_ID,
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.startAllMicroservices();
}

bootstrap();
