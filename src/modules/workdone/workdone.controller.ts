import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkdoneService } from './workdone.service';
import { GenerateWorkDoneDto } from './dto/workdone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('workdone')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workdone')
export class WorkdoneController {
  constructor(private readonly workdoneService: WorkdoneService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate an AI-decorated space',
    description:
      'Combines the selected design prompt, color palette, and a custom prompt to generate an AI image via DALL-E 3, uploads the result to S3, and persists the work record in the database.',
  })
  @ApiResponse({
    status: 201,
    description: 'Work done record and image created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error in request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Design or Palette not found' })
  @ApiResponse({ status: 500, description: 'OpenAI, S3, or database error' })
  async generate(@CurrentUser() user: AuthenticatedUser, @Body() dto: GenerateWorkDoneDto) {
    return this.workdoneService.generate(user, dto);
  }
}
