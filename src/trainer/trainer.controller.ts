import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  FileTypeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  MaxFileSizeValidator,
  Put,
} from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Trainer } from './entities/trainer.entity';
import { RolesGuard } from 'src/role/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from 'src/role/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { WorkingHoursValidationPipe } from 'src/pipes/workingHoursValidationPipe';
import { imageSchema } from 'src/storage/image.schema';

@ApiTags('Trainer')
@ApiBearerAuth()
@Permissions('superuser')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('trainer')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @ApiOperation({ summary: 'Create a new trainer in the system' })
  @ApiCreatedResponse({ description: 'A trainer has been created successfully', type: Trainer })
  @Post()
  create(
    @Request() req,
    @Body(new WorkingHoursValidationPipe()) createTrainerDto: CreateTrainerDto,
  ) {
    return this.trainerService.create(req.user.user_id, createTrainerDto);
  }

  @ApiOperation({ summary: 'Get all trainers in the system' })
  @ApiOkResponse({ description: 'All trainers have been received', type: [Trainer] })
  @Get()
  findAll() {
    return this.trainerService.findAll();
  }

  @ApiOperation({ summary: 'Get a trainer by its id' })
  @ApiOkResponse({ description: 'The trainer has been received', type: Trainer })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainerService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a trainer by its id' })
  @ApiOkResponse({ description: 'The trainer has been updated successfully', type: Trainer })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrainerDto: UpdateTrainerDto) {
    return this.trainerService.update(+id, updateTrainerDto);
  }

  @ApiOperation({ summary: 'Delete a trainer by its id' })
  @ApiNoContentResponse({ description: 'The trainer has been deleted successfully' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainerService.remove(+id);
  }

  @ApiOperation({ summary: 'Create a new avatar for the trainer' })
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
    return this.trainerService.uploadImage(+id, file);
  }
}
