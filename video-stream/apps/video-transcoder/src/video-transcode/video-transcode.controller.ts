import { KAFKA_SERVICES_MESSAGES } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

export interface VideoTranscodePayloadInterface {
  liveStreamVideoId: string;
  streamBuffer: Buffer;
}

@Controller('video-transcode')
export class VideoTranscodeController {
  @MessagePattern(KAFKA_SERVICES_MESSAGES.VIDEO_TRANSCODE_MESSAGE)
  async videoTranscode(@Payload() payload: VideoTranscodePayloadInterface) {
    console.log(payload.streamBuffer);
  }
}
