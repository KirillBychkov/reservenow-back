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
  ApiQuery,
} from '@nestjs/swagger';
import { Permissions } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import { Organization } from './entities/organization.entity';
import { Role } from 'src/role/entities/role.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { WorkingHoursValidationPipe } from 'src/pipes/workingHoursValidationPipe';
import { imageSchema } from 'src/storage/image.schema';

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
  create(
    @Req() req,
    @Body(new WorkingHoursValidationPipe()) createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationService.create(req.user.user_id, createOrganizationDto);
  }

  @ApiOperation({ summary: 'Get all organizations in the system' })
  @Get()
  @ApiFoundResponse({ description: 'All organizations have been received', type: [Organization] })
  findAll() {
    return this.organizationService.findAll();
  }

  @ApiOperation({ summary: "Get all users's organizations in the system" })
  @Get(':userId')
  @ApiFoundResponse({ description: 'All organizations have been received', type: [Organization] })
  findAllByUser(@Param('userId') userId: string) {
    return this.organizationService.findAllByUser(+userId);
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

  @ApiOperation({ summary: 'Create a new image for the organization' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageSchema)
  @Put('/upload/image/:id')
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

  @ApiOperation({ summary: 'Get statistics of the organization' })
  @ApiQuery({ name: 'start_date', required: false, type: String })
  @ApiQuery({ name: 'end_date', required: false, type: String })
  @Get('/statistics/:id')
  getStatistics(
    @Param('id') id: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    return this.organizationService.getStatistics(+id, start_date, end_date);
  }
}
