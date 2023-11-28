import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ClientService } from './client.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiFoundResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { Client } from './entities/client.entity';
import { checkAbilites } from 'src/role/abilities.decorator';
import { AbilitiesGuard } from 'src/role/abilities.guard';

@ApiTags('Client')
@ApiBearerAuth()
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @checkAbilites({ action: 'create', subject: 'client' })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Create a new client in the system' })
  @Post()
  @ApiCreatedResponse({ description: 'A new client has been created successfully', type: Client })
  create(@Req() req, @Body() createClientDto: CreateClientDto) {
    return this.clientService.create(req.user.user_id, createClientDto);
  }

  @checkAbilites({ action: 'read', subject: 'client' })
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all clients in the system' })
  @Get()
  @ApiFoundResponse({ description: 'All clients have been received', type: [Client] })
  findAll(@Req() req) {
    return this.clientService.findAll(req.user.user_id);
  }

  @checkAbilites({ action: 'read', subject: 'client', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Get a client by its id' })
  @Get(':id')
  @ApiFoundResponse({ description: 'The client has been received', type: Client })
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(+id);
  }

  @checkAbilites({ action: 'update', subject: 'client', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Update a client by its id' })
  @Patch(':id')
  @ApiOkResponse({ description: 'The client has been updated successfully', type: Client })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(+id, updateClientDto);
  }

  @checkAbilites({ action: 'delete', subject: 'client', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Delete a client by its id' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The client has been deleted successfully' })
  remove(@Param('id') id: string) {
    return this.clientService.remove(+id);
  }
}
