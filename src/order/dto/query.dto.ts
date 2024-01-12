import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

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
  @IsOptional()
  @IsString()
  @Matches(/^(?:[+\s]?\d{12}|\d{10}|\d{1,9})$/, {
    message: "Search must be rather client's phone number or integer id of the order",
  })
  search?: string;
  @ApiProperty({
    description: `Option which allow you to choose sorting like title:1 ASC or _id:-1 DESC \n
    If you want to sort by client's name use name:1 or name:-1 \n`,
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
