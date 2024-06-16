import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideoTranscodeModule } from './video-transcode/video-transcode.module';
import * as joi from 'joi';

@Module({
  imports: [
    ConfigModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: joi.object({
        BROKER_0_URI: joi.string().required(),
      }),
    }),
    VideoTranscodeModule,
  ],
  controllers: [],
  providers: [],
})
export class VideoTranscoderModule {}
