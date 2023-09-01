import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { UpdateSupportDto } from './dto/update-support.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Support } from './entities/support.entity';
import IdPar from 'src/helpers/id.par';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  create(@Req() req, @Body() createSupportDto: CreateSupportDto): Promise<Support> {
    return this.supportService.create(req.user.user_id, createSupportDto);
  }

  @Roles('superuser')
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.supportService.findAll();
  }

  @Roles('superuser')
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: IdPar) {
    return this.supportService.findOne(+id.id);
  }

  @Roles('superuser')
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: IdPar, @Body() updateSupportDto: UpdateSupportDto) {
    return this.supportService.update(+id.id, updateSupportDto);
  }

  @Roles('superuser')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: IdPar) {
    return this.supportService.remove(+id.id);
  }
}
