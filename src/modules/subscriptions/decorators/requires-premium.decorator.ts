import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../guards/premium.guard';

/**
 * Shorthand decorator that requires a valid JWT **and** an active premium subscription.
 *
 * @example
 * ```ts
 * @Get('premium-feature')
 * @RequiresPremium()
 * async getPremiumFeature() { ... }
 * ```
 */
export const RequiresPremium = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard, PremiumGuard),
    ApiBearerAuth(),
    ApiResponse({ status: 403, description: 'Active premium subscription required' }),
  );
