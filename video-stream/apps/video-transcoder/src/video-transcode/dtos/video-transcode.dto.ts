import { IsNotEmpty, IsString } from 'class-validator';

export class VideoTranscodeDto {
  @IsString()
  @IsNotEmpty()
  liveStreamVideoId: string;

  streamBuffer: Buffer;
}
