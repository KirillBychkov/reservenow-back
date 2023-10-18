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
  HttpCode,
  HttpStatus,
  Query,
  FileTypeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/role/role.guard';
import { Permissions } from 'src/role/role.decorator';
import { Support } from './entities/support.entity';
import ElementsQueryDto from 'src/user/dto/query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageSchema } from 'src/storage/image.schema';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Permissions('support')
  @ApiOperation({ summary: 'Create a new support record in the system' })
  @ApiOkResponse({ description: 'A support record has been created successfully', type: Support })
  @Post()
  create(@Req() req, @Body() createSupportDto: CreateSupportDto) {
    return this.supportService.create(req.user.user_id, createSupportDto);
  }

  @ApiOperation({ summary: 'Get all support records in the system' })
  @ApiOkResponse({ description: 'All support records have been received', type: [Support] })
  @Get()
  findAll(@Query() queryDto: ElementsQueryDto) {
    return this.supportService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get a support record by its id' })
  @ApiOkResponse({ description: 'The support record has been received', type: Support })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a support record by its id' })
  @ApiOkResponse({ description: 'The support record has been updated successfully', type: Support })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSupportDto: UpdateSupportDto) {
    return this.supportService.update(+id, updateSupportDto);
  }

  @ApiOperation({ summary: 'Delete a support record by its id' })
  @ApiNoContentResponse({ description: 'The support record has been deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supportService.remove(+id);
  }

  @ApiOperation({ summary: 'Create a new image for the support_record' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageSchema)
  @Post('/upload/image/:id')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(jpg|png|jpeg)' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.supportService.uploadImage(+id, file);
  }
}
