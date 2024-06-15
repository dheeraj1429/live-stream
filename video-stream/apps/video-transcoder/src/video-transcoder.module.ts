import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideoTranscodeModule } from './video-transcode/video-transcode.module';
import * as joi from 'joi';

@Module({
  imports: [
    ConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.evn'],
      validationSchema: joi.object({
        KAFKA_BROKER_ID_0: joi.string().required(),
      }),
    }),
    VideoTranscodeModule,
  ],
  controllers: [],
  providers: [],
})
export class VideoTranscoderModule {}
