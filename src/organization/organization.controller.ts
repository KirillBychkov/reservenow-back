import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  FileTypeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  MaxFileSizeValidator,
  Query,
  Put,
} from '@nestjs/common';
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
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Organization } from './entities/organization.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { WorkingHoursValidationPipe } from 'src/pipes/workingHoursValidationPipe';
import { imageSchema } from 'src/storage/image.schema';
import { AbilitiesGuard } from 'src/role/abilities.guard';
import { checkAbilites } from 'src/role/abilities.decorator';
import { RentalObject } from 'src/rental_object/entities/rental_object.entity';
import GetStatisticQueryDto from './dto/get-statistics-query.dto';

@ApiTags('Organization')
@ApiBearerAuth()
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @checkAbilites({ action: 'create', subject: 'organization' })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Create a new organization in the system' })
  @Post()
  @ApiCreatedResponse({
    description: 'A new organizations has been created successfully',
    type: Organization,
  })
  create(
    @Req() req,
    @Body(new WorkingHoursValidationPipe()) createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationService.create(req.user.user_id, createOrganizationDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: `Get user's(ALL for superuser) organizations in the system` })
  @Get()
  @ApiFoundResponse({ description: 'All organizations have been received', type: [Organization] })
  findAll(@Req() req) {
    return this.organizationService.findAll(+req.user.user_id);
  }

  @checkAbilites({ action: 'read', subject: 'organization', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Get an organization by its id' })
  @Get(':id')
  @ApiFoundResponse({ description: 'The organization has been received', type: Organization })
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(+id);
  }

  @checkAbilites({ action: 'read', subject: 'organization', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Get rental object of an organization' })
  @Get(':id/rental_objects/')
  @ApiFoundResponse({ description: 'The organization has been received', type: [RentalObject] })
  findRentalObjects(@Param('id') id: string) {
    return this.organizationService.findRentalObjects(+id);
  }

  @checkAbilites({ action: 'update', subject: 'organization', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Update an organization by its id' })
  @Patch(':id')
  @ApiOkResponse({
    description: 'The organization has been updated successfully',
    type: Organization,
  })
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(+id, updateOrganizationDto);
  }

  @checkAbilites({ action: 'delete', subject: 'organization', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Delete an organization by its id' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The organization has been deleted successfully' })
  remove(@Param('id') id: string) {
    return this.organizationService.remove(+id);
  }

  @checkAbilites({ action: 'update', subject: 'organization', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Create a new image for the organization' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageSchema)
  @Put(':id/upload/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20_000_000 }),
          new FileTypeValidator({ fileType: '.(jpg|png|jpeg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.organizationService.uploadImage(+id, file);
  }

  @checkAbilites({ action: 'update', subject: 'organization', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Delete image for the organization' })
  @Put('/:id/delete/image')
  deleteImage(@Param('id') id: string) {
    return this.organizationService.deleteImage(+id);
  }

  @checkAbilites({ action: 'read', subject: 'organization', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Get statistics of the organization' })
  @Get('/:id/statistics')
  getStatistics(@Param('id') id: string, @Query() query: GetStatisticQueryDto) {
    return this.organizationService.getStatistics(+id, query);
  }
}
