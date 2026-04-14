import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaletteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'JSON string of colors array' })
  @IsString()
  colors: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  created_by?: string;
}

export class UpdatePaletteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  colors?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  hidden?: number;
}
