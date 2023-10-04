import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Permissions } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import { Organization } from './entities/organization.entity';
import { Role } from 'src/role/entities/role.entity';

// TODO: Configure roles
@ApiTags('Organization')
@ApiBearerAuth()
@Permissions('organization')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @ApiOperation({ summary: 'Create a new organization in the system' })
  @Post()
  @ApiCreatedResponse({
    description: 'A new organizations has been created successfully',
    type: Organization,
  })
  create(@Req() req, @Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(req.user.user_id, createOrganizationDto);
  }

  @ApiOperation({ summary: 'Get all organizations in the system' })
  @Get()
  @ApiFoundResponse({ description: 'All organizations have been received', type: [Organization] })
  findAll() {
    return this.organizationService.findAll();
  }

  @ApiOperation({ summary: 'Get an organization by its id' })
  @Get(':id')
  @ApiFoundResponse({ description: 'The organization has been received', type: Organization })
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update an organization by its id' })
  @Patch(':id')
  @ApiOkResponse({ description: 'The organization has been updated successfully', type: Role })
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(+id, updateOrganizationDto);
  }

  @ApiOperation({ summary: 'Delete an organization by its id' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The organization has been deleted successfully' })
  remove(@Param('id') id: string) {
    return this.organizationService.remove(+id);
  }
}
