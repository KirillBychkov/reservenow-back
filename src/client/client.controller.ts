import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ClientService } from './client.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { RolesGuard } from 'src/role/role.guard';
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
import { Permissions } from 'src/role/role.decorator';
import { Client } from './entities/client.entity';

@ApiTags('Client')
@ApiBearerAuth()
@Permissions('client')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiOperation({ summary: 'Create a new client in the system' })
  @Post()
  @ApiCreatedResponse({ description: 'A new client has been created successfully', type: Client })
  create(@Req() req, @Body() createClientDto: CreateClientDto) {
    return this.clientService.create(req.user.user_id, createClientDto);
  }

  @ApiOperation({ summary: 'Get all clients in the system' })
  @Get()
  @ApiFoundResponse({ description: 'All clients have been received', type: [Client] })
  findAll() {
    return this.clientService.findAll();
  }

  @ApiOperation({ summary: 'Get a client by its id' })
  @Get(':id')
  @ApiFoundResponse({ description: 'The client has been received', type: Client })
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a client by its id' })
  @Patch(':id')
  @ApiOkResponse({ description: 'The client has been updated successfully', type: Client })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(+id, updateClientDto);
  }

  @ApiOperation({ summary: 'Delete a client by its id' })
  @Delete(':id')
  @ApiNoContentResponse({ description: 'The client has been deleted successfully' })
  remove(@Param('id') id: string) {
    return this.clientService.remove(+id);
  }
}
