import { Module } from '@nestjs/common';
import { VideoTranscodeService } from './video-transcode.service';
import { VideoTranscodeController } from './video-transcode.controller';
import { DirectoryModule, DirectoryService } from '@app/common';

@Module({
  imports: [DirectoryModule],
  providers: [VideoTranscodeService, DirectoryService],
  controllers: [VideoTranscodeController],
})
export class VideoTranscodeModule {}
