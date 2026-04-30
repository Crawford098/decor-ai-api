import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { WorksDone } from '../../entities/works-done.entity';
import { Image } from '../../entities/image.entity';
import { Design } from '../../entities/design.entity';
import { Palette } from '../../entities/palette.entity';
import { OpenAiService } from '../openai/openai.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { S3Service } from '../s3/s3.service';
import { GenerateWorkDoneDto } from './dto/workdone.dto';

export interface GenerateWorkDoneResult {
  workDone: WorksDone;
  image: Omit<Image, 'path'> & { path: string };
}

@Injectable()
export class WorkdoneService {
  constructor(
    @InjectRepository(Design)
    private designsRepository: Repository<Design>,
    @InjectRepository(Palette)
    private palettesRepository: Repository<Palette>,
    private openAiService: OpenAiService,
    private s3Service: S3Service,
    private dataSource: DataSource,
  ) {}

  async generate(user: AuthenticatedUser, dto: GenerateWorkDoneDto): Promise<GenerateWorkDoneResult> {
    const { designId, paletteId, customPrompt } = dto;

    // 1. Load design and palette — fail fast before calling external APIs
    const design = await this.designsRepository.findOne({
      where: { designId, hidden: 0 },
    });
    if (!design) {
      throw new NotFoundException(`Design with ID ${designId} not found`);
    }

    const palette = await this.palettesRepository.findOne({
      where: { paletteId, hidden: 0 },
    });
    if (!palette) {
      throw new NotFoundException(`Palette with ID ${paletteId} not found`);
    }

    // 2. Build the final prompt
    const basePront = design.pronts?.trim() ?? '';
    const colors = palette.colors?.trim() ?? '';
    const finalPrompt = [
      basePront && `Design description: ${basePront}`,
      colors && `Color palette to apply: ${colors}`,
      `Additional instructions: ${customPrompt}`,
    ]
      .filter(Boolean)
      .join('. ');

    // 3. Generate image via OpenAI (DALL-E 3)
    const imageUrl = await this.openAiService.generateImage(finalPrompt);

    // 4. Download image buffer
    const imageBuffer = await this.openAiService.downloadImageAsBuffer(imageUrl);

    // 5. Build S3 key and upload
    const s3Key = this.s3Service.buildUserWorkdoneKey(user.userId, 'png');
    await this.s3Service.uploadBuffer(imageBuffer, s3Key, 'image/png');

    // 6. Persist both records inside a single transaction
    let savedWorkDone: WorksDone;
    let savedImage: Image;

    try {
      ({ workDone: savedWorkDone, image: savedImage } = await this.dataSource.transaction(
        async (manager) => {
          const workDone = manager.create(WorksDone, {
            userId: user.userId,
            designId,
            paletteId,
            final_pront: finalPrompt,
            hidden: 0,
          });
          const persistedWorkDone = await manager.save(WorksDone, workDone);

          const image = manager.create(Image, {
            worldId: persistedWorkDone.worldId,
            path: s3Key,
            date: new Date(),
            hidden: 0,
          });
          const persistedImage = await manager.save(Image, image);

          return { workDone: persistedWorkDone, image: persistedImage };
        },
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to persist work done record: ${errorMessage}`,
      );
    }

    // 7. Hydrate image path with a presigned read URL before responding
    const presignedUrl = await this.s3Service.getPresignedReadUrl(savedImage.path);

    return {
      workDone: savedWorkDone,
      image: { ...savedImage, path: presignedUrl },
    };
  }
}
