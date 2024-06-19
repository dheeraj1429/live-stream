import { IsNotEmpty, IsString } from 'class-validator';

export class VideoStreamIdDto {
  @IsString()
  @IsNotEmpty()
  liveStreamVideoId: string;
}

export class VideoTranscodeDto extends VideoStreamIdDto {
  @IsNotEmpty()
  chunk: any;
}

export class VideoTranscodeServiceDto {
  streamData: VideoTranscodeDto;
}

export class StopVideoTranscodeDto extends VideoStreamIdDto {}

export class StopVideoTranscodeServiceDto extends StopVideoTranscodeDto {}

export class CreateVideoTranscodeProcessDto {
  @IsString()
  @IsNotEmpty()
  liveStreamVideoId: string;

  @IsString()
  @IsNotEmpty()
  resolution: string;

  @IsString()
  @IsNotEmpty()
  bitrate: string;

  @IsString()
  @IsNotEmpty()
  fr: string;
}
