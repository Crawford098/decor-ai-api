import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PalettesService } from './palettes.service';
import { CreatePaletteDto, UpdatePaletteDto } from './dto/palette.dto';

@ApiTags('palettes')
@Controller('palettes')
export class PalettesController {
  constructor(private readonly palettesService: PalettesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all color palettes' })
  @ApiResponse({ status: 200, description: 'Returns all palettes' })
  async findAll() {
    return this.palettesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get palette by ID' })
  @ApiResponse({ status: 200, description: 'Returns a single palette' })
  @ApiResponse({ status: 404, description: 'Palette not found' })
  async findOne(@Param('id') id: string) {
    return this.palettesService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new palette' })
  @ApiResponse({ status: 201, description: 'Palette created successfully' })
  async create(@Body() createPaletteDto: CreatePaletteDto) {
    return this.palettesService.create(createPaletteDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a palette' })
  @ApiResponse({ status: 200, description: 'Palette updated successfully' })
  @ApiResponse({ status: 404, description: 'Palette not found' })
  async update(@Param('id') id: string, @Body() updatePaletteDto: UpdatePaletteDto) {
    return this.palettesService.update(+id, updatePaletteDto);
  }

  @Post('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a palette (soft delete)' })
  @ApiResponse({ status: 204, description: 'Palette deleted successfully' })
  @ApiResponse({ status: 404, description: 'Palette not found' })
  async remove(@Param('id') id: string) {
    return this.palettesService.remove(+id);
  }
}
