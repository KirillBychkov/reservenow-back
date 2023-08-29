import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import RoleDto from './dto/role.dto';

@ApiTags('Role')
@UseGuards(AuthGuard('jwt'))
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Get all roles in the system' })
  @Get('')
  getAll() {
    return this.roleService.getAll();
  }

  @ApiOperation({ summary: 'Get one role in the system' })
  @ApiParam({
    name: 'id',
    description: 'ID of the role that you want to receive',
  })
  @Get(':id')
  getById(@Param('id') id: number) {
    return this.roleService.getById(id);
  }

  @ApiOperation({ summary: 'Create a new role in the system' })
  @Post('')
  createRole(@Body() body: RoleDto) {
    return this.roleService.createRole(body);
  }

  @ApiOperation({ summary: 'Update role by its id' })
  @ApiParam({
    name: 'id',
    description: 'ID of the role that you want to update',
  })
  @Patch(':id')
  updateById(@Param('id') id: number, @Body() body) {
    return this.roleService.updateRole(id, body);
  }

  @ApiParam({
    name: 'id',
    description: 'ID of the role that you want to delete',
  })
  @ApiOperation({ summary: 'Delete role by its id' })
  @Delete(':id')
  deleteById(@Param('id') id: number) {
    return this.roleService.deleteRoleById(id);
  }
}
