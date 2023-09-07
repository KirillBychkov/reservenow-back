import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RentalObjectService } from './rental_object.service';
import { CreateRentalObjectDto } from './dto/create-rental_object.dto';
import { UpdateRentalObjectDto } from './dto/update-rental_object.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/role/role.decorator';
import {
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/role/role.guard';
import { RentalObject } from './entities/rental_object.entity';

@ApiTags('RentalObject')
@Roles('superuser')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('rental-object')
export class RentalObjectController {
  constructor(private readonly rentalObjectService: RentalObjectService) {}

  @ApiOperation({ summary: 'Create a new rental object in the system' })
  @Post()
  @ApiCreatedResponse({
    description: 'A new rental object has been created successfully',
    type: RentalObject,
  })
  create(@Body() createRentalObjectDto: CreateRentalObjectDto) {
    return this.rentalObjectService.create(createRentalObjectDto);
  }

  @ApiOperation({ summary: 'Get all rental objects in the system' })
  @Get()
  @ApiFoundResponse({ description: 'All rental objects have been received', type: [RentalObject] })
  findAll() {
    return this.rentalObjectService.findAll();
  }

  @ApiOperation({ summary: 'Get a rental object by its id' })
  @Get(':id')
  @ApiFoundResponse({ description: 'The rental object has been received', type: RentalObject })
  findOne(@Param('id') id: string) {
    console.log(id);
  }

  @ApiOperation({ summary: 'Update a rental object by its id' })
  @Patch(':id')
  @ApiOkResponse({
    description: 'The rental object has been updated successfully',
    type: RentalObject,
  })
  update(@Param('id') id: string, @Body() updateRentalObjectDto: UpdateRentalObjectDto) {
    return this.rentalObjectService.update(+id, updateRentalObjectDto);
  }

  @ApiOperation({ summary: 'Delete a rental object by its id' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The rental object has been deleted successfully' })
  remove(@Param('id') id: string) {
    return this.rentalObjectService.remove(+id);
  }
}
