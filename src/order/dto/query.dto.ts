import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export default class ElementsQueryDto {
  @ApiProperty({ description: 'Id of the rental object you want to get all orders for' })
  rental_object_id?: number;
  @ApiProperty({ description: 'Id of the equipment you want to get all orders for' })
  equipment_id?: number;
  @ApiProperty({ description: 'Id of the trainers you want to get all orders for' })
  trainer_id?: number;
  @ApiProperty({ description: 'Id of the client you want to get all orders for' })
  client_id?: number;

  @ApiProperty({ description: 'How many orders to receive from the DB (10 by default)' })
  limit?: number;
  @ApiProperty({ description: 'How many orders to skip in the DB (0 by default)' })
  skip?: number;
  @ApiProperty({ description: "Id of the order or client's phone number" })
  search?: string;
  @ApiProperty({
    description: 'Option which allow you to choose sorting like title:1 ASC or _id:-1 DESC',
  })
  sort?: string;

  // Time range
  @ApiProperty({ description: 'Date from which you want to get orders' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ description: 'Date to which you want to get orders.' })
  @IsDateString()
  @IsOptional()
  end_date?: string;
}