import { KAFKA_SERVICES_MESSAGES, RCPValidationException } from '@app/common';
import { Controller, UseFilters, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VideoTranscodeDto } from './dtos';

@Controller('video-transcode')
@UsePipes(new ValidationPipe())
@UseFilters(new RCPValidationException())
export class VideoTranscodeController {
  private readonly logger = new Logger(VideoTranscodeController.name);

  @MessagePattern(KAFKA_SERVICES_MESSAGES.VIDEO_TRANSCODE_MESSAGE)
  async videoTranscode(@Payload() payload: VideoTranscodeDto) {
    this.logger.log(payload.liveStreamVideoId);
  }
}
