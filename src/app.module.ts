import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { PalettesModule } from './modules/palettes/palettes.module';
import { DesignsModule } from './modules/designs/designs.module';
import { TagsModule } from './modules/tags/tags.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { OpenAiModule } from './modules/openai/openai.module';
import { AuthModule } from './modules/auth/auth.module';
import { Profile } from './entities/profile.entity';
import { User } from './entities/user.entity';
import { Palette } from './entities/palette.entity';
import { Tag } from './entities/tag.entity';
import { PaletteTag } from './entities/palette-tag.entity';
import { Design } from './entities/design.entity';
import { WorksDone } from './entities/works-done.entity';
import { Image } from './entities/image.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'decor_ai',
      entities: [Profile, User, Palette, Tag, PaletteTag, Design, WorksDone, Image],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    UsersModule,
    PalettesModule,
    DesignsModule,
    TagsModule,
    PaymentsModule,
    OpenAiModule,
    AuthModule,
  ],
})
export class AppModule {}
