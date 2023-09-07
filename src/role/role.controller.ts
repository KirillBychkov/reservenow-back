import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleService } from './role.service';
import RoleDto from './dto/role.dto';
import { Role } from './entities/role.entity';
import { RolesGuard } from './role.guard';
import { Roles } from './role.decorator';

@ApiTags('Role')
@ApiBearerAuth()
@Roles('superuser')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Create a new role in the system' })
  @Post()
  @ApiCreatedResponse({ description: 'A role has been created successfully', type: Role })
  create(@Body() body: RoleDto) {
    return this.roleService.create(body);
  }

  @ApiOperation({ summary: 'Get all roles in the system' })
  @Get()
  @ApiFoundResponse({ description: 'All roles have been received', type: [Role] })
  getAll() {
    return this.roleService.findAll();
  }

  @ApiOperation({ summary: 'Get a role by its id' })
  @Get(':id')
  @ApiFoundResponse({ description: 'The role has been received', type: Role })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a role by its id' })
  @Patch(':id')
  @ApiOkResponse({ description: 'The role has been updated successfully', type: Role })
  update(@Param('id') id: string, @Body() body: RoleDto) {
    return this.roleService.update(+id, body);
  }

  @ApiOperation({ summary: 'Delete a role by its id' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The role has been deleted successfully' })
  delete(@Param('id') id: string) {
    return this.roleService.delete(+id);
  }
}
