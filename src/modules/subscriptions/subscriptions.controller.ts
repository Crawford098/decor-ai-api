import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { RevenueCatWebhookDto, SubscriptionResponseDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RevenueCatWebhookPayload } from './interfaces/revenuecat-webhook.interface';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user subscription status' })
  @ApiResponse({ status: 200, description: 'Subscription status', type: SubscriptionResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMySubscription(
    @CurrentUser('userId') userId: number,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.getSubscriptionByUserId(userId);
  }

  @Public()
  @Post('webhook/revenuecat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'RevenueCat webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 401, description: 'Invalid webhook token' })
  async handleRevenueCatWebhook(
    @Body() body: RevenueCatWebhookDto,
    @Headers('authorization') authHeader: string,
  ): Promise<{ received: boolean }> {
    this.subscriptionsService.validateWebhookToken(authHeader);
    await this.subscriptionsService.processWebhook(body as unknown as RevenueCatWebhookPayload);
    return { received: true };
  }
}
