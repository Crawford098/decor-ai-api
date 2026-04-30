import { IsNumber, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateWorkDoneDto {
  @ApiProperty({ description: 'ID of the design whose prompt will be used', example: 1 })
  @IsNumber()
  designId: number;

  @ApiProperty({ description: 'ID of the color palette to apply', example: 1 })
  @IsNumber()
  paletteId: number;

  @ApiProperty({
    description: 'Custom prompt to further describe the desired result',
    example: 'Modern Scandinavian style with large windows and natural light',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  customPrompt: string;
}
