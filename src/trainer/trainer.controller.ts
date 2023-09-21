import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Trainer } from './entities/trainer.entity';
import { RolesGuard } from 'src/role/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/role/role.decorator';

@ApiTags('Trainer')
@ApiBearerAuth()
@Roles('superuser')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('trainer')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @ApiOperation({ summary: 'Create a new trainer in the system' })
  @ApiCreatedResponse({ description: 'A trainer has been created successfully', type: Trainer })
  @Post()
  create(@Body() createTrainerDto: CreateTrainerDto) {
    return this.trainerService.create(createTrainerDto);
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
}
