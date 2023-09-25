import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Manager } from 'src/manager/entities/manager.entity';

@ApiTags('Reservation')
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @ApiOperation({ summary: 'Create a new reservation in the system' })
  @ApiCreatedResponse({
    description: 'A reservation has been created successfully',
    type: Reservation,
  })
  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.create(createReservationDto);
  }

  @ApiOperation({ summary: 'Get all reservations in the system' })
  @ApiOkResponse({ description: 'All reservation have been received', type: [Manager] })
  @Get()
  findAll() {
    return this.reservationService.findAll();
  }

  @ApiOperation({ summary: 'Get a reservation by its id' })
  @ApiOkResponse({ description: 'The reservation has been received', type: Manager })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a reservation by its id' })
  @ApiOkResponse({ description: 'The reservation has been updated successfully', type: Manager })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationService.update(+id, updateReservationDto);
  }

  @ApiOperation({ summary: 'Delete a reservation by its id' })
  @ApiNoContentResponse({ description: 'The reservation has been deleted successfully' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationService.remove(+id);
  }
}
