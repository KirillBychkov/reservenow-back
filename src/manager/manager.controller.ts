import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import { Manager } from './entities/manager.entity';

@ApiTags('Manager')
@ApiBearerAuth()
@Permissions('manager')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @ApiOperation({ summary: 'Create a new manager in the system' })
  @ApiCreatedResponse({ description: 'A manager has been created successfully', type: Manager })
  @Post()
  create(@Request() req, @Body() createManagerDto: CreateManagerDto) {
    return this.managerService.create(req.usre.id, createManagerDto);
  }

  @ApiOperation({ summary: 'Get all managers in the system' })
  @ApiOkResponse({ description: 'All managers have been received', type: [Manager] })
  @Get()
  findAll() {
    return this.managerService.findAll();
  }

  @ApiOperation({ summary: 'Get a manager by its id' })
  @ApiOkResponse({ description: 'The manager has been received', type: Manager })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.managerService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a manager by its id' })
  @ApiOkResponse({ description: 'The manager has been updated successfully', type: Manager })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateManagerDto: UpdateManagerDto) {
    return this.managerService.update(+id, updateManagerDto);
  }

  @ApiOperation({ summary: 'Delete a manager by its id' })
  @ApiNoContentResponse({ description: 'The manager has been deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.managerService.remove(+id);
  }
}
