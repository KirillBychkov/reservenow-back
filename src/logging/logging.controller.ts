import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/role/role.decorator';
import { RolesGuard } from 'src/role/role.guard';
import { LoggingService } from './logging.service';

@ApiTags('Logging')
@ApiBearerAuth()
@Permissions('logging')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('logging')
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get()
  findAll() {
    return this.loggingService.findAll();
  }
}
