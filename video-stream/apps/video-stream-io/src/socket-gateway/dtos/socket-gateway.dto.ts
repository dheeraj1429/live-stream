import { IsNotEmpty, IsString } from 'class-validator';

export class LiveStreamDto {
  chunk: Blob;

  @IsString()
  @IsNotEmpty()
  liveStreamVideoId: string;
}

export class StopLiveStreamDto {
  @IsString()
  @IsNotEmpty()
  liveStreamVideoId: string;
}
