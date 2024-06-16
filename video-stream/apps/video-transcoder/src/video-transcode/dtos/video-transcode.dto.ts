import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class VideoTranscodeDto {
  @IsString()
  @IsNotEmpty()
  liveStreamVideoId: string;

  streamBuffer: ArrayBuffer;
}

export class VideoTranscodeServiceDto {
  // @Type(() => VideoTranscodeDto)
  streamData: any;

  @IsString()
  @IsNotEmpty()
  outDir: string;
}
