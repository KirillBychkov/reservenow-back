import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
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
import { Equipment } from './entities/equipment.entity';
import { AbilitiesGuard } from 'src/role/abilities.guard';
import { checkAbilites } from 'src/role/abilities.decorator';
import ElementsQueryDto from './dto/query.dto';

@ApiTags('Equipment')
@ApiBearerAuth()
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @checkAbilites({ action: 'create', subject: 'equipment' })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Create new equipment in the system' })
  @Post()
  @ApiCreatedResponse({
    description: 'A new organizations has been created successfully',
    type: Equipment,
  })
  create(@Req() req, @Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(req.user.user_id, createEquipmentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all equipment in the system' })
  @Get()
  @ApiFoundResponse({ description: 'All equipment have been received', type: [Equipment] })
  findAll(@Req() req, @Query() queryDTO: ElementsQueryDto) {
    return this.equipmentService.findAll(queryDTO, +req.user.user_id);
  }

  @checkAbilites({ action: 'read', subject: 'equipment', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Get equipment by its id' })
  @Get(':id')
  @ApiFoundResponse({ description: 'The equipment has been received', type: Equipment })
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(+id);
  }

  @checkAbilites({ action: 'update', subject: 'equipment', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Update equipment by its id' })
  @Patch(':id')
  @ApiOkResponse({ description: 'The equipment has been updated successfully', type: Equipment })
  update(@Param('id') id: string, @Body() updateEquipmentDto: UpdateEquipmentDto) {
    return this.equipmentService.update(+id, updateEquipmentDto);
  }

  @checkAbilites({ action: 'delete', subject: 'equipment', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Delete equipment by its id' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The equipment has been deleted successfully' })
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(+id);
  }
}
