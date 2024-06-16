import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EVENTS, KAFKA_SERVICES, KAFKA_SERVICES_MESSAGES } from '@app/common';
import { BadGatewayException, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

export interface LiveStreamPayloadInterface {
  streamBuffer: ArrayBuffer;
  liveStreamVideoId: string;
}

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
  liveStream(_: Socket, payload: LiveStreamPayloadInterface) {
    const { liveStreamVideoId, streamBuffer } = payload;
    if (!liveStreamVideoId) throw new BadGatewayException('liveStreamVideoId is required');
    this.videoTranscodeService.emit(KAFKA_SERVICES_MESSAGES.VIDEO_TRANSCODE_MESSAGE, {
      streamBuffer,
      liveStreamVideoId,
    });
  }

  @SubscribeMessage(EVENTS.STORE_LIVE_STREAM)
  stopStream(_: Socket) {
    this.videoTranscodeService.emit(KAFKA_SERVICES_MESSAGES.STOP_VIDEO_TRANSCODE_MESSAGE, {});
  }
}
