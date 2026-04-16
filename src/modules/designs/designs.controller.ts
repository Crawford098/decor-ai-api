import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DesignsService } from './designs.service';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('designs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all designs' })
  @ApiResponse({ status: 200, description: 'Returns all designs' })
  async findAll() {
    return this.designsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get design by ID' })
  @ApiResponse({ status: 200, description: 'Returns a single design' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async findOne(@Param('id') id: string) {
    return this.designsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new design' })
  @ApiResponse({ status: 201, description: 'Design created successfully' })
  async create(@Body() createDesignDto: CreateDesignDto) {
    return this.designsService.create(createDesignDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a design' })
  @ApiResponse({ status: 200, description: 'Design updated successfully' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async update(@Param('id') id: string, @Body() updateDesignDto: UpdateDesignDto) {
    return this.designsService.update(+id, updateDesignDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a design (soft delete)' })
  @ApiResponse({ status: 204, description: 'Design deleted successfully' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async remove(@Param('id') id: string) {
    return this.designsService.remove(+id);
  }
}
