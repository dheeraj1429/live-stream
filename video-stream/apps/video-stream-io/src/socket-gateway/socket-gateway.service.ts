import { EVENTS, KAFKA_SERVICES, KAFKA_SERVICES_MESSAGES } from '@app/common';
import { Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LiveStreamDto, StopLiveStreamDto } from './dtos';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGatewayService {
  private readonly logger = new Logger(SocketGatewayService.name);

  constructor(
    @Inject(KAFKA_SERVICES.VIDEO_TRANSCODE_SERVICE)
    protected readonly videoTranscodeService: ClientKafka,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('SOCKET Gateway Service initialized');
  }

  @SubscribeMessage(EVENTS.LIVE_STREAM)
  liveStream(_: Socket, payload: LiveStreamDto) {
    const { liveStreamVideoId, chunk } = payload;

    this.videoTranscodeService.emit(KAFKA_SERVICES_MESSAGES.VIDEO_TRANSCODE_MESSAGE, {
      chunk: chunk,
      liveStreamVideoId,
    });
  }

  @SubscribeMessage(EVENTS.STORE_LIVE_STREAM)
  async stopStream(_: Socket, payload: StopLiveStreamDto) {
    const { liveStreamVideoId } = payload;
    this.videoTranscodeService.emit(KAFKA_SERVICES_MESSAGES.STOP_VIDEO_TRANSCODE_MESSAGE, {
      liveStreamVideoId,
    });
    this.logger.log(`stopStream called with live stream id: ${liveStreamVideoId}`);
  }
}
