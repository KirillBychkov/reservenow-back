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
  Req,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { checkAbilites } from 'src/role/abilities.decorator';
import { AbilitiesGuard } from 'src/role/abilities.guard';
import ElementsQueryDto from './dto/query.dto';

@ApiTags('Order')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @checkAbilites({ action: 'create', subject: 'order' })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Create a new order in the system' })
  @ApiCreatedResponse({ description: 'An order has been created successfully', type: Order })
  @Post()
  create(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(+req.user.user_id, createOrderDto);
  }

  @ApiOperation({ summary: 'Get all orders in the system' })
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ description: 'All orders have been received', type: [Order] })
  @Get()
  findAll(@Req() req, @Query() query: ElementsQueryDto) {
    return this.orderService.findAll(query, +req.user.user_id);
  }

  @ApiOperation({ summary: 'Get all orders with trainer' })
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ description: 'All orders have been received', type: [Order] })
  @Get('withTrainer')
  findAllWithTrainer(@Req() req) {
    return this.orderService.findAllWithTrainer(+req.user.user_id);
  }

  @checkAbilites({ action: 'read', subject: 'order', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Get an order by its id' })
  @ApiOkResponse({ description: 'The order has been received', type: Order })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @checkAbilites({ action: 'update', subject: 'order', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Update an order by its id' })
  @ApiOkResponse({ description: 'The order has been updated successfully', type: Order })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @checkAbilites({ action: 'delete', subject: 'order', conditions: true })
  @UseGuards(AuthGuard('jwt'), AbilitiesGuard)
  @ApiOperation({ summary: 'Delete an order by its id' })
  @ApiNoContentResponse({ description: 'The order has been deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
