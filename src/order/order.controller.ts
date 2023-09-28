import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Permissions } from 'src/role/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/role/role.guard';
import { Order } from './entities/order.entity';

@ApiTags('Order')
@ApiBearerAuth()
@Permissions('order')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Create a new order in the system' })
  @ApiCreatedResponse({ description: 'An order has been created successfully', type: Order })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @ApiOperation({ summary: 'Get all orders in the system' })
  @ApiOkResponse({ description: 'All oders have been received', type: [Order] })
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @ApiOperation({ summary: 'Get an order by its id' })
  @ApiOkResponse({ description: 'The order has been received', type: Order })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update an order by its id' })
  @ApiOkResponse({ description: 'The order has been updated successfully', type: Order })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @ApiOperation({ summary: 'Delete an order by its id' })
  @ApiNoContentResponse({ description: 'The order has been deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
