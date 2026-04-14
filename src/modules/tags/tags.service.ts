import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagsRepository.find({
      where: { hidden: 0 },
      order: { tagId: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({
      where: { tagId: id, hidden: 0 },
    });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = this.tagsRepository.create({
      ...createTagDto,
      created_by: createTagDto.created_by || 'SYSTEM',
      createdDate: new Date(),
    });
    return this.tagsRepository.save(tag);
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, updateTagDto);
    return this.tagsRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    const tag = await this.findOne(id);
    tag.hidden = 1;
    await this.tagsRepository.save(tag);
  }
}
