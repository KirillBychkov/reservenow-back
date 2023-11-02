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
  FileTypeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  Query,
  MaxFileSizeValidator,
  Put,
} from '@nestjs/common';
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
import { RentalObjectService } from './rental_object.service';
import { UpdateRentalObjectDto } from './dto/update-rental_object.dto';
import { AuthGuard } from '@nestjs/passport';
import { RentalObject } from './entities/rental_object.entity';
import { CreateRentalObjectDto } from './dto/create-rental_object.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { WorkingHoursValidationPipe } from 'src/pipes/workingHoursValidationPipe';
import { imageSchema } from 'src/storage/image.schema';
import ElementsQueryDto from './dto/query.dto';
import { AbilitiesGuard } from 'src/role/abilities.guard';

@ApiTags('RentalObject')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AbilitiesGuard)
@Controller('rental_object')
export class RentalObjectController {
  constructor(private readonly rentalObjectService: RentalObjectService) {}

  @ApiOperation({ summary: 'Create a new rental object in the system' })
  @ApiCreatedResponse({ description: 'A new rental object has been created', type: RentalObject })
  @Post()
  create(@Body(new WorkingHoursValidationPipe()) createRentalObjectDto: CreateRentalObjectDto) {
    return this.rentalObjectService.create(createRentalObjectDto);
  }

  @ApiOperation({ summary: 'Get all rental objects in the system' })
  @ApiOkResponse({ description: 'All rental objects have been received', type: [RentalObject] })
  @Get()
  findAll(@Query() query: ElementsQueryDto) {
    return this.rentalObjectService.findAll(query);
  }

  @ApiOperation({ summary: "Get all user's rental objects in the system" })
  @ApiOkResponse({ description: 'All rental objects have been received', type: [RentalObject] })
  @Get(':organizationId')
  findAllByOrganization(
    @Param('organizationId') organizationId: string,
    @Query() query: ElementsQueryDto,
  ) {
    return this.rentalObjectService.findAllByOrganization(+organizationId, query);
  }

  @ApiOperation({ summary: 'Get a rental object by its id' })
  @ApiOkResponse({ description: 'The rental object has been received', type: RentalObject })
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.rentalObjectService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a rental object by its id' })
  @ApiOkResponse({ description: 'The rental object has been updated', type: RentalObject })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRentalObjectDto: UpdateRentalObjectDto) {
    return this.rentalObjectService.update(+id, updateRentalObjectDto);
  }

  @ApiOperation({ summary: 'Delete a rental object by its id' })
  @ApiNoContentResponse({ description: 'The rental object has been deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentalObjectService.remove(+id);
  }

  @ApiOperation({ summary: 'Create a new image for the rental object' })
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
    return this.rentalObjectService.uploadImage(+id, file);
  }
}
