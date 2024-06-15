import { Module } from '@nestjs/common';
import { VideoTranscodeService } from './video-transcode.service';
import { VideoTranscodeController } from './video-transcode.controller';

@Module({
  providers: [VideoTranscodeService],
  controllers: [VideoTranscodeController],
})
export class VideoTranscodeModule {}
