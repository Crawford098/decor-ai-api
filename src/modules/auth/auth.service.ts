import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import { RegisterDto, TokenResponseDto, UserResponseDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

interface GoogleUserData {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  private readonly accessTokenExpiresIn: number;
  private readonly refreshTokenExpiresIn: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Default: 15 minutes for access token, 7 days for refresh token
    this.accessTokenExpiresIn = parseInt(
      this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '900',
      10,
    );
    this.refreshTokenExpiresIn = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '604800',
      10,
    );
  }

  /**
   * Validate user credentials (username/email + password)
   */
  async validateUser(identifier: string, password: string): Promise<User | null> {
    // Find user by username or email
    const user = await this.userRepository.findOne({
      where: [
        { username: identifier, hidden: 0 },
        { email: identifier, hidden: 0 },
      ],
      relations: ['profile'],
    });

    if (!user) {
      return null;
    }

    // Check if user is blocked
    if (user.blocked) {
      throw new UnauthorizedException('Your account has been blocked');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Generate tokens for authenticated user
   */
  async login(user: User): Promise<TokenResponseDto> {
    const payload: JwtPayload = {
      sub: user.userId,
      username: user.username,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    // Store hashed refresh token in database
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.userId, { token: hashedRefreshToken });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiresIn,
      tokenType: 'Bearer',
      user: this.mapToUserResponse(user),
    };
  }

  /**
   * Register new user with profile
   */
  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    const { firstName, lastName, username, email, password } = registerDto;

    // Check if email is already taken
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email is already registered');
    }

    // Check if username is already taken
    const existingUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Create profile first
    const profile = this.profileRepository.create({
      first_name: firstName,
      last_name: lastName,
      hidden: 0,
    });
    const savedProfile = await this.profileRepository.save(profile);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      profileId: savedProfile.profileId,
      username,
      email,
      password: hashedPassword,
      blocked: 0,
      hidden: 0,
      created_at: new Date(),
    });

    const savedUser = await this.userRepository.save(user);
    savedUser.profile = savedProfile;

    // Generate tokens
    return this.login(savedUser);
  }

  /**
   * Refresh tokens using refresh token
   */
  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<TokenResponseDto> {
    const user = await this.userRepository.findOne({
      where: { userId, hidden: 0 },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify refresh token matches stored hash
    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.token);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new token pair (token rotation for security)
    return this.login(user);
  }

  /**
   * Handle Google OAuth user
   */
  async validateGoogleUser(googleUserData: GoogleUserData): Promise<User> {
    const { googleId, email, firstName, lastName } = googleUserData;

    // Check if user exists with this Google ID
    let user = await this.userRepository.findOne({
      where: { googleId },
      relations: ['profile'],
    });

    if (user) {
      return user;
    }

    // Check if user exists with this email (link accounts)
    user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });

    if (user) {
      // Link Google account to existing user
      user.googleId = googleId;
      return this.userRepository.save(user);
    }

    // Create new user with Google account
    const profile = this.profileRepository.create({
      first_name: firstName || 'Google',
      last_name: lastName || 'User',
      hidden: 0,
    });
    const savedProfile = await this.profileRepository.save(profile);

    // Generate unique username from email
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    let username = baseUsername;
    let counter = 1;

    while (await this.userRepository.findOne({ where: { username } })) {
      username = `${baseUsername}_${counter}`;
      counter++;
    }

    user = this.userRepository.create({
      profileId: savedProfile.profileId,
      googleId,
      email,
      username,
      password: '', // No password for Google users
      blocked: 0,
      hidden: 0,
      created_at: new Date(),
    });

    const savedUser = await this.userRepository.save(user);
    savedUser.profile = savedProfile;

    return savedUser;
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: number): Promise<void> {
    await this.userRepository.update(userId, { token: null });
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { userId, hidden: 0 },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.mapToUserResponse(user);
  }

  /**
   * Generate access token
   */
  private generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  /**
   * Generate refresh token with different secret
   */
  private generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, tokenType: 'refresh' },
      {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'default-refresh-secret-change-in-production',
        expiresIn: this.refreshTokenExpiresIn,
      },
    );
  }

  /**
   * Map User entity to UserResponseDto
   */
  private mapToUserResponse(user: User): UserResponseDto {
    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      firstName: user.profile?.first_name || '',
      lastName: user.profile?.last_name || '',
      profileId: user.profileId,
    };
  }
}