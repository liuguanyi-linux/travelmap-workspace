import { IsOptional, IsString } from 'class-validator';

export class UpdateGuideDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  wechat?: string;

  @IsOptional()
  @IsString()
  kakao?: string;

  @IsOptional()
  @IsString()
  email?: string;
}