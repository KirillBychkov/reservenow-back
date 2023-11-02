import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoggingService } from './logging.service';
import { checkAbilites } from 'src/role/abilities.decorator';
import { AbilitiesGuard } from 'src/role/abilities.guard';

@ApiTags('Logging')
@ApiBearerAuth()
@Controller('logging')
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @checkAbilites({ action: 'read', subject: 'logging' })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @Get()
  findAll() {
    return this.loggingService.findAll();
  }
}
