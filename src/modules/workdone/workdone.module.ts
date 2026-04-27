import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorksDone } from '../../entities/works-done.entity';
import { Image } from '../../entities/image.entity';
import { Design } from '../../entities/design.entity';
import { Palette } from '../../entities/palette.entity';
import { AuthModule } from '../auth/auth.module';
import { OpenAiModule } from '../openai/openai.module';
import { S3Module } from '../s3/s3.module';
import { WorkdoneService } from './workdone.service';
import { WorkdoneController } from './workdone.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorksDone, Image, Design, Palette]),
    AuthModule,
    OpenAiModule,
    S3Module,
  ],
  controllers: [WorkdoneController],
  providers: [WorkdoneService],
})
export class WorkdoneModule {}
