import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDesignDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pronts?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  img?: string;
}

export class UpdateDesignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pronts?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  img?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hidden?: number;
}
