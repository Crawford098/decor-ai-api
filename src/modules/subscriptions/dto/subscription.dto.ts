import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { SubscriptionStatus, SubscriptionStore } from '../../../entities/subscription.entity';

export class SubscriptionResponseDto {
  @ApiProperty({ example: false })
  isPremium: boolean;

  @ApiProperty({ example: ['pro'], isArray: true })
  entitlements: string[];

  @ApiPropertyOptional({ example: 'active' })
  status: SubscriptionStatus | null;

  @ApiPropertyOptional({ example: 'decorai_pro_monthly' })
  productId: string | null;

  @ApiPropertyOptional({ example: 'app_store' })
  store: SubscriptionStore | null;

  @ApiPropertyOptional({ example: '2026-06-08T00:00:00.000Z' })
  expiresAt: Date | null;

  @ApiPropertyOptional({ example: true })
  willRenew: boolean;
}

export class RevenueCatWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  api_version: string;

  @ApiProperty()
  event: Record<string, unknown>;
}
