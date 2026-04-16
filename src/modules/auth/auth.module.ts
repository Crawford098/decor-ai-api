import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import {
  LocalStrategy,
  JwtStrategy,
  JwtRefreshStrategy,
} from './strategies';
import {
  JwtAuthGuard,
  LocalAuthGuard,
  JwtRefreshGuard,
  GoogleAuthGuard,
} from './guards';

// Conditionally import GoogleStrategy only when credentials are available
const googleStrategyProvider = {
  provide: 'GOOGLE_STRATEGY',
  useFactory: (configService: ConfigService) => {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (clientID && clientSecret) {
      // Dynamically import and instantiate GoogleStrategy
      const { GoogleStrategy } = require('./strategies/google.strategy');
      return new GoogleStrategy(configService);
    }

    console.log('⚠️  Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET required');
    return null;
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'default-secret-change-in-production',
        signOptions: {
          expiresIn: parseInt(
            configService.get<string>('JWT_ACCESS_EXPIRATION') || '900',
            10,
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    googleStrategyProvider,
    JwtAuthGuard,
    LocalAuthGuard,
    JwtRefreshGuard,
    GoogleAuthGuard,
  ],
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}