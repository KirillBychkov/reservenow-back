import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Support } from './entities/support.entity';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @ApiOperation({ summary: 'Create a new support record in the system' })
  @Post()
  @ApiCreatedResponse({
    description: 'A support record has been created successfully',
    type: Support,
  })
  create(@Req() req, @Body() createSupportDto: CreateSupportDto) {
    return this.supportService.create(req.user.user_id, createSupportDto);
  }

  @Roles('superuser')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all support records in the system' })
  @Get()
  @ApiFoundResponse({ description: 'All support records have been received', type: [Support] })
  findAll() {
    return this.supportService.findAll();
  }

  @Roles('superuser')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get a support record by its id' })
  @Get(':id')
  @ApiFoundResponse({ description: 'The support record has been received', type: Support })
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(+id);
  }

  @Roles('superuser')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a support record by its id' })
  @Patch(':id')
  @ApiOkResponse({ description: 'The support record has been updated successfully', type: Support })
  update(@Param('id') id: string, @Body() updateSupportDto: UpdateSupportDto) {
    return this.supportService.update(+id, updateSupportDto);
  }

  @Roles('superuser')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a support record by its id' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The support record has been deleted successfully' })
  remove(@Param('id') id: string) {
    return this.supportService.remove(+id);
  }
}
