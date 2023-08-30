import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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

  @ApiOperation({ summary: 'Get all roles in the system' })
  @Get('')
  @ApiFoundResponse({ description: 'All roles have been received', type: [Role] })
  getAll() {
    return this.roleService.getAll();
  }

  @ApiOperation({ summary: 'Get one role in the system' })
  @ApiParam({
    name: 'id',
    description: 'ID of the role that you want to receive',
  })
  @Get(':id')
  @ApiFoundResponse({ description: 'The role has been received', type: Role })
  getById(@Param('id') id: number) {
    return this.roleService.getById(id);
  }

  @ApiOperation({ summary: 'Create a new role in the system' })
  @Post('')
  @ApiCreatedResponse({ description: 'A role has been created successfully', type: Role })
  createRole(@Body() body: RoleDto) {
    return this.roleService.createRole(body);
  }

  @ApiOperation({ summary: 'Update role by its id' })
  @ApiParam({
    name: 'id',
    description: 'ID of the role that you want to update',
  })
  @Patch(':id')
  @ApiOkResponse({ description: 'The role has been updated successfully', type: Role })
  updateById(@Param('id') id: number, @Body() body: RoleDto) {
    return this.roleService.updateRole(id, body);
  }

  @ApiParam({
    name: 'id',
    description: 'ID of the role that you want to delete',
  })
  @ApiOperation({ summary: 'Delete role by its id' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The role has been deleted successfully' })
  deleteById(@Param('id') id: number) {
    return this.roleService.deleteRoleById(id);
  }
}
