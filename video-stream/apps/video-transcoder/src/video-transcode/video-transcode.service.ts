import { DirectoryService } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { VideoTranscodeServiceDto } from './dtos';

@Injectable()
export class VideoTranscodeService {
  protected readonly logger = new Logger(VideoTranscodeService.name);
  private ffmpeg: ChildProcessWithoutNullStreams | null = null;

  constructor(protected readonly directoryService: DirectoryService) {}

  async videoTranscode({ streamData, outDir }: VideoTranscodeServiceDto) {
    await this.directoryService.createDirectory(outDir);

    const bufferData = Buffer.from(JSON.stringify(streamData.streamBuffer));

    this.ffmpeg = spawn('ffmpeg', [
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgb24',
      '-s',
      '640x480',
      '-r',
      '30',
      '-i',
      'pipe:0',
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-tune',
      'zerolatency',
      '-x264opts',
      'keyint=30:min-keyint=30',
      '-b:v',
      '2000k',
      '-g',
      '60',
      '-hls_time',
      '2',
      '-hls_list_size',
      '6',
      `${outDir}/output.m3u8`,
    ]);

    // Handle FFmpeg output
    this.ffmpeg.stdout.on('data', (data) => {
      console.log(`FFmpeg stdout: ${data}`);
    });

    this.ffmpeg.stderr.on('data', (data) => {
      console.error(`FFmpeg stderr: ${data}`);
    });

    this.ffmpeg.on('close', (code) => {
      console.log(`FFmpeg process exited with code ${code}`);
    });

    // Handle potential error when writing to FFmpeg stdin
    this.ffmpeg.stdin.on('error', (err) => {
      console.error(`Error writing to FFmpeg stdin: ${err}`);
    });

    this.ffmpeg.stdin.write(bufferData);
  }

  async stopVideoTranscode() {
    this.ffmpeg.stdin.end();
    this.logger.log(`FFmpeg stopped video stream transcoding`);
  }
}
