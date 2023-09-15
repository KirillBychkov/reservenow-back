import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiFoundResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import { Equipment } from './entities/equipment.entity';
import { Role } from 'src/role/entities/role.entity';

@ApiTags('Equipment')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Roles('superuser')
@UseGuards(RolesGuard)
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @ApiOperation({ summary: 'Create new equipment in the system' })
  @Post()
  @ApiCreatedResponse({
    description: 'A new organizations has been created successfully',
    type: Equipment,
  })
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto);
  }

  @ApiOperation({ summary: 'Get all equipment in the system' })
  @Get()
  @ApiFoundResponse({ description: 'All equipment have been received', type: [Equipment] })
  findAll() {
    return this.equipmentService.findAll();
  }

  @ApiOperation({ summary: 'Get equipment by its id' })
  @Get(':id')
  @ApiFoundResponse({ description: 'The equipment has been received', type: Equipment })
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update equipment by its id' })
  @Patch(':id')
  @ApiOkResponse({ description: 'The equipment has been updated successfully', type: Role })
  update(@Param('id') id: string, @Body() updateEquipmentDto: UpdateEquipmentDto) {
    return this.equipmentService.update(+id, updateEquipmentDto);
  }

  @ApiOperation({ summary: 'Delete equipment by its id' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The equipment has been deleted successfully' })
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(+id);
  }
}