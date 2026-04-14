import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from '../../entities/design.entity';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';

@Injectable()
export class DesignsService {
  constructor(
    @InjectRepository(Design)
    private designsRepository: Repository<Design>,
  ) {}

  async findAll(): Promise<Design[]> {
    return this.designsRepository.find({
      where: { hidden: 0 },
      relations: ['user'],
      order: { designId: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Design> {
    const design = await this.designsRepository.findOne({
      where: { designId: id, hidden: 0 },
      relations: ['user'],
    });
    if (!design) {
      throw new NotFoundException(`Design with ID ${id} not found`);
    }
    return design;
  }

  async create(createDesignDto: CreateDesignDto): Promise<Design> {
    const design = this.designsRepository.create(createDesignDto);
    return this.designsRepository.save(design);
  }

  async update(id: number, updateDesignDto: UpdateDesignDto): Promise<Design> {
    const design = await this.findOne(id);
    Object.assign(design, updateDesignDto);
    return this.designsRepository.save(design);
  }

  async remove(id: number): Promise<void> {
    const design = await this.findOne(id);
    design.hidden = 1;
    await this.designsRepository.save(design);
  }
}
