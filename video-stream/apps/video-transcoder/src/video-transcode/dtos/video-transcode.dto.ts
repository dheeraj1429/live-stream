import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class VideoTranscodeDto {
  @IsString()
  @IsNotEmpty()
  liveStreamVideoId: string;

  streamBuffer: Buffer;
}

export class VideoTranscodeServiceDto {
  @Type(() => VideoTranscodeDto)
  streamData: VideoTranscodeDto;

  @IsString()
  @IsNotEmpty()
  outDir: string;
}
