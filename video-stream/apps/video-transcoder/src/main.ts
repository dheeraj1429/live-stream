import { NestFactory } from '@nestjs/core';
import { VideoTranscoderModule } from './video-transcoder.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { KAFKA_SERVICES } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(VideoTranscoderModule);
  const configService = app.get(ConfigService);
  const microserviceApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    VideoTranscoderModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: configService.get('KAFKA_BROKER_ID_0'),
        },
        consumer: {
          groupId: KAFKA_SERVICES.VIDEO_TRANSCODE_SERVICE_GROUP_ID,
        },
      },
    },
  );
  microserviceApp.listen();
}
bootstrap();
