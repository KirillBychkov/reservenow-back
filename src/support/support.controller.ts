import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/role/role.guard';
import { Permissions } from 'src/role/role.decorator';
import { Support } from './entities/support.entity';

@ApiTags('Support')
@ApiBearerAuth()
@Permissions('support')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @ApiOperation({ summary: 'Create a new support record in the system' })
  @ApiOkResponse({ description: 'A support record has been created successfully', type: Support })
  @Post()
  create(@Req() req, @Body() createSupportDto: CreateSupportDto) {
    return this.supportService.create(req.user.user_id, createSupportDto);
  }

  @Permissions('superuser')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all support records in the system' })
  @ApiOkResponse({ description: 'All support records have been received', type: [Support] })
  @Get()
  findAll() {
    return this.supportService.findAll();
  }

  @Permissions('superuser')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get a support record by its id' })
  @ApiOkResponse({ description: 'The support record has been received', type: Support })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(+id);
  }

  @Permissions('superuser')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a support record by its id' })
  @ApiOkResponse({ description: 'The support record has been updated successfully', type: Support })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSupportDto: UpdateSupportDto) {
    return this.supportService.update(+id, updateSupportDto);
  }

  @Permissions('superuser')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a support record by its id' })
  @ApiNoContentResponse({ description: 'The support record has been deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supportService.remove(+id);
  }
}
