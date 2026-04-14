import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Palette } from '../../entities/palette.entity';
import { PalettesController } from './palettes.controller';
import { PalettesService } from './palettes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Palette])],
  controllers: [PalettesController],
  providers: [PalettesService],
  exports: [PalettesService],
})
export class PalettesModule {}
