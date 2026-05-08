import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId: number | undefined = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const premium = await this.subscriptionsService.isPremium(userId);

    if (!premium) {
      throw new ForbiddenException('This feature requires an active premium subscription');
    }

    return true;
  }
}
