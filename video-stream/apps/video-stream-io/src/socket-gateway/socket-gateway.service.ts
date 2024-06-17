import { EVENTS, KAFKA_SERVICES } from '@app/common';
import { Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import * as fs from 'fs';
import { Server, Socket } from 'socket.io';
import { LiveStreamDto, StopLiveStreamDto } from './dtos';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGatewayService {
  private readonly logger = new Logger(SocketGatewayService.name);
  private streamVideoChunks: { [key: string]: Blob[] } = {};

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

    if (!this.streamVideoChunks[liveStreamVideoId]) {
      this.streamVideoChunks[liveStreamVideoId] = [];
    }

    this.streamVideoChunks[liveStreamVideoId].push(chunk);
    console.log(chunk);
  }

  @SubscribeMessage(EVENTS.STORE_LIVE_STREAM)
  async stopStream(_: Socket, payload: StopLiveStreamDto) {
    const { liveStreamVideoId } = payload;
    const chunks = this.streamVideoChunks[liveStreamVideoId];
    if (!chunks) return;
    const concatenatedBlob = new Blob(this.streamVideoChunks[liveStreamVideoId], {
      type: 'video/webm',
    });
    const buffer = Buffer.from(await concatenatedBlob.arrayBuffer());

    const outputPath = `/app/output/${liveStreamVideoId}.webm`;

    fs.writeFile(outputPath, buffer, (err) => {
      if (err) {
        console.error('Error saving video file:', err);
        return;
      }
      console.log('Video file saved successfully:', outputPath);
    });

    delete this.streamVideoChunks[liveStreamVideoId];
  }
}
