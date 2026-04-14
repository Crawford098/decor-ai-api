import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Palette } from '../../entities/palette.entity';
import { CreatePaletteDto, UpdatePaletteDto } from './dto/palette.dto';

@Injectable()
export class PalettesService {
  constructor(
    @InjectRepository(Palette)
    private palettesRepository: Repository<Palette>,
  ) {}

  async findAll(): Promise<Palette[]> {
    return this.palettesRepository.find({
      where: { hidden: 0 },
      relations: ['paletteTags', 'paletteTags.tag'],
      order: { paletteId: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Palette> {
    const palette = await this.palettesRepository.findOne({
      where: { paletteId: id, hidden: 0 },
      relations: ['paletteTags', 'paletteTags.tag'],
    });
    if (!palette) {
      throw new NotFoundException(`Palette with ID ${id} not found`);
    }
    return palette;
  }

  async create(createPaletteDto: CreatePaletteDto): Promise<Palette> {
    const palette = this.palettesRepository.create({
      ...createPaletteDto,
      created_by: createPaletteDto.created_by || 'SYSTEM',
      createdDate: new Date(),
    });
    return this.palettesRepository.save(palette);
  }

  async update(id: number, updatePaletteDto: UpdatePaletteDto): Promise<Palette> {
    const palette = await this.findOne(id);
    Object.assign(palette, updatePaletteDto);
    return this.palettesRepository.save(palette);
  }

  async remove(id: number): Promise<void> {
    const palette = await this.findOne(id);
    palette.hidden = 1;
    await this.palettesRepository.save(palette);
  }
}
