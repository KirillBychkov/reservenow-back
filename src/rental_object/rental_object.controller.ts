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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { Permissions } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import { RentalObject } from './entities/rental_object.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateRentalObjectDto } from './dto/create-rental_object.dto';

@ApiTags('RentalObject')
@ApiBearerAuth()
@Permissions('rental_object')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('rental_object')
export class RentalObjectController {
  constructor(private readonly rentalObjectService: RentalObjectService) {}

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new rental object in the system' })
  @ApiCreatedResponse({ description: 'A new rental object has been created', type: RentalObject })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createRentalObjectDto: CreateRentalObjectDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.rentalObjectService.create(file, createRentalObjectDto);
  }

  @ApiOperation({ summary: 'Get all rental objects in the system' })
  @ApiOkResponse({ description: 'All rental objects have been received', type: [RentalObject] })
  @Get()
  findAll() {
    return this.rentalObjectService.findAll();
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
}
