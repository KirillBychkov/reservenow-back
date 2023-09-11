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
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RentalObjectService } from './rental_object.service';
import { CreateRentalObjectDto } from './dto/create-rental_object.dto';
import { UpdateRentalObjectDto } from './dto/update-rental_object.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import { RentalObject } from './entities/rental_object.entity';

@ApiTags('RentalObject')
@Roles('superuser')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('rental-object')
export class RentalObjectController {
  constructor(private readonly rentalObjectService: RentalObjectService) {}

  @ApiOperation({ summary: 'Create a new rental object in the system' })
  @ApiCreatedResponse({ description: 'A new rental object has been created', type: RentalObject })
  @Post()
  create(@Body() createRentalObjectDto: CreateRentalObjectDto) {
    return this.rentalObjectService.create(createRentalObjectDto);
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
