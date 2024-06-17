import { DirectoryService } from '@app/common';
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { StopVideoTranscodeServiceDto, VideoTranscodeServiceDto } from './dtos';
import * as path from 'path';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

@Injectable()
export class VideoTranscodeService {
  protected readonly logger = new Logger(VideoTranscodeService.name);
  private streamVideoChunks: { [key: string]: Buffer[] } = {};
  private readonly qualities: { resolution: string; bitrate: string }[] = [
    { resolution: '1280x720', bitrate: '1500k' },
    { resolution: '854x480', bitrate: '800k' },
    { resolution: '640x360', bitrate: '500k' },
  ];

  constructor(protected readonly directoryService: DirectoryService) {}

  async videoTranscode({ streamData }: VideoTranscodeServiceDto) {
    const { liveStreamVideoId, chunk } = streamData;

    if (!this.streamVideoChunks[liveStreamVideoId]) {
      this.streamVideoChunks[liveStreamVideoId] = [];
    }

    const bufferChunk = Buffer.from(chunk.data);
    this.streamVideoChunks[liveStreamVideoId].push(bufferChunk);
    console.log(this.streamVideoChunks[liveStreamVideoId]);
  }

  async stopVideoTranscode({ liveStreamVideoId, outputFilePath }: StopVideoTranscodeServiceDto) {
    const chunks = this.streamVideoChunks[liveStreamVideoId];
    if (!chunks) throw new BadGatewayException('No video streams available');

    const concatenatedBlob = new Blob(this.streamVideoChunks[liveStreamVideoId]);
    console.log({ concatenatedBlob });
    const buffer = Buffer.from(await concatenatedBlob.arrayBuffer());

    console.log({ buffer });

    for (let item of this.qualities) {
      const outputPathWithResolution = path.join(outputFilePath, item.resolution);

      await this.directoryService.createDirectory(outputPathWithResolution);

      const args = [
        '-i',
        'pipe:0',
        '-codec:v',
        'libx264',
        '-codec:a',
        'aac',
        '-vf',
        `scale=${item.resolution}`,
        '-b:v',
        item.bitrate,
        '-bufsize',
        item.bitrate,
        '-maxrate',
        item.bitrate,
        '-hls_time',
        '10',
        '-hls_playlist_type',
        'vod',
        `-hls_segment_filename`,
        path.join(outputPathWithResolution, 'segment%03d.ts'),
        '-start_number',
        '0',
        path.join(outputPathWithResolution, 'index.m3u8'),
      ];

      const ffmpeg = spawn('ffmpeg', args);
      let ffmpegStderr = '';

      ffmpeg.stdout.on('data', (data) => {
        this.logger.log(`stdout: ${data}`);
      });

      ffmpeg.stderr.on('data', (data) => {
        ffmpegStderr += data.toString();
        this.logger.log(`stderr: ${data}`);
      });

      ffmpeg.on('close', (code: number) => {
        if (code === 0) {
          this.logger.log('Video segment ended successfully');
        } else {
          throw new InternalServerErrorException(
            `ffmpeg process exited with code ${code}. Errors: ${ffmpegStderr}`,
          );
        }
      });

      ffmpeg.on('error', (err) => {
        this.logger.error(err);
      });

      ffmpeg.stdin.write(buffer);
      ffmpeg.stdin.end();
    }

    delete this.streamVideoChunks[liveStreamVideoId];
  }
}
