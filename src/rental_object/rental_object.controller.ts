import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RentalObjectService } from './rental_object.service';
import { CreateRentalObjectDto } from './dto/create-rental_object.dto';
import { UpdateRentalObjectDto } from './dto/update-rental_object.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/role/role.decorator';

@UseGuards(AuthGuard('jwt'))
@Roles('superuser')
@Controller('rental-object')
export class RentalObjectController {
  constructor(private readonly rentalObjectService: RentalObjectService) {}

  @Post()
  create(@Body() createRentalObjectDto: CreateRentalObjectDto) {
    return this.rentalObjectService.create(createRentalObjectDto);
  }

  @Get()
  findAll() {
    return this.rentalObjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentalObjectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRentalObjectDto: UpdateRentalObjectDto) {
    return this.rentalObjectService.update(+id, updateRentalObjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentalObjectService.remove(+id);
  }
}
