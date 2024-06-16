import { DirectoryService } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as path from 'path';
import { VideoTranscodeServiceDto } from './dtos';

@Injectable()
export class VideoTranscodeService {
  protected readonly logger = new Logger(VideoTranscodeService.name);
  private readonly qualities: { resolution: string; bitrate: string }[] = [
    { resolution: '1280x720', bitrate: '1500k' },
  ];
  private ffmpeg: ChildProcessWithoutNullStreams | null = null;

  constructor(protected readonly directoryService: DirectoryService) {}

  async videoTranscode({ streamData, outDir }: VideoTranscodeServiceDto) {
    const buffer = Buffer.from(streamData.streamBuffer);

    for (let item of this.qualities) {
      const outputPath = path.join(outDir, item.resolution);

      const args = [
        '-i',
        'pipe:0', // Input from pipe
        '-codec:v',
        'libx264', // Video codec
        '-codec:a',
        'aac', // Audio codec
        '-vf',
        `scale=${item.resolution}`, // Video scaling
        '-b:v',
        item.bitrate, // Video bitrate
        '-bufsize',
        item.bitrate, // Buffer size
        '-maxrate',
        item.bitrate, // Maximum bitrate
        '-hls_time',
        '10', // HLS segment duration
        '-hls_playlist_type',
        'vod', // HLS playlist type
        '-hls_segment_filename',
        path.join(outputPath, 'segment%03d.ts'), // Output segment filename
        '-start_number',
        '0', // Start segment number
        '-f',
        'mpegts', // Output format (MPEG transport stream)
        '-', // Output to stdout
      ];

      this.ffmpeg = spawn('ffmpeg', args);

      this.ffmpeg.stdout.on('data', (data) => {
        console.log(`FFmpeg stdout: ${data}`);
      });

      this.ffmpeg.stderr.on('data', (data) => {
        console.error(`FFmpeg stderr: ${data}`);
      });

      this.ffmpeg.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
      });

      this.ffmpeg.on('error', (err) => {
        console.error(`FFmpeg error: ${err}`);
      });

      this.ffmpeg.stdin.write(buffer);
    }
  }

  async stopVideoTranscode() {
    this.ffmpeg.stdin.end();
    this.logger.log(`FFmpeg stopped video stream transcoding`);
  }
}
