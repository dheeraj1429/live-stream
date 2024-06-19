import { DirectoryService } from '@app/common';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as path from 'path';
import { StopVideoTranscodeServiceDto, VideoTranscodeServiceDto } from './dtos';

@Injectable()
export class VideoTranscodeService {
  protected readonly logger = new Logger(VideoTranscodeService.name);
  private ffmpegProcesses: { [key: string]: ChildProcessWithoutNullStreams | {} } = {};
  private readonly qualities: { resolution: string; bitrate: string; fr: string }[] = [
    { resolution: '1280x720', bitrate: '2500k', fr: '60' },
    { resolution: '720x480', bitrate: '1500k', fr: '30' },
  ];

  constructor(protected readonly directoryService: DirectoryService) {}

  async videoTranscode({ streamData }: VideoTranscodeServiceDto) {
    const { liveStreamVideoId, chunk } = streamData;

    if (!this.ffmpegProcesses[liveStreamVideoId]) {
      this.ffmpegProcesses[liveStreamVideoId] = {};

      for (let item of this.qualities) {
        const outputPathWithResolution = path.join(
          '/home/app/outputs',
          liveStreamVideoId,
          item.resolution,
        );

        await this.directoryService.createDirectory(outputPathWithResolution);

        const args = [
          '-fflags',
          '+genpts',
          '-use_wallclock_as_timestamps',
          '1',
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
          '-r',
          item.fr,
          '-hls_time',
          '5',
          '-hls_playlist_type',
          'event',
          '-hls_segment_filename',
          path.join(outputPathWithResolution, 'segment%03d.ts'),
          '-vsync',
          'cfr',
          path.join(outputPathWithResolution, 'index.m3u8'),
        ];

        const ffmpegProcess = spawn('ffmpeg', args);
        this.ffmpegProcesses[liveStreamVideoId][item.resolution] = ffmpegProcess;
        let ffmpegStderr = '';

        ffmpegProcess.stdout.on('data', (data) => {
          this.logger.log(`stdout: ${data}`);
        });

        ffmpegProcess.stderr.on('data', (data) => {
          ffmpegStderr += data.toString();
          this.logger.log(`stderr: ${data}`);
        });

        ffmpegProcess.on('close', (code: number) => {
          if (code !== 0) {
            this.logger.error(`FFmpeg process exited with code ${code}. Errors: ${ffmpegStderr}`);
            process.exit(1);
          }
        });

        ffmpegProcess.on('error', (err) => {
          this.logger.error(err);
        });
      }
    }

    const bufferChunk = Buffer.from(chunk.data);
    for (let resolution in this.ffmpegProcesses[liveStreamVideoId]) {
      this.ffmpegProcesses[liveStreamVideoId][resolution].stdin.write(bufferChunk);
    }
  }

  async stopVideoTranscode({ liveStreamVideoId }: StopVideoTranscodeServiceDto) {
    const ffmpegProcesses = this.ffmpegProcesses[liveStreamVideoId];
    if (!ffmpegProcesses) throw new BadGatewayException('No video streams process available');

    for (let resolution in ffmpegProcesses) {
      const ffmpegProcess = ffmpegProcesses[resolution];
      ffmpegProcess.stdin.end();
      ffmpegProcess.on('close', () => {
        this.logger.log(`FFmpeg process for resolution ${resolution} ended successfully`);
      });
    }
    delete this.ffmpegProcesses[liveStreamVideoId];
  }
}
