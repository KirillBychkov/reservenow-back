import { Order } from '../entities/order.entity';

export default class FindAllOrdersDto {
  filters: {
    skip?: number;
    limit?: number;
    search?: string;
    sorted?: string;
    total: number;
    received: number;
  };
  data: Order[];
}
