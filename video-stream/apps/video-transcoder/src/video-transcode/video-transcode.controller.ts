import { KAFKA_SERVICES_MESSAGES, RCPValidationException } from '@app/common';
import { Controller, Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StopVideoTranscodeDto, VideoTranscodeDto } from './dtos';
import { VideoTranscodeService } from './video-transcode.service';

@Controller('video-transcode')
@UsePipes(new ValidationPipe())
@UseFilters(new RCPValidationException())
export class VideoTranscodeController {
  private readonly logger = new Logger(VideoTranscodeController.name);

  constructor(protected readonly videoTranscodeService: VideoTranscodeService) {}

  @MessagePattern(KAFKA_SERVICES_MESSAGES.VIDEO_TRANSCODE_MESSAGE)
  async videoTranscode(@Payload() payload: VideoTranscodeDto) {
    return this.videoTranscodeService.videoTranscode({ streamData: payload });
  }

  @MessagePattern(KAFKA_SERVICES_MESSAGES.STOP_VIDEO_TRANSCODE_MESSAGE)
  async stopVideoTranscode(@Payload() payload: StopVideoTranscodeDto) {
    const outputFilePath = `/home/app/outputs/${payload.liveStreamVideoId}`;
    return this.videoTranscodeService.stopVideoTranscode({ ...payload, outputFilePath });
  }
}
