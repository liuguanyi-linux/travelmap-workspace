import { IsOptional, IsString } from 'class-validator';

export class UpdateStrategyDto {
  @IsOptional()
  @IsString()
  content?: string;
}