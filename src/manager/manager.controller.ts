import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiBody,
  ApiConsumes,
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
  FileTypeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  MaxFileSizeValidator,
  Put,
  Req,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { AuthGuard } from '@nestjs/passport';
import { Manager } from './entities/manager.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageSchema } from 'src/storage/image.schema';
import { AbilitiesGuard } from 'src/role/abilities.guard';
import { checkAbilites } from 'src/role/abilities.decorator';

@ApiTags('Manager')
@ApiBearerAuth()
@Controller('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @checkAbilites({ action: 'create', subject: 'manager' })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Create a new manager in the system' })
  @ApiCreatedResponse({ description: 'A manager has been created successfully', type: Manager })
  @Post()
  create(@Request() req, @Body() createManagerDto: CreateManagerDto) {
    return this.managerService.create(+req.user.user_id, createManagerDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all managers in the system' })
  @ApiOkResponse({ description: 'All managers have been received', type: [Manager] })
  @Get()
  findAll(@Req() req) {
    return this.managerService.findAll(+req.user.user_id);
  }

  @checkAbilites({ action: 'read', subject: 'manager', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Get a manager by its id' })
  @ApiOkResponse({ description: 'The manager has been received', type: Manager })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.managerService.findOne(+id);
  }

  @checkAbilites({ action: 'update', subject: 'manager', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Update a manager by its id' })
  @ApiOkResponse({ description: 'The manager has been updated successfully', type: Manager })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateManagerDto: UpdateManagerDto) {
    return this.managerService.update(+id, updateManagerDto);
  }

  @checkAbilites({ action: 'delete', subject: 'manager', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Delete a manager by its id' })
  @ApiNoContentResponse({ description: 'The manager has been deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.managerService.remove(+id);
  }

  @checkAbilites({ action: 'update', subject: 'manager', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Create a new avatar for the manager' })
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
    return this.managerService.uploadImage(+id, file);
  }
}
